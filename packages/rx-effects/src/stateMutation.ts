/**
 * This function mutates the state.
 *
 * It is recommended to return a new state or the previous one.
 *
 * Actually, the function can change the state in place, but it is responsible
 * for a developer to provide `stateCompare` function to the store which handles
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
