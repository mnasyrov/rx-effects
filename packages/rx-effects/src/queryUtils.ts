import { BehaviorSubject } from 'rxjs';
import { Query } from './query';

/**
 * Creates a query for the specified BehaviourSubject
 *
 * @example
 * ```ts
 * const source = new BehaviourSubject(1);
 * const query = queryBehaviourSubject(source);

 * const result = compute((get) => get(query) + 1);

 * expect(result.get()).toBe(2)
 * ```
 */
export function queryBehaviourSubject<T>(source: BehaviorSubject<T>): Query<T> {
  return { get: () => source.value, value$: source };
}
