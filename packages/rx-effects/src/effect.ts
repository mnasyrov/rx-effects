import {
  defer,
  identity,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  OperatorFunction,
  retry,
  Subject,
  Subscription,
  tap,
} from 'rxjs';
import { Action } from './action';
import { Controller } from './controller';
import { Query } from './query';
import { createStore, InternalStoreOptions } from './store';

export type EffectResult<Event, Value> = Readonly<{
  event: Event;
  result: Value;
}>;

export type EffectErrorOrigin = 'source' | 'handler';

export type EffectError<Event, ErrorType> = Readonly<
  | {
      origin: 'source';
      event?: undefined;
      error: any;
    }
  | {
      origin: 'handler';
      event: Event;
      error: ErrorType;
    }
>;

export type EffectNotification<Event, Result, ErrorType> = Readonly<
  | ({ type: 'result' } & EffectResult<Event, Result>)
  | ({ type: 'error' } & EffectError<Event, ErrorType>)
>;

const GLOBAL_EFFECT_UNHANDLED_ERROR_SUBJECT = new Subject<
  EffectError<unknown, unknown>
>();

export const GLOBAL_EFFECT_UNHANDLED_ERROR$ =
  GLOBAL_EFFECT_UNHANDLED_ERROR_SUBJECT.asObservable();

function emitGlobalUnhandledError(
  effectError: EffectError<unknown, unknown>,
): void {
  if (GLOBAL_EFFECT_UNHANDLED_ERROR_SUBJECT.observed) {
    GLOBAL_EFFECT_UNHANDLED_ERROR_SUBJECT.next(effectError);
  } else {
    console.error('Uncaught error in Effect', effectError);
  }
}

/**
 * Handler for an event. It can be asynchronous.
 *
 * @result a result, Promise or Observable
 */
export type EffectHandler<Event, Result> = (
  event: Event,
) => Result | Promise<Result> | Observable<Result>;

/**
 * Details about performing the effect.
 */
export type EffectState<Event, Result = void, ErrorType = Error> = Readonly<{
  /** Provides a result of successful execution of the handler */
  result$: Observable<Result>;

  /** Provides a source event and a result of successful execution of the handler */
  done$: Observable<EffectResult<Event, Result>>;

  /** Provides an error emitter by a source (`event` is `undefined`)
   * or by the handler (`event` is not `undefined`) */
  error$: Observable<EffectError<Event, ErrorType>>;

  /** Provides a notification after execution of the handler for both success or error result  */
  final$: Observable<EffectNotification<Event, Result, ErrorType>>;

  /** Provides `true` if there is any execution of the handler in progress */
  pending: Query<boolean>;

  /** Provides a count of the handler in progress */
  pendingCount: Query<number>;
}>;

export type EffectEventProject<Event, Result> = (
  event: Event,
) => Observable<Result>;

export type EffectPipeline<Event, Result> = (
  eventProject: EffectEventProject<Event, Result>,
) => OperatorFunction<Event, Result>;

const DEFAULT_MERGE_MAP_PIPELINE: EffectPipeline<any, any> = (eventProject) =>
  mergeMap(eventProject);

export type EffectOptions<Event, Result> = Readonly<{
  /**
   * Custom pipeline for processing effect's events.
   *
   * `mergeMap` pipeline is used by default.
   */
  pipeline?: EffectPipeline<Event, Result>;
}>;

/**
 * Effect encapsulates a handler for Action or Observable.
 *
 * It provides the state of execution results, which can be used to construct
 * a graph of business logic.
 *
 * Effect collects all internal subscriptions, and provides `destroy()` methods
 * unsubscribe from them and deactivate the effect.
 */
export type Effect<Event, Result = void, ErrorType = Error> = Controller<
  EffectState<Event, Result, ErrorType> & {
    handle: (
      source: Action<Event> | Observable<Event> | Query<Event>,
    ) => Subscription;
  }
>;

const increaseCount = (count: number): number => count + 1;
const decreaseCount = (count: number): number => count - 1;

/**
 * Creates `Effect` from the provided handler.
 *
 * @example
 * ```ts
 * const sumEffect = createEffect<{a: number, b: number}, number>((event) => {
 *   return a + b;
 * });
 * ```
 */
export function createEffect<Event = void, Result = void, ErrorType = Error>(
  handler: EffectHandler<Event, Result>,
  options?: EffectOptions<Event, Result>,
): Effect<Event, Result, ErrorType> {
  const pipeline: EffectPipeline<Event, Result> =
    options?.pipeline ?? DEFAULT_MERGE_MAP_PIPELINE;

  const subscriptions = new Subscription();

  const event$: Subject<Event> = new Subject();
  const done$: Subject<EffectResult<Event, Result>> = new Subject();
  const error$: Subject<EffectError<Event, ErrorType>> = new Subject();
  const pendingCount = createStore<number>(0, {
    internal: true,
  } as InternalStoreOptions<number>);

  subscriptions.add(() => {
    event$.complete();
    done$.complete();
    error$.complete();
    pendingCount.destroy();
  });

  function emitError(effectError: EffectError<Event, ErrorType>) {
    if (error$.observed) {
      error$.next(effectError);
    } else {
      emitGlobalUnhandledError(effectError);
    }
  }

  const eventProject: EffectEventProject<Event, Result> = (event: Event) => {
    return defer(() => {
      pendingCount.update(increaseCount);

      const result = handler(event);

      return result instanceof Observable || result instanceof Promise
        ? result
        : of(result);
    }).pipe(
      tap({
        next: (result) => {
          done$.next({ event, result });
        },
        complete: () => {
          pendingCount.update(decreaseCount);
        },
        error: (error) => {
          pendingCount.update(decreaseCount);

          emitError({ origin: 'handler', event, error });
        },
      }),
    );
  };

  subscriptions.add(event$.pipe(pipeline(eventProject), retry()).subscribe());

  function handle(
    source: Observable<Event> | Action<Event> | Query<Event>,
  ): Subscription {
    const observable = getSourceObservable(source);

    const subscription = observable.subscribe({
      next: (event) => event$.next(event),
      error: (error) => emitError({ origin: 'source', error }),
    });
    subscriptions.add(subscription);

    return subscription;
  }

  const notifications$: Observable<
    EffectNotification<Event, Result, ErrorType>
  > = merge(
    done$.pipe(
      map<
        EffectResult<Event, Result>,
        EffectNotification<Event, Result, ErrorType>
      >((entry) => ({ type: 'result', ...entry })),
    ),

    error$.pipe(
      map<
        EffectError<Event, ErrorType>,
        EffectNotification<Event, Result, ErrorType>
      >((entry) => ({ type: 'error', ...entry })),
    ),
  );

  return {
    done$: done$.asObservable(),
    result$: done$.pipe(map(({ result }) => result)),
    error$: error$.asObservable(),
    final$: notifications$,
    pending: pendingCount.query((count) => count > 0),
    pendingCount: pendingCount.query(identity),

    handle,

    destroy: () => {
      subscriptions.unsubscribe();
    },
  };
}

function getSourceObservable<T>(
  source: Observable<T> | Action<T> | Query<T>,
): Observable<T> {
  const type = typeof source;

  if (type === 'function' && 'event$' in source) {
    return source.event$;
  }

  if (type === 'object' && 'value$' in source) {
    return source.value$;
  }

  if (source instanceof Observable) {
    return source;
  }

  throw new TypeError('Unexpected source type');
}
