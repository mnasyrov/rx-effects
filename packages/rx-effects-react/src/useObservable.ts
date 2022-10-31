import { identity, Observable } from 'rxjs';
import { useSelector } from './useSelector';

/**
 * Returns a value provided by `source$`.
 *
 * The hook returns the initial value and subscribes on the `source$`. After
 * that, the hook returns values which are provided by the source.
 *
 * @param source$ an observable for values
 * @param initialValue th first value which is returned by the hook
 * @param comparator a comparator for previous and next values
 *
 * @example
 * ```ts
 * const value = useObservable<string>(source$, undefined);
 * ```
 */
export function useObservable<T>(
  source$: Observable<T>,
  initialValue: T,
  comparator?: (v1: T, v2: T) => boolean,
): T {
  return useSelector(source$, initialValue, identity, comparator);
}
