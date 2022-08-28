import { from, identity, merge, Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action } from './action';
import { declareState } from './stateDeclaration';
import { Query } from './queries';

/**
 * Handler for an event. It can be asynchronous.
 *
 * @result a result, Promise or Observable
 */
export type EffectHandler<Event, Result> = (
  event: Event,
) => Result | Promise<Result> | Observable<Result>;

/**
 * Options for handling an action or observable.
 */
export type HandlerOptions<ErrorType = Error> = Readonly<{
  onSourceCompleted?: () => void;
  onSourceFailed?: (error: ErrorType) => void;
}>;

/**
 * Details about performing the effect.
 */
export type EffectState<Event, Result = void, ErrorType = Error> = {
  /** `result$` provides a result of successful execution of the handler */
  readonly result$: Observable<Result>;

  /** `done$` provides a source event and a result of successful execution of the handler */
  readonly done$: Observable<{ event: Event; result: Result }>;

  /** `done$` provides a source event and an error if the handler fails */
  readonly error$: Observable<{ event: Event; error: ErrorType }>;

  /** `final$` provides a source event after execution of the handler, for both success and error result */
  readonly final$: Observable<Event>;

  /** Provides `true` if there is any execution of the handler in progress */
  readonly pending: Query<boolean>;

  /** Provides a count of the handler in progress */
  readonly pendingCount: Query<number>;
};

/**
 * Effect encapsulates a handler for Action or Observable.
 *
 * It provides the state of execution results, which can be used to construct
 * a graph of business logic.
 *
 * Effect collects all internal subscriptions, and provides `destroy()` methods
 * unsubscribe from them and deactivate the effect.
 */
export type Effect<Event, Result = void, ErrorType = Error> = EffectState<
  Event,
  Result,
  ErrorType
> & {
  readonly handle: (
    source: Action<Event> | Observable<Event>,
    options?: HandlerOptions<ErrorType>,
  ) => Subscription;

  readonly destroy: () => void;
};

const PENDING_COUNT_STATE = declareState(0, { internal: true });
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
): Effect<Event, Result, ErrorType> {
  const subscriptions = new Subscription();

  const done$ = new Subject<{ event: Event; result: Result }>();
  const error$ = new Subject<{ event: Event; error: ErrorType }>();

  const pendingCount = PENDING_COUNT_STATE.createStore();

  function applyHandler(event: Event): void {
    pendingCount.update(increaseCount);

    try {
      const handlerResult = handler(event);

      if (
        handlerResult instanceof Promise ||
        handlerResult instanceof Observable
      ) {
        subscriptions.add(executeObservable(event, from(handlerResult)));
        return;
      }

      pendingCount.update(decreaseCount);
      done$.next({ event, result: handlerResult });
    } catch (error) {
      pendingCount.update(decreaseCount);
      error$.next({ event, error: error as ErrorType });
    }
  }

  function executeObservable(
    event: Event,
    observable: Observable<Result>,
  ): Subscription {
    return observable.subscribe({
      next: (result) => {
        done$.next({ event, result });
      },
      complete: () => {
        pendingCount.update(decreaseCount);
      },
      error: (error) => {
        pendingCount.update(decreaseCount);
        error$.next({ event, error });
      },
    });
  }

  function handle<SourceErrorType = Error>(
    source: Observable<Event> | Action<Event>,
    options?: HandlerOptions<SourceErrorType>,
  ): Subscription {
    const observable = (
      source instanceof Observable ? source : source.event$
    ) as Observable<Event>;

    const subscription = observable.subscribe({
      next: (event) => applyHandler(event),
      error: (error) => options?.onSourceFailed?.(error),
      complete: () => options?.onSourceCompleted?.(),
    });
    subscriptions.add(subscription);

    return subscription;
  }

  return {
    done$: done$.asObservable(),
    result$: done$.pipe(map(({ result }) => result)),
    error$: error$.asObservable(),
    final$: merge(done$, error$).pipe(map(({ event }) => event)),
    pending: pendingCount.query((count) => count > 0),
    pendingCount: pendingCount.query(identity),

    handle,
    destroy: () => {
      subscriptions.unsubscribe();
      done$.complete();
      error$.complete();
      pendingCount.destroy();
    },
  };
}
