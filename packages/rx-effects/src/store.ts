import { BehaviorSubject, Observable } from 'rxjs';
import { Controller } from './controller';
import { StateMutation } from './stateMutation';
import { mapQuery, StateQuery, StateQueryOptions } from './stateQuery';
import { STORE_EVENT_BUS } from './storeEvents';
import { DEFAULT_COMPARATOR, isReadonlyArray } from './utils';

let STORE_SEQ_NUMBER = 0;

/**
 * Read-only type of the state store.
 */
export type StateReader<State> = StateQuery<State> & {
  id: number;
  name?: string;

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

type StoreMutationEntries<State> = ReadonlyArray<
  StateMutation<State> | undefined | null | false
>;

export type StoreOptions<State> = Readonly<{
  name?: string;

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
  let pendingMutations: StoreMutationEntries<State> | undefined;

  const store = {
    id: ++STORE_SEQ_NUMBER,
    name: options?.name,

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
      STORE_EVENT_BUS.next({ type: 'destroyed', store });
    },
  };

  function apply(mutations: StoreMutationEntries<State>) {
    if (isUpdating) {
      pendingMutations = (pendingMutations ?? []).concat(mutations);
      return;
    }

    const prevState = store$.value;

    let nextState = prevState;

    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      if (mutation) {
        const stateBeforeMutation = nextState;
        nextState = mutation(nextState);

        STORE_EVENT_BUS.next({
          type: 'mutation',
          store,
          mutation,
          nextState,
          prevState: stateBeforeMutation,
        });
      }
    }

    if (stateComparator(prevState, nextState)) {
      return;
    }

    isUpdating = true;
    store$.next(nextState);
    STORE_EVENT_BUS.next({
      type: 'updated',
      store,
      nextState,
      prevState,
    });
    isUpdating = false;

    if (pendingMutations?.length) {
      const mutationsToApply = pendingMutations;
      pendingMutations = [];
      apply(mutationsToApply);
    }
  }

  STORE_EVENT_BUS.next({ type: 'created', store });

  return store;
}
