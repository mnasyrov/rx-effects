import { combineLatest, identity, Observable, shareReplay } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { DEFAULT_COMPARATOR } from '../utils';
import { Query, QueryOptions } from './query';

/**
 * Creates a new `Query` which maps a source value by the provided mapping
 * function.
 *
 * @param query source query
 * @param mapper value mapper
 * @param options options for processing the result value
 */
export function mapQuery<T, R, K = R>(
  query: Query<T>,
  mapper: (value: T) => R,
  options?: QueryOptions<R, K>,
): Query<R> {
  const { shareReplayWithRef, buffer } = createShareReplayWithRef<R>();

  let value$ = query.value$.pipe(map(mapper));
  value$ = distinctValue(value$, options?.distinct).pipe(shareReplayWithRef);

  function get(): R {
    return buffer.ref ? buffer.ref.value : mapper(query.get());
  }

  return { get, value$ };
}

/**
 * Creates a new `Query` which takes the latest values from source queries
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
      [K in keyof Values]: Query<Values[K]>;
    }
  ],
  merger: (...values: Values) => Result,
  options?: QueryOptions<Result, ResultKey>,
): Query<Result> {
  const { shareReplayWithRef, buffer } = createShareReplayWithRef<Result>();

  let value$ = combineLatest(queries.map((query) => query.value$)).pipe(
    map((values) => merger(...(values as Values))),
  );

  value$ = distinctValue(value$, options?.distinct).pipe(shareReplayWithRef);

  function get(): Result {
    if (buffer.ref) {
      return buffer.ref.value;
    }

    return merger(...(queries.map((query) => query.get()) as Values));
  }

  return { get, value$ };
}

function distinctValue<T, K>(
  value$: Observable<T>,
  distinct: QueryOptions<T, K>['distinct'],
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

function createShareReplayWithRef<T>() {
  const buffer: { ref?: { value: T } | undefined } = {};

  const shareReplayWithRef = (source$: Observable<T>) =>
    source$.pipe(
      tap({
        next: (value) => (buffer.ref = { value }),
        unsubscribe: () => (buffer.ref = undefined),
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

  return { shareReplayWithRef, buffer };
}
