import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type StateQuery<T> = {
  readonly get: () => T;
  readonly value$: Observable<T>;
};

export function mapStateQuery<T, R>(
  query: StateQuery<T>,
  mapper: (value: T) => R,
): StateQuery<R> {
  return {
    get: () => mapper(query.get()),
    value$: query.value$.pipe(map(mapper)),
  };
}
