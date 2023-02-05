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
