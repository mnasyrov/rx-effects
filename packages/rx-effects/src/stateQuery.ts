import { combineLatest, identity, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { DEFAULT_COMPARATOR } from './utils';

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
 * Options for processing the query result
 *
 * @property distinct Enables distinct results
 * @property distinct.comparator Custom comparator for values. Strict equality `===` is used by default.
 * @property distinct.keySelector Getter for keys of values to compare. Values itself are used for comparing by default.
 */
export type StateQueryOptions<T, K> = {
  distinct?:
    | boolean
    | {
        comparator?: (previous: K, current: K) => boolean;
        keySelector?: (value: T) => K;
      };
};

/**
 * Returns a new `StateQuery` which maps a source value by the provided mapping
 * function.
 *
 * @param query source query
 * @param mapper value mapper
 * @param options options for processing the result value
 */
export function mapQuery<T, R, K = R>(
  query: StateQuery<T>,
  mapper: (value: T) => R,
  options?: StateQueryOptions<R, K>,
): StateQuery<R> {
  let value$ = query.value$.pipe(map(mapper));

  value$ = distinctValue(value$, options?.distinct);

  return {
    get: () => mapper(query.get()),
    value$,
  };
}

/**
 * Returns a new `StateQuery` which takes the latest values from source queries
 * and merges them into a single value.
 *
 * @param queries source queries
 * @param merger value merger
 * @param options options for processing the result value
 */
export function mergeQueries<
  Values extends unknown[],
  Result,
  ResultKey = Result,
>(
  queries: [
    ...{
      [K in keyof Values]: StateQuery<Values[K]>;
    }
  ],
  merger: (...values: Values) => Result,
  options?: StateQueryOptions<Result, ResultKey>,
): StateQuery<Result> {
  let value$ = combineLatest(queries.map((query) => query.value$)).pipe(
    map((values) => merger(...(values as Values))),
  );

  value$ = distinctValue(value$, options?.distinct);

  return {
    get: () => merger(...(queries.map((query) => query.get()) as Values)),
    value$,
  };
}

function distinctValue<T, K>(
  value$: Observable<T>,
  distinct: StateQueryOptions<T, K>['distinct'],
): Observable<T> {
  if (distinct === false) {
    return value$;
  }

  const comparator =
    (distinct === true ? undefined : distinct?.comparator) ??
    DEFAULT_COMPARATOR;

  const keySelector =
    (distinct === true ? undefined : distinct?.keySelector) ??
    (identity as (value: T) => K);

  return value$.pipe(distinctUntilChanged(comparator, keySelector));
}
