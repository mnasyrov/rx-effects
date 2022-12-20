import {
  defer,
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
import { createEffectController } from './effectController';
import { EffectState } from './effectState';
import { Query } from './query';

/**
 * Handler for an event. It can be asynchronous.
 *
 * @result a result, Promise or Observable
 */
export type EffectHandler<Event, Result> = (
  event: Event,
) => Result | Promise<Result> | Observable<Result>;

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

  const event$: Subject<Event> = new Subject();
  const controller = createEffectController<Event, Result, ErrorType>();

  const subscriptions = new Subscription(() => {
    event$.complete();
    controller.destroy();
  });

  const eventProject: EffectEventProject<Event, Result> = (event: Event) => {
    return defer(() => {
      controller.start();

      const result = handler(event);

      return result instanceof Observable || result instanceof Promise
        ? result
        : of(result);
    }).pipe(
      tap({
        next: (result) => {
          controller.next({ event, result });
        },
        complete: () => {
          controller.complete();
        },
        error: (error) => {
          controller.error({ origin: 'handler', event, error });
        },
      }),
    );
  };

  subscriptions.add(event$.pipe(pipeline(eventProject), retry()).subscribe());

  return {
    ...controller.state,

    handle(
      source: Observable<Event> | Action<Event> | Query<Event>,
    ): Subscription {
      const observable = getSourceObservable(source);

      const subscription = observable.subscribe({
        next: (event) => event$.next(event),
        error: (error) => controller.error({ origin: 'source', error }),
      });
      subscriptions.add(subscription);

      return subscription;
    },

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
