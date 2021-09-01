import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Provider for a value of a state.
 */
export type StateQuery<T> = {
  /** Returns the value of a state */
  readonly get: () => T;

  /** `Observable` for value changes.  */
  readonly value$: Observable<T>;
};

/**
 * Returns a new `StateQuery` which maps a source value by the provided mapping
 * function.
 *
 * @param query source query
 * @param mapper value mapper
 */
export function mapQuery<T, R>(
  query: StateQuery<T>,
  mapper: (value: T) => R,
): StateQuery<R> {
  return {
    get: () => mapper(query.get()),
    value$: query.value$.pipe(map(mapper)),
  };
}

/**
 * Returns a new `StateQuery` which takes the latest values from source queries
 * and merges them into a single value.
 *
 * @param queries source queries
 * @param merger value merger
 */
export function mergeQueries<Values extends unknown[], Result>(
  queries: [
    ...{
      [K in keyof Values]: StateQuery<Values[K]>;
    }
  ],
  merger: (...values: Values) => Result,
): StateQuery<Result> {
  const value$ = combineLatest(queries.map((query) => query.value$)).pipe(
    map((values) => merger(...(values as Values))),
  );

  return {
    get: () => merger(...(queries.map((query) => query.get()) as Values)),
    value$,
  };
}
