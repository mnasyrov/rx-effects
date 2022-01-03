import { createStore, Store } from './store';

/**
 * Factory which creates a state. It can take optional values to modify the
 * state.
 */
export type StateFactory<State> = (values?: Partial<State>) => State;

/**
 * Declaration of a state.
 */
export type StateDeclaration<State> = Readonly<{
  /** Initial state, it is created during declaring the state. */
  initialState: State;

  /** Creates a state. */
  createState: StateFactory<State>;

  /** Creates a store. It can take optional values to modify the initial state. */
  createStore: (initialState?: Partial<State>) => Store<State>;
}>;

export type StateDeclarationOptions<State> = Readonly<{
  /** A comparator for detecting changes between old and new states */
  stateComparator?: (prevState: State, nextState: State) => boolean;
}>;

/**
 * Declares the state.
 *
 * @param stateOrFactory an initial state or a factory for the initial state
 * @param options Parameters for declaring a state
 */
export function declareState<State>(
  stateOrFactory: State | StateFactory<State>,
  options?: StateDeclarationOptions<State>,
): StateDeclaration<State> {
  const { stateComparator } = options ?? {};

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
    return createStore(state, { stateComparator });
  };

  return {
    initialState,
    createState: stateFactory,
    createStore: storeFactory,
  };
}
