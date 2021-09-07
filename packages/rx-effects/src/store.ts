import { BehaviorSubject, Observable } from 'rxjs';
import { Controller } from './controller';
import { StateMutation } from './stateMutation';
import { mapQuery, StateQuery, StateQueryOptions } from './stateQuery';
import { DEFAULT_COMPARATOR } from './utils';

/**
 * Read-only type of the state store.
 */
export type StateReader<State> = StateQuery<State> & {
  /**
   * Returns a part of the state as `Observable`
   * The result observable produces distinct values by default.
   *
   * @example
   * ```ts
   * const state: StateReader<{form: {login: 'foo'}}> = // ...
   * const value$ = state.select((state) => state.form.login);
   * ```
   */
  readonly select: <R, K = R>(
    selector: (state: State) => R,
    options?: StateQueryOptions<R, K>,
  ) => Observable<R>;

  /**
   * Returns a part of the state as `StateQuery`.
   * The result query produces distinct values by default.
   *
   * @example
   * ```ts
   * const state: StateReader<{form: {login: 'foo'}}> = // ...
   * const query = state.query((state) => state.form.login);
   * ```
   * */
  readonly query: <R, K = R>(
    selector: (state: State) => R,
    options?: StateQueryOptions<R, K>,
  ) => StateQuery<R>;
};

export type Store<State> = StateReader<State> &
  Controller<{
    /** Sets a new state to the store */
    set: (state: State) => void;

    /** Updates the state in the store by the mutation */
    update: (mutation: StateMutation<State>) => void;
  }>;

/**
 * Creates the state store.
 *
 * @param initialState an initial state
 * @param stateComparator a comparator for detecting changes between old and new
 *   states
 */
export function createStore<State>(
  initialState: State,
  stateComparator: (
    prevState: State,
    nextState: State,
  ) => boolean = DEFAULT_COMPARATOR,
): Store<State> {
  const store$: BehaviorSubject<State> = new BehaviorSubject(initialState);
  const state$ = store$.asObservable();

  return {
    value$: state$,

    get(): State {
      return store$.value;
    },

    set(nextState: State) {
      const prevState = store$.value;
      if (!stateComparator(prevState, nextState)) {
        store$.next(nextState);
      }
    },

    update(mutation: StateMutation<State>) {
      const prevState = store$.value;
      const nextState = mutation(prevState);
      if (!stateComparator(prevState, nextState)) {
        store$.next(nextState);
      }
    },

    select<R, K = R>(
      selector: (state: State) => R,
      options?: StateQueryOptions<R, K>,
    ): Observable<R> {
      return this.query(selector, options).value$;
    },

    query<R, K = R>(
      selector: (state: State) => R,
      options?: StateQueryOptions<R, K>,
    ): StateQuery<R> {
      return mapQuery(this, selector, options);
    },

    destroy() {
      store$.complete();
    },
  };
}
