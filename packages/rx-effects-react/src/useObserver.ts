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

  const argsRef = useRef<
    [Observable<T>, PartialObserver<T> | ((value: T) => void)]
  >([source$, observerOrNext]);

  // Update the latest observable and callbacks
  // synchronously after render being committed
  useIsomorphicLayoutEffect(() => {
    argsRef.current = [source$, observerOrNext];
  });

  useEffect(() => {
    if (!hookSubscriptions.closed) {
      const input$ = argsRef.current[0];

      const subscription = input$.subscribe({
        next: (value) => {
          if (input$ !== argsRef.current[0]) {
            // stale observable
            return;
          }
          const nextObserver =
            (argsRef.current[1] as PartialObserver<T>)?.next ||
            (argsRef.current[1] as ((value: T) => void) | null | undefined);
          if (nextObserver) {
            return nextObserver(value);
          }
        },
        error: (error) => {
          if (input$ !== argsRef.current[0]) {
            // stale observable
            return;
          }
          const errorObserver = (argsRef.current[1] as PartialObserver<T>)
            ?.error;
          if (errorObserver) {
            return errorObserver(error);
          }
        },
        complete: () => {
          if (input$ !== argsRef.current[0]) {
            // stale observable
            return;
          }
          const completeObserver = (argsRef.current[1] as PartialObserver<T>)
            ?.complete;
          if (completeObserver) {
            return completeObserver();
          }
        },
      });
      hookSubscriptions.add(subscription);
      return () => subscription.unsubscribe();
    }
    return undefined;
  }, [hookSubscriptions, source$]);

  useEffect(() => {
    return () => hookSubscriptions.unsubscribe();
  }, [hookSubscriptions]);

  return hookSubscriptions;
}

function isBrowser() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return typeof window !== 'undefined';
}

/**
 * Prevent React warning when using useLayoutEffect on server.
 */
const useIsomorphicLayoutEffect = isBrowser()
  ? useLayoutEffect
  : /* istanbul ignore next: both are not called on server */
    useEffect;
