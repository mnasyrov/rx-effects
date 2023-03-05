import { Observable, Subscriber } from 'rxjs';
import { compute, nextStoreVersion } from './compute';
import { Controller } from './controller';
import { Query } from './query';
import { STORE_EVENT_BUS } from './storeEvents';
import { setInternalStoreFlag, setStateMutationName } from './storeMetadata';
import { DEFAULT_COMPARATOR, isReadonlyArray, removeFromArray } from './utils';

let STORE_SEQ_NUMBER = 0;

/**
 * A function to update a state.
 *
 * It is recommended to return a new state or the previous one.
 *
 * Actually, the function can change the state in place, but it is responsible
 * for a developer to provide `comparator` function to the store which handles
 * the changes.
 *
 * For making changes use a currying function to provide arguments:
 * ```ts
 * const addPizzaToCart = (name: string): StateMutation<Array<string>> =>
 *   (state) => ([...state, name]);
 * ```
 *
 * @param state a previous state
 * @returns a next state
 */
export type StateMutation<State> = (state: State) => State;

/**
 * A record of factories which create state mutations.
 */
export type StateUpdates<State> = Readonly<
  Record<string, (...args: any[]) => StateMutation<State>>
>;

/**
 * Declare a record of factories for creating state mutations.
 */
export function declareStateUpdates<State>(): <
  Updates extends StateUpdates<State> = StateUpdates<State>,
>(
  updates: Updates,
) => Updates;

/**
 * Declare a record of factories for creating state mutations.
 */
export function declareStateUpdates<
  State,
  Updates extends StateUpdates<State> = StateUpdates<State>,
>(stateExample: State, updates: Updates): Updates;

export function declareStateUpdates<
  State,
  Updates extends StateUpdates<State> = StateUpdates<State>,
>(
  stateExample?: State,
  updates?: Updates,
):
  | Updates
  | (<Updates extends StateUpdates<State> = StateUpdates<State>>(
      updates: Updates,
    ) => Updates) {
  if (updates) {
    return updates;
  }

  return (updates) => updates;
}

/**
 * Returns a mutation which applies all provided mutations for a state.
 *
 * You can use this helper to apply multiple changes at the same time.
 */
export function pipeStateMutations<State>(
  mutations: ReadonlyArray<StateMutation<State>>,
): StateMutation<State> {
  return (state) =>
    mutations.reduce((nextState, mutation) => mutation(nextState), state);
}

type StoreQueryFn<State> = {
  (): Query<State>;
  <T>(selector: (state: State) => T): Query<T>;
};

/**
 * Read-only interface of a store.
 */
export type StoreQuery<State> = Readonly<
  Query<State> & {
    /**
     * Creates a query from the store.
     *
     * If selector is not specified, then the store is returned as is.
     *
     * If selector is specified then returns a part of the state as `Query`.
     * The result query produces distinct values.
     *
     * @example
     * ```ts
     * const state: StateReader<{form: {login: 'foo'}}> = // ...
     * const query = state.query((state) => state.form.login);
     * ```
     */
    query: StoreQueryFn<State>;
  }
>;

/**
 * @internal
 * Updates the state by provided mutations
 * */
export type StoreUpdateFunction<State> = (
  mutation:
    | StateMutation<State>
    | ReadonlyArray<StateMutation<State> | undefined | null | false>,
) => void;

/** Function which changes a state of the store */
export type StoreUpdate<Args extends unknown[]> = (...args: Args) => void;

/** Record of store update functions */
export type StoreUpdates<
  State,
  Updates extends StateUpdates<State>,
> = Readonly<{
  [K in keyof Updates]: StoreUpdate<Parameters<Updates[K]>>;
}>;

/**
 * Store of a state
 */
export type Store<State> = Controller<
  StoreQuery<State> & {
    id: number;
    name?: string;

    /** Sets a new state to the store */
    set: (state: State) => void;

    /** Updates the store by provided mutations */
    update: StoreUpdateFunction<State>;

    /** Immediately emits a current state to store's subscribers */
    notify: () => void;
  }
>;

/** Store of a state with updating functions */
export type StoreWithUpdates<
  State,
  Updates extends StateUpdates<State>,
> = Readonly<Store<State> & { updates: StoreUpdates<State, Updates> }>;

type StateMutationQueue<State> = ReadonlyArray<
  StateMutation<State> | undefined | null | false
>;

export type StoreOptions<State> = Readonly<{
  name?: string;

  /** A comparator for detecting changes between old and new states */
  comparator?: (prevState: State, nextState: State) => boolean;

  /** Callback is called when the store is destroyed */
  onDestroy?: () => void;
}>;

/** @internal */
export type InternalStoreOptions<State> = Readonly<
  StoreOptions<State> & { internal?: boolean }
>;

let STORE_NOTIFY_QUEUE: Store<any>[] = [];
const STORE_NOTIFY_PRESENCE: Set<number> = new Set();

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
  const stateComparator = options?.comparator ?? DEFAULT_COMPARATOR;

  let currentState = initialState;
  let subscribers: Subscriber<State>[] | undefined;

  const store: Store<State> = {
    id: ++STORE_SEQ_NUMBER,
    name: options?.name,

    value$: new Observable<State>((subscriber) => {
      if (!subscribers) subscribers = [];
      subscribers.push(subscriber);

      subscriber.next(currentState);

      return () => {
        subscribers = removeFromArray(subscribers, subscriber);
      };
    }),

    get(): State {
      return currentState;
    },

    query<T>(selector?: (state: State) => T): Query<T> | Query<State> {
      return selector
        ? compute<T>((get) => selector(get(store)), [store])
        : store;
    },

    set(nextState: State) {
      update(() => nextState);
    },

    update,

    notify() {
      const pinnedState = currentState;
      subscribers?.forEach((subscriber) => subscriber.next(pinnedState));
    },

    destroy() {
      subscribers?.forEach((subscriber) => subscriber.complete());
      subscribers = [];

      STORE_EVENT_BUS.next({ type: 'destroyed', store });

      options?.onDestroy?.();
    },
  };

  function update(
    mutation:
      | StateMutation<State>
      | ReadonlyArray<StateMutation<State> | undefined | null | false>,
  ) {
    const prevState = currentState;

    const nextState = isReadonlyArray(mutation)
      ? applyMutations(currentState, mutation)
      : applyMutation(currentState, mutation);

    if (stateComparator(prevState, nextState)) {
      return;
    }

    nextStoreVersion();
    currentState = nextState;
    scheduleNotify(store);

    STORE_EVENT_BUS.next({
      type: 'updated',
      store,
      nextState,
      prevState,
    });
  }

  function applyMutations(
    state: State,
    mutations: StateMutationQueue<State>,
  ): State {
    let nextState = state;

    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      if (mutation) {
        nextState = applyMutation(nextState, mutation);
      }
    }

    return nextState;
  }

  function applyMutation(state: State, mutation: StateMutation<State>): State {
    const nextState = mutation(state);

    STORE_EVENT_BUS.next({
      type: 'mutation',
      store,
      mutation,
      nextState,
      prevState: state,
    });

    return nextState;
  }

  if ((options as InternalStoreOptions<State> | undefined)?.internal) {
    setInternalStoreFlag(store);
  }

  STORE_EVENT_BUS.next({ type: 'created', store });

  return store;
}

function scheduleNotify(store: Store<any>) {
  const prevSize = STORE_NOTIFY_PRESENCE.size;
  STORE_NOTIFY_PRESENCE.add(store.id);

  if (STORE_NOTIFY_PRESENCE.size === prevSize) {
    return;
  }

  if (STORE_NOTIFY_QUEUE.push(store) === 1) {
    Promise.resolve().then(executeNotifyQueue);
  }
}

function executeNotifyQueue() {
  const queue = STORE_NOTIFY_QUEUE;
  STORE_NOTIFY_QUEUE = [];
  STORE_NOTIFY_PRESENCE.clear();

  queue.forEach((store) => store.notify());
}

/** Creates StateUpdates for updating the store by provided state mutations */
export function createStoreUpdates<State, Updates extends StateUpdates<State>>(
  storeUpdate: Store<State>['update'],
  stateUpdates: Updates,
): StoreUpdates<State, Updates> {
  const updates: any = {};

  Object.entries(stateUpdates).forEach(([key, mutationFactory]) => {
    (updates as any)[key] = (...args: any[]) => {
      const mutation = mutationFactory(...args);
      setStateMutationName(mutation, key);

      storeUpdate(mutation);
    };
  });

  return updates;
}

/** Creates a proxy for the store with "updates" to change a state by provided mutations */
export function withStoreUpdates<
  State,
  Updates extends StateUpdates<State> = StateUpdates<State>,
>(store: Store<State>, updates: Updates): StoreWithUpdates<State, Updates> {
  const storeUpdates: StoreUpdates<State, Updates> = createStoreUpdates<
    State,
    Updates
  >(store.update, updates);

  return { ...store, updates: storeUpdates };
}
