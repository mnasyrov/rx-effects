import { useEffect, useRef } from 'react';
import { Observable, Observer } from 'rxjs';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

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
): void {
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
    const subscription = source$.subscribe({
      next: (value) => argsRef.current?.next?.(value),
      error: (error) => argsRef.current?.error?.(error),
      complete: () => argsRef.current?.complete?.(),
    });

    return () => subscription.unsubscribe();
  }, [source$]);
}
