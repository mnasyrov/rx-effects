import { Observable } from 'rxjs';

/**
 * Provider for a value of a state.
 */
export type Query<T> = Readonly<{
  /** Returns the value of a state */
  get: () => T;

  /** `Observable` for value changes.  */
  value$: Observable<T>;
}>;

/**
 * Options for processing the query result
 *
 * @property distinct Enables distinct results
 * @property distinct.comparator Custom comparator for values. Strict equality `===` is used by default.
 * @property distinct.keySelector Getter for keys of values to compare. Values itself are used for comparing by default.
 */
export type QueryOptions<T, K> = Readonly<{
  distinct?:
    | boolean
    | {
        comparator?: (previous: K, current: K) => boolean;
        keySelector?: (value: T) => K;
      };
}>;
