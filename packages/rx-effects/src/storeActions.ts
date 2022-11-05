import { StateMutations } from './stateMutation';
import { Store } from './store';
import { setStateMutationName } from './storeMetadata';

/** Store's action for changing its state */
export type StoreAction<Args extends unknown[]> = (...args: Args) => void;

/** Record of store actions */
export type StoreActions<State, Mutations extends StateMutations<State>> = {
  [K in keyof Mutations]: StoreAction<Parameters<Mutations[K]>>;
};

export type StoreActionsFactory<
  State,
  Mutations extends StateMutations<State>,
> = (store: Store<State>) => StoreActions<State, Mutations>;

/** Creates store actions for the store by state mutations */
export function createStoreActions<
  State,
  Mutations extends StateMutations<State> = StateMutations<State>,
>(store: Store<State>, mutations: Mutations): StoreActions<State, Mutations>;

/** Creates a factory of store actions by state mutations */
export function createStoreActions<
  State,
  Mutations extends StateMutations<State> = StateMutations<State>,
>(mutations: Mutations): StoreActionsFactory<State, Mutations>;

export function createStoreActions<
  State,
  Mutations extends StateMutations<State> = StateMutations<State>,
>(
  storeOrMutations: Store<State> | Mutations,
  mutations?: Mutations,
): StoreActions<State, Mutations> | StoreActionsFactory<State, Mutations> {
  if (mutations) {
    return createStoreActionsObject<State, Mutations>(
      storeOrMutations as Store<State>,
      mutations,
    );
  }

  return (store) =>
    createStoreActionsObject<State, Mutations>(
      store,
      storeOrMutations as Mutations,
    );
}

function createStoreActionsObject<
  State,
  Mutations extends StateMutations<State>,
>(store: Store<State>, mutations: Mutations): StoreActions<State, Mutations> {
  const actions: any = {};

  Object.entries(mutations).forEach(([key, mutationFactory]) => {
    (actions as any)[key] = (...args: any[]) => {
      const mutation = mutationFactory(...args);
      setStateMutationName(mutation, key);

      store.update(mutation);
    };
  });

  return actions;
}
