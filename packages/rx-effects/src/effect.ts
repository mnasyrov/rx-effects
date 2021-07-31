import { from, identity, merge, Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action } from './action';
import { StateQuery } from './stateQuery';
import { createStore } from './store';

export type EffectHandler<Event, Result> = (
  event: Event,
) => Result | Promise<Result> | Observable<Result>;

export type HandlerOptions<ErrorType = Error> = {
  onSourceCompleted?: () => void;
  onSourceFailed?: (error: ErrorType) => void;
};

export type EffectState<Event, Result = void, ErrorType = Error> = {
  readonly result$: Observable<Result>;
  readonly done$: Observable<{ event: Event; result: Result }>;
  readonly error$: Observable<{ event: Event; error: ErrorType }>;
  readonly final$: Observable<Event>;
  readonly pending: StateQuery<boolean>;
  readonly pendingCount: StateQuery<number>;
};

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

export function createEffect<Event = void, Result = void, ErrorType = Error>(
  handler: EffectHandler<Event, Result>,
): Effect<Event, Result, ErrorType> {
  const subscriptions = new Subscription();

  const done$ = new Subject<{ event: Event; result: Result }>();
  const error$ = new Subject<{ event: Event; error: ErrorType }>();

  const pendingCount = createStore<number>(0);
  const increaseCount = (count: number): number => count + 1;
  const decreaseCount = (count: number): number => count - 1;

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
      error$.next({ event, error });
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
    destroy: () => subscriptions.unsubscribe(),
  };
}
