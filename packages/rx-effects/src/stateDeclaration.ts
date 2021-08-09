import { createStore, Store } from './store';

export type StateFactory<State> = (values?: Partial<State>) => State;

export type StateDeclaration<State> = Readonly<{
  initialState: State;
  createState: StateFactory<State>;
  createStore: (initialState?: Partial<State>) => Store<State>;
}>;

export function declareState<State>(
  stateOrFactory: State | StateFactory<State>,
  stateCompare?: (s1: State, s2: State) => boolean,
): StateDeclaration<State> {
  let initialState: State;
  let stateFactory: StateFactory<State>;

  if (stateOrFactory instanceof Function) {
    initialState = stateOrFactory();
    stateFactory = (values?: Partial<State>) => {
      return values ? stateOrFactory(values) : initialState;
    };
  } else {
    initialState = stateOrFactory;
    stateFactory = (values?: Partial<State>) => {
      if (typeof initialState === 'object') {
        return values ? { ...initialState, ...values } : initialState;
      }

      return initialState;
    };
  }

  const storeFactory = (values?: Partial<State>): Store<State> => {
    const state = stateFactory(values);
    return createStore(state, stateCompare);
  };

  return {
    initialState,
    createState: stateFactory,
    createStore: storeFactory,
  };
}
