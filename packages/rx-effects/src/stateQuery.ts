import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type StateQuery<T> = {
  readonly get: () => T;
  readonly value$: Observable<T>;
};

export function mapQuery<T, R>(
  query: StateQuery<T>,
  mapper: (value: T) => R,
): StateQuery<R> {
  return {
    get: () => mapper(query.get()),
    value$: query.value$.pipe(map(mapper)),
  };
}

export function mergeQueries<
  Queries extends StateQuery<unknown>[],
  Values extends {
    [K in keyof Queries]: Queries[K] extends StateQuery<infer V> ? V : never;
  },
  Result,
>(queries: Queries, merger: (values: Values) => Result): StateQuery<Result> {
  const value$ = combineLatest(queries.map((query) => query.value$)).pipe(
    map((values) => merger(values as Values)),
  );

  return {
    get: () => merger(queries.map((query) => query.get()) as Values),
    value$,
  };
}
