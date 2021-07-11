import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

export function useSelector<S, R>(
  state$: Observable<S>,
  initialState: S,
  selector: (state: S) => R,
  compare: (v1: R, v2: R) => boolean = Object.is,
): R {
  const [value, setValue] = useState<R>(() => selector(initialState));

  useEffect(() => {
    const subscription = state$.subscribe((state) => {
      const value = selector(state);
      setValue((prevValue) => (compare(value, prevValue) ? prevValue : value));
    });

    return () => subscription.unsubscribe();
  }, [compare, selector, state$]);

  return value;
}
