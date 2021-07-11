import { identity, Observable } from 'rxjs';
import { useSelector } from './useSelector';

export function useObservable<T>(
  source$: Observable<T>,
  initialValue: T,
  compare?: (v1: T, v2: T) => boolean,
): T {
  return useSelector(source$, initialValue, identity, compare);
}
