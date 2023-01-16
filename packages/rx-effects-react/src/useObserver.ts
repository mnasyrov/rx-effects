import { useEffect, useLayoutEffect, useRef } from 'react';
import { Observable, PartialObserver, Subscription } from 'rxjs';
import { useConst } from './useConst';

/**
 * Subscribes the provided observer or `next` handler on `source$` observable.
 *
 * This hook allows to do fine handling of the source observable.
 *
 * @param source$ an observable
 * @param observerOrNext `Observer` or `next` handler
 *
 * @example
 * ```ts
 * useObserver(source$, (nextValue) => {
 *   logger.log(nextValue);
 * });
 * ```
 */
export function useObserver<T>(
  source$: Observable<T>,
  observerOrNext: PartialObserver<T> | ((value: T) => void),
): Subscription {
  const hookSubscriptions = useConst(() => new Subscription());

  const argsRef = useRef<PartialObserver<T> | ((value: T) => void)>(
    observerOrNext,
  );

  // Update the latest observable and callbacks
  // synchronously after render being committed
  useIsomorphicLayoutEffect(() => {
    argsRef.current = observerOrNext;
  });

  useEffect(() => {
    if (hookSubscriptions.closed) {
      return;
    }

    const subscription = source$.subscribe({
      next: (value) => {
        const nextObserver =
          typeof argsRef.current === 'function'
            ? argsRef.current
            : argsRef.current.next;

        if (nextObserver) {
          return nextObserver(value);
        }
      },
      error: (error) => {
        const errorObserver =
          typeof argsRef.current !== 'function' && argsRef.current.error;

        if (errorObserver) {
          return errorObserver(error);
        }
      },
      complete: () => {
        const completeObserver =
          typeof argsRef.current !== 'function' && argsRef.current.complete;

        if (completeObserver) {
          return completeObserver();
        }
      },
    });
    hookSubscriptions.add(subscription);
    return () => subscription.unsubscribe();
  }, [hookSubscriptions, source$]);

  useEffect(() => {
    return () => hookSubscriptions.unsubscribe();
  }, [hookSubscriptions]);

  return hookSubscriptions;
}

export function isBrowser() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return typeof window !== 'undefined';
}

/**
 * Prevent React warning when using useLayoutEffect on server.
 */
export const useIsomorphicLayoutEffect = isBrowser()
  ? useLayoutEffect
  : /* istanbul ignore next: both are not called on server */
    useEffect;
