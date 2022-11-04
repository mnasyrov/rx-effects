import { StateMutations } from './stateMutation';
import { createStore, Store, StoreOptions } from './store';
import {
  createStoreActions,
  StoreActions,
  StoreActionsFactory,
} from './storeActions';

/**
 * Factory which creates a state. It can take optional values to modify the
 * state.
 */
export type StateFactory<State> = (values?: Partial<State>) => State;

/**
 * Declaration of a state.
 */
export type StateDeclaration<State> = Readonly<{
  name?: string;

  /** Initial state, it is created during declaring the state. */
  initialState: State;

  /** Creates a state. */
  createState: StateFactory<State>;

  /** Creates a store. It can take optional values to modify the initial state. */
  createStore: (
    initialState?: Partial<State>,
    options?: StoreOptions<State>,
  ) => Store<State>;

  /** Creates store actions for the store by state mutations. */
  createStoreActions<Mutations extends StateMutations<State>>(
    store: Store<State>,
    mutations: Mutations,
  ): StoreActions<State, Mutations>;

  /** Creates a factory of store actions by state mutations. */
  createStoreActions<Mutations extends StateMutations<State>>(
    mutations: Mutations,
  ): StoreActionsFactory<State, Mutations>;
}>;

/**
 * Declares the state.
 *
 * @param stateOrFactory an initial state or a factory for the initial state
 * @param storeOptions Parameters for declaring a state
 */
export function declareState<State>(
  stateOrFactory: State | StateFactory<State>,
  storeOptions?: StoreOptions<State>,
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

  const storeFactory = (
    values?: Partial<State>,
    options?: StoreOptions<State>,
  ): Store<State> => {
    const state = stateFactory(values);
    return createStore(state, { ...storeOptions, ...options });
  };

  return {
    initialState,
    createState: stateFactory,
    createStore: storeFactory,

    createStoreActions: createStoreActions,
  };
}
