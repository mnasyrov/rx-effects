import { createStateStore, StateStore } from './stateStore';

export type StateFactory<State extends Record<string, unknown>> = (
  values?: Partial<State>,
) => State;

export type StateDeclaration<State extends Record<string, unknown>> = {
  initialState: State;
  createState: StateFactory<State>;
  createStore: (initialState?: State) => StateStore<State>;
};

export function declareState<State extends Record<string, unknown>>(
  stateFactory: StateFactory<State>,
  stateCompare?: (s1: State, s2: State) => boolean,
): StateDeclaration<State> {
  const initialState = stateFactory();
  const storeFactory = (state: State = initialState): StateStore<State> =>
    createStateStore(state, stateCompare);

  return {
    initialState,
    createState: stateFactory,
    createStore: storeFactory,
  };
}
