import { signal, SignalOptions, WritableSignal } from './signal';

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
 * Store and updating functions
 */
export type Store<State, Updates extends StateUpdates<State>> = Readonly<
  WritableSignal<State> & { updates: StoreUpdates<State, Updates> }
>;

/**
 * Creates the state store.
 *
 * @param initialState Initial state
 * @param updates State updaters
 * @param options Parameters for the store
 */
export function createStore<
  State,
  Updates extends StateUpdates<State> = StateUpdates<State>,
>(
  initialState: State,
  updates: Updates,
  options?: SignalOptions<State>,
): Store<State, Updates> {
  const store: WritableSignal<State> = signal(initialState, options);

  const storeUpdates: StoreUpdates<State, Updates> = createSignalUpdates<
    State,
    Updates
  >(store.update, updates);

  return { ...store, updates: storeUpdates };
}

/** Creates StateUpdates for updating the store by provided state mutations */
export function createSignalUpdates<State, Updates extends StateUpdates<State>>(
  signalUpdate: WritableSignal<State>['update'],
  stateUpdates: Updates,
): StoreUpdates<State, Updates> {
  const updates: any = {};

  Object.entries(stateUpdates).forEach(([key, mutationFactory]) => {
    (updates as any)[key] = (...args: any[]) => {
      const mutation = mutationFactory(...args);

      signalUpdate(mutation);
    };
  });

  return updates;
}
