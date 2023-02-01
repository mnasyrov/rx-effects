import {
  createStore,
  createStoreUpdates,
  StateMutation,
  StateUpdates,
  Store,
  StoreWithUpdates,
} from './store';

interface StoreOptions<State> {
  /** A comparator for detecting changes between old and new states */
  comparator?: (prevState: State, nextState: State) => boolean;

  /** Callback is called when the store is destroyed */
  onDestroy?: () => void;
}

interface StoreProps<
  InitialState,
  State = InitialState extends () => infer S ? S : InitialState,
  Updates extends StateUpdates<State> = StateUpdates<State>,
  Name extends string = string,
> {
  name?: Name;

  initialState: InitialState;

  updates: Updates;
  /** A comparator for detecting changes between old and new states */
  comparator?: (prevState: State, nextState: State) => boolean;
}

interface DeclareStoreResultFn<State, CaseUpdates extends StateUpdates<State>> {
  (
    initialState?: State | StateMutation<State> | null,
    options?: StoreOptions<State>,
  ): Store<State> & StoreWithUpdates<State, CaseUpdates>;
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
  InitialState,
  State = InitialState extends () => infer S ? S : InitialState,
  CaseUpdates extends StateUpdates<State> = StateUpdates<State>,
>(
  props: StoreProps<InitialState, State, CaseUpdates>,
): DeclareStoreResult<State, CaseUpdates> {
  const { initialState, updates, name, comparator } = props;

  const _state =
    typeof initialState === 'function' ? initialState() : initialState;

  const result: DeclareStoreResultFn<State, CaseUpdates> = function (
    initialState,
    options,
  ) {
    const _initialState = initialState
      ? typeof initialState === 'function'
        ? (initialState as StateMutation<State>)({ ..._state })
        : initialState
      : _state;

    const _store = createStore<State>(_initialState, {
      comparator: options?.comparator ?? comparator,
      name,
      onDestroy: options?.onDestroy,
    });

    return {
      ..._store,
      updates: createStoreUpdates(_store.update, updates),
    };
  };

  Object.assign(result, { updates });

  return result as DeclareStoreResult<State, CaseUpdates>;
}
