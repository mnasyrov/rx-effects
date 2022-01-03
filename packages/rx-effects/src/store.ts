import { BehaviorSubject, Observable } from 'rxjs';
import { Controller } from './controller';
import { StateMutation } from './stateMutation';
import { mapQuery, StateQuery, StateQueryOptions } from './stateQuery';
import { DEFAULT_COMPARATOR, isReadonlyArray } from './utils';

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
    update: (
      mutation:
        | StateMutation<State>
        | ReadonlyArray<StateMutation<State> | undefined | null | false>,
    ) => void;
  }>;

type StoreMutations<State> = ReadonlyArray<
  StateMutation<State> | undefined | null | false
>;

export type StoreOptions<State> = Readonly<{
  /** A comparator for detecting changes between old and new states */
  stateComparator?: (prevState: State, nextState: State) => boolean;
}>;

/**
 * Creates the state store.
 *
 * @param initialState Initial state
 * @param options Parameters for the store
 */
export function createStore<State>(
  initialState: State,
  options?: StoreOptions<State>,
): Store<State> {
  const stateComparator = options?.stateComparator ?? DEFAULT_COMPARATOR;

  const store$: BehaviorSubject<State> = new BehaviorSubject(initialState);
  const state$ = store$.asObservable();

  let isUpdating = false;
  let pendingMutations: StoreMutations<State> | undefined;

  function apply(mutations: StoreMutations<State>) {
    if (isUpdating) {
      pendingMutations = (pendingMutations ?? []).concat(mutations);
      return;
    }

    const prevState = store$.value;

    let nextState = prevState;

    for (let i = 0; i < mutations.length; i++) {
      const mutator = mutations[i];
      if (mutator) nextState = mutator(nextState);
    }

    if (stateComparator(prevState, nextState)) {
      return;
    }

    isUpdating = true;
    store$.next(nextState);
    isUpdating = false;

    if (pendingMutations?.length) {
      const mutationsToApply = pendingMutations;
      pendingMutations = [];
      apply(mutationsToApply);
    }
  }

  return {
    value$: state$,

    get(): State {
      return store$.value;
    },

    set(nextState: State) {
      apply([() => nextState]);
    },

    update(
      mutation:
        | StateMutation<State>
        | ReadonlyArray<StateMutation<State> | undefined | null | false>,
    ) {
      if (isReadonlyArray(mutation)) {
        apply(mutation);
      } else {
        apply([mutation]);
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
