import {
  identity,
  merge,
  Observable,
  Observer,
  Subject,
  Subscription,
} from 'rxjs';
import { map } from 'rxjs/operators';
import { Action } from './action';
import { StateQuery } from './stateQuery';
import { createStateStore } from './stateStore';

export type Effect<Event, Result = void, ErrorType = Error> = Readonly<{
  result$: Observable<Result>;
  done$: Observable<{ event: Event; result: Result }>;
  error$: Observable<{ event: Event; error: ErrorType }>;
  final$: Observable<Event>;
  pending: StateQuery<boolean>;
  pendingCount: StateQuery<number>;

  handle: ((event$: Observable<Event>) => Subscription) &
    ((action: Action<Event>) => Subscription);
  destroy: () => void;
}>;

export type EffectHandler<Event, Result> = (
  event: Event,
) => Result | Promise<Result> | Observable<Result>;

export function createEffect<Event, Result = void, ErrorType = Error>(
  handler: EffectHandler<Event, Result>,
  scopeSubscriptions?: Subscription,
): Effect<Event, Result, ErrorType> {
  const subscriptions = new Subscription();

  if (scopeSubscriptions) {
    scopeSubscriptions.add(subscriptions);
  }

  const done$ = new Subject<{ event: Event; result: Result }>();
  const error$ = new Subject<{ event: Event; error: ErrorType }>();

  const pendingCount = createStateStore<number>(0);
  const increaseCount = (count: number): number => count + 1;
  const decreaseCount = (count: number): number => count - 1;

  function executePromise(event: Event, promise: Promise<Result>): void {
    promise
      .then((result) => {
        pendingCount.update(decreaseCount);
        done$.next({ event, result });
      })
      .catch((error) => {
        pendingCount.update(decreaseCount);
        error$.next({ event, error });
      });
  }

  function executeObservable(
    event: Event,
    observable: Observable<Result>,
  ): void {
    observable.subscribe({
      next: (result) => {
        pendingCount.update(decreaseCount);
        done$.next({ event, result });
      },
      error: (error) => {
        pendingCount.update(decreaseCount);
        error$.next({ event, error });
      },
    });
  }

  function execute(event: Event): void {
    pendingCount.update(increaseCount);

    try {
      const handlerResult = handler(event);

      if (handlerResult) {
        if ('then' in handlerResult) {
          executePromise(event, handlerResult);
          return;
        }

        if (handlerResult instanceof Observable) {
          executeObservable(event, handlerResult);
          return;
        }
      }

      pendingCount.update(decreaseCount);
      done$.next({ event, result: handlerResult });
    } catch (error) {
      pendingCount.update(decreaseCount);
      error$.next({ event, error });
    }
  }

  const observer: Observer<Event> = {
    next: (event) => execute(event),
    error: (error) => {
      done$.error(error);
      error$.error(error);
    },
    complete: () => {
      done$.complete();
      error$.complete();
    },
  };

  function handle(source: Observable<Event> | Action<Event>): Subscription {
    const observable = source instanceof Observable ? source : source.event$;

    const subscription = observable.subscribe(observer);
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
