import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';
import { DEFAULT_COMPARATOR } from './utils';

/**
 * Returns a value provided by `source$`.
 *
 * The hook returns the initial value and subscribes on the `source$`. After
 * that, the hook returns values which are provided by the source.
 *
 * @param source$ an observable for values
 * @param initialValue th first value which is returned by the hook
 * @param selector a transform function for getting a derived value based on
 *   the source value
 * @param comparator a comparator for previous and next values
 *
 * @example
 * ```ts
 * const value = useSelector<{data: Record<string, string>}>(
 *   source$,
 *   undefined,
 *   (state) => state.data,
 *   (data1, data2) => data1.key === data2.key
 * );
 * ```
 */
export function useSelector<S, R>(
  source$: Observable<S>,
  initialValue: S,
  selector: (state: S) => R,
  comparator: (v1: R, v2: R) => boolean = DEFAULT_COMPARATOR,
): R {
  const [value, setValue] = useState<R>(() => selector(initialValue));

  useEffect(() => {
    const subscription = source$.subscribe((state) => {
      const value = selector(state);
      setValue((prevValue) =>
        comparator(value, prevValue) ? prevValue : value,
      );
    });

    return () => subscription.unsubscribe();
  }, [comparator, selector, source$]);

  return value;
}
