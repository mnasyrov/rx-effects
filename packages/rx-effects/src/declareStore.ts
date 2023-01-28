import { Observable } from 'rxjs';
import { Query } from './query';
import { createStore, createStoreUpdates, StoreUpdateFunction } from './store';

type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : T extends (...any: any[]) => any
  ? T
  : T extends object
  ? DeepReadonlyObject<T>
  : T;

type DeepReadonlyArray<T> = ReadonlyArray<DeepReadonly<T>>;

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

type CaseUpdater<S = any, P = any> = (
  ...payload: P[]
) => (state: DeepReadonly<S>) => DeepReadonly<S>;

type StoreCaseUpdates<State> = {
  [K: string]: CaseUpdater<State, any>;
};

type ActionCreatorForCaseUpdater<CR> = CR extends (...payload: infer P) => any
  ? ActionCreator<P>
  : () => void;

type ActionCreator<P extends any[] = any[]> = IsAny<
  P,
  (...payload: any[]) => void,
  IsUnknownOrNonInferrable<
    P,
    () => void,
    IfVoid<
      P,
      (...payload: void[]) => void,
      IfMaybeUndefined<
        P,
        (...payload: undefined[]) => void,
        (...payload: P) => void
      >
    >
  >
>;

type CaseUpdaterActions<CaseUpdaters extends StoreCaseUpdates<any>> = {
  [Type in keyof CaseUpdaters]: ActionCreatorForCaseUpdater<CaseUpdaters[Type]>;
};

type IsAny<T, True, False = never> =
  // test if we are going the left AND right path in the condition
  true | false extends (T extends never ? true : false) ? True : False;

type IsUnknown<T, True, False = never> = unknown extends T
  ? IsAny<T, False, True>
  : False;

type AtLeastTS35<True, False> = [True, False][IsUnknown<
  ReturnType<<T>() => T>,
  0,
  1
>];

type IfMaybeUndefined<P, True, False> = [undefined] extends [P] ? True : False;

type IfVoid<P, True, False> = [void] extends [P] ? True : False;

type IsEmptyObj<T, True, False = never> = T extends any
  ? keyof T extends never
    ? IsUnknown<T, False, IfMaybeUndefined<T, False, IfVoid<T, False, True>>>
    : False
  : never;

type IsUnknownOrNonInferrable<T, True, False> = AtLeastTS35<
  IsUnknown<T, True, False>,
  IsEmptyObj<T, True, IsUnknown<T, True, False>>
>;

type QueryOptions<T, K> = Readonly<{
  distinct?:
    | boolean
    | {
        comparator?: (previous: K, current: K) => boolean;
        keySelector?: (value: T) => K;
      };
}>;

interface StoreResult<
  State = any,
  CaseUpdaters extends StoreCaseUpdates<State> = StoreCaseUpdates<State>,
  Name extends string = string,
> {
  readonly name: Name | undefined;
  readonly updates: CaseUpdaterActions<CaseUpdaters>;
  readonly get: () => DeepReadonly<State>;

  /**
   * Cast the store to a narrowed `Query` type.
   */
  readonly asQuery: () => Query<DeepReadonly<State>>;
  readonly value$: Observable<DeepReadonly<State>>;
  readonly destroy: () => void;
  readonly select: <R, K = R>(
    selector: (state: DeepReadonly<State>) => R,
    options?: QueryOptions<R, K>,
  ) => Observable<R>;

  readonly query: <R, K = R>(
    selector: (state: DeepReadonly<State>) => R,
    options?: QueryOptions<R, K>,
  ) => Query<R>;

  readonly update: StoreUpdateFunction<DeepReadonly<State>>;

  readonly id: number;
  readonly getInitialState: () => DeepReadonly<State>;
  readonly reset: () => void;
}

interface StoreOptions<State> {
  /** A comparator for detecting changes between old and new states */
  comparator?: (
    prevState: DeepReadonly<State>,
    nextState: DeepReadonly<State>,
  ) => boolean;

  /** Callback is called when the store is destroyed */
  onDestroy?: () => void;
}

interface StoreProps<
  InitialState,
  State = InitialState extends () => infer S ? S : InitialState,
  Updates extends StoreCaseUpdates<State> = StoreCaseUpdates<State>,
  Name extends string = string,
> {
  name?: Name;

  initialState: InitialState;

  updates: Updates;
  /** A comparator for detecting changes between old and new states */
  comparator?: (
    prevState: DeepReadonly<State>,
    nextState: DeepReadonly<State>,
  ) => boolean;
}

type DeclareStoreResultFn<
  State,
  CaseUpdates extends StoreCaseUpdates<State>,
> = (
  initialState?: DeepReadonly<State> | StateMutation<State> | null,
  options?: StoreOptions<State>,
) => StoreResult<State, CaseUpdates>;

interface DeclareStoreResult<
  State,
  CaseUpdates extends StoreCaseUpdates<State>,
> {
  (
    initialState?: DeepReadonly<State> | StateMutation<State> | null,
    options?: StoreOptions<State>,
  ): StoreResult<State, CaseUpdates>;
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
  CaseUpdates extends StoreCaseUpdates<State> = StoreCaseUpdates<State>,
>(
  props: StoreProps<InitialState, State, CaseUpdates>,
): DeclareStoreResult<State, CaseUpdates> {
  const { initialState, updates, name, comparator } = props;

  const _state =
    typeof initialState === 'function' ? initialState() : initialState;

  const result: DeclareStoreResultFn<State, CaseUpdates> = function (
    initialState,
    options = {},
  ) {
    const _initialState = initialState
      ? typeof initialState === 'function'
        ? (initialState as StateMutation<State>)({ ..._state })
        : initialState
      : _state;

    const _store = createStore<DeepReadonly<State>>(_initialState, {
      comparator: options.comparator ?? comparator,
      name,
      onDestroy: options.onDestroy,
    });

    return {
      name,
      updates: createStoreUpdates(
        _store.update,
        updates,
      ) as CaseUpdaterActions<CaseUpdates>,
      value$: _store.value$,
      get: _store.get,
      asQuery: _store.asQuery,
      destroy: _store.destroy,
      select: _store.select,
      query: _store.query,
      update: _store.update,
      id: _store.id,
      reset: () => {
        _store.update(() => _initialState);
      },
      getInitialState: () => {
        return _initialState;
      },
    };
  };

  Object.assign(result, { updates });

  return result as DeclareStoreResult<State, CaseUpdates>;
}

type StateMutation<State> = (state: DeepReadonly<State>) => DeepReadonly<State>;
