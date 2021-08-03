import { createStore, Store } from './store';

export type StateFactory<State extends Record<string, unknown>> = (
  values?: Partial<State>,
) => State;

export type StateDeclaration<State extends Record<string, unknown>> = Readonly<{
  initialState: State;
  createState: StateFactory<State>;
  createStore: (initialState?: State) => Store<State>;
}>;

export function declareState<State extends Record<string, unknown>>(
  stateFactory: StateFactory<State>,
  stateCompare?: (s1: State, s2: State) => boolean,
): StateDeclaration<State> {
  const initialState = stateFactory();
  const storeFactory = (state: State = initialState): Store<State> =>
    createStore(state, stateCompare);

  return {
    initialState,
    createState: stateFactory,
    createStore: storeFactory,
  };
}
