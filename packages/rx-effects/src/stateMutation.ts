export type StateMutation<State> = (state: State) => State;

export function pipeStateMutations<State>(
  mutations: Array<StateMutation<State>>,
): StateMutation<State> {
  return (state) =>
    mutations.reduce((nextState, mutation) => mutation(nextState), state);
}
