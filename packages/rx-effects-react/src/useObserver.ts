import { useEffect, useLayoutEffect, useRef } from 'react';
import { Observable, Observer, Subscription } from 'rxjs';
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
  observerOrNext: Partial<Observer<T>> | ((value: T) => void),
): Subscription {
  const hookSubscriptions = useConst(() => new Subscription());

  const argsRef = useRef<Partial<Observer<T>>>();

  // Update the latest observable and callbacks
  // synchronously after render being committed
  useIsomorphicLayoutEffect(() => {
    argsRef.current =
      typeof observerOrNext === 'function'
        ? { next: observerOrNext }
        : observerOrNext;
  });

  useEffect(() => {
    if (hookSubscriptions.closed) {
      return;
    }

    const subscription = source$.subscribe({
      next: (value) => argsRef.current?.next?.(value),
      error: (error) => argsRef.current?.error?.(error),
      complete: () => argsRef.current?.complete?.(),
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
