/* eslint-disable @typescript-eslint/ban-types */
import {
  createStore,
  StateMutation,
  StateUpdates,
  StoreOptions,
  StoreWithUpdates,
  withStoreUpdates,
} from './store';

export type StoreDeclaration<
  State,
  Updates extends StateUpdates<State> = StateUpdates<State>,
> = Readonly<{
  initialState: State;
  updates: Updates;
  options?: StoreOptions<State>;
}>;

type FactoryStateArg<State> =
  | (State extends Function ? never : State)
  | StateMutation<State>;

export type DeclaredStoreFactory<State, Updates extends StateUpdates<State>> = {
  (
    initialState?: FactoryStateArg<State>,
    options?: StoreOptions<State>,
  ): StoreWithUpdates<State, Updates>;

  updates: Updates;
};

/**
 * declare the base interface for create store
 * @example
```ts
type State = {
  id: string;
  name: string;
  isAdmin: boolean
};
const initialState: State = {
  id: '',
  name: '',
  isAdmin: false
};
const createUserStore = declareStore({
  initialState,
  updates: {
    setId: (id: string) => (state) => {
      return {
        ...state,
        id: id,
      };
    },
    setName: (name: string) => (state) => {
      return {
        ...state,
        name: name,
      };
    },
    update: (id: string name: string) => (state) => {
      return {
        ...state,
        id: id,
        name: name,
      };
    },
    setIsAdmin: () => (state) => {
      return {
        ...state,
        isAdmin: true,
      };
    },
  },
});

const userStore1 = createUserStore({ id: '1', name: 'User 1', isAdmin: false });

const userStore2 = createUserStore({ id: '2', name: 'User 2', isAdmin: true });

// OR

const users = [
  createUserStore({id: 1, name: 'User 1'}),
  createUserStore({id: 2, name: 'User 2'}),
]

userStore1.updates.setName('User from store 1');

assets.isEqual(userStore1.get().name, 'User from store 1')

assets.isEqual(userStore2.get().name, 'User 2')

// type of createUserStore
type UserStore = ReturnType<typeof createUserStore>;
```
 */
export function declareStore<
  State,
  Updates extends StateUpdates<State> = StateUpdates<State>,
>(
  declaration: StoreDeclaration<State, Updates>,
): DeclaredStoreFactory<State, Updates> {
  const {
    initialState: baseState,
    updates,
    options: baseOptions,
  } = declaration;

  function factory(
    initialState?: FactoryStateArg<State>,
    options?: StoreOptions<State>,
  ) {
    const state =
      initialState === undefined
        ? baseState
        : typeof initialState === 'function'
        ? (initialState as StateMutation<State>)(baseState)
        : initialState;

    const store = createStore<State>(state, {
      ...baseOptions,
      ...options,
    });

    return withStoreUpdates(store, updates);
  }

  return Object.assign(factory, { updates });
}
