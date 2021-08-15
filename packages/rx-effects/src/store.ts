import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Controller } from './controller';
import { StateMutation } from './stateMutation';
import { StateQuery } from './stateQuery';

/**
 * Read-only type of the state store.
 */
export type StateReader<State> = StateQuery<State> & {
  /**
   * Returns a part of the state as `Observable`
   *
   * @example
   * ```ts
   * const state: StateReader<{form: {login: 'foo'}}> = // ...
   * const value$ = state.select((state) => state.form.login);
   * ```
   */
  readonly select: <R>(
    selector: (state: State) => R,
    compare?: (v1: R, v2: R) => boolean,
  ) => Observable<R>;

  /**
   * Returns a part of the state as `StateQuery`
   *
   * @example
   * ```ts
   * const state: StateReader<{form: {login: 'foo'}}> = // ...
   * const query = state.query((state) => state.form.login);
   * ```
   * */
  readonly query: <R>(
    selector: (state: State) => R,
    compare?: (v1: R, v2: R) => boolean,
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
  stateComparator: (prevState: State, nextState: State) => boolean = Object.is,
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

    select<R>(
      selector: (state: State) => R,
      valueCompare: (v1: R, v2: R) => boolean = Object.is,
    ): Observable<R> {
      return state$.pipe(map(selector), distinctUntilChanged(valueCompare));
    },

    query<R>(
      selector: (state: State) => R,
      valueCompare: (v1: R, v2: R) => boolean = Object.is,
    ): StateQuery<R> {
      return {
        get: () => selector(store$.value),
        value$: this.select(selector, valueCompare),
      };
    },

    destroy() {
      store$.complete();
    },
  };
}
