import { useEffect } from 'react';
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
 * const observer = useCallback((nextValue) => {
 *   logger.log(nextValue);
 * }, []);
 * useObserver(source$, observer);
 * ```
 */
export function useObserver<T>(
  source$: Observable<T>,
  observerOrNext: Partial<Observer<T>> | ((value: T) => void),
): Subscription {
  const hookSubscriptions = useConst(() => new Subscription());

  useEffect(() => {
    if (!hookSubscriptions.closed) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: subscribe cannot infer the right type.
      const subscription = source$.subscribe(observerOrNext);
      hookSubscriptions.add(subscription);
      return () => subscription.unsubscribe();
    }
    return undefined;
  }, [hookSubscriptions, source$, observerOrNext]);

  useEffect(() => {
    return () => hookSubscriptions.unsubscribe();
  }, [hookSubscriptions]);

  return hookSubscriptions;
}
