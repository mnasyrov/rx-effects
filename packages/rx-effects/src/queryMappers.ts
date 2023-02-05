import { compute } from './compute';
import { Query } from './query';

/**
 * Creates a new `Query` which maps a source value by the provided mapping
 * function.
 *
 * @param query source query
 * @param mapper value mapper
 */
export function mapQuery<T, R>(
  query: Query<T>,
  mapper: (value: T) => R,
): Query<R> {
  return compute((get) => mapper(get(query)), [query]);
}

/**
 * Creates a new `Query` which takes the latest values from source queries
 * and merges them into a single value.
 *
 * @param queries source queries
 * @param merger value merger
 */
export function mergeQueries<Values extends unknown[], Result>(
  queries: [
    ...{
      [K in keyof Values]: Query<Values[K]>;
    },
  ],
  merger: (...values: Values) => Result,
): Query<Result> {
  return compute((get) => {
    const values = queries.map((query) => get(query));
    return merger(...(values as Values));
  }, queries);
}
