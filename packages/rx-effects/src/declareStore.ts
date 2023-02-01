import {
  createStore,
  StateMutation,
  StateUpdates,
  StoreOptions,
  StoreWithUpdates,
  withStoreUpdates,
} from './store';

type DeclareStoreOptions<
  State,
  Updates extends StateUpdates<State> = StateUpdates<State>,
> = Readonly<{
  initialState: State;
  updates: Updates;
  options?: StoreOptions<State>;
}>;

interface DeclareStoreResultFn<State, CaseUpdates extends StateUpdates<State>> {
  (
    initialState?: State | StateMutation<State> | null,
    options?: StoreOptions<State>,
  ): StoreWithUpdates<State, CaseUpdates>;
}

interface DeclareStoreResult<State, CaseUpdates extends StateUpdates<State>>
  extends DeclareStoreResultFn<State, CaseUpdates> {
  updates: CaseUpdates;
}

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
  CaseUpdates extends StateUpdates<State> = StateUpdates<State>,
>(
  props: DeclareStoreOptions<State, CaseUpdates>,
): DeclareStoreResult<State, CaseUpdates> {
  const { initialState: _state, updates, options: _options = {} } = props;

  const result: DeclareStoreResultFn<State, CaseUpdates> = function (
    initialState,
    options = {},
  ) {
    const _initialState = initialState
      ? typeof initialState === 'function'
        ? (initialState as StateMutation<State>)(_state)
        : initialState
      : _state;

    const store = createStore<State>(_initialState, {
      ..._options,
      ...options,
    });

    return withStoreUpdates(store, updates);
  };

  Object.assign(result, { updates });

  return result as DeclareStoreResult<State, CaseUpdates>;
}
