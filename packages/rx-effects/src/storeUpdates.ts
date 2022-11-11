import { StateMutations } from './stateMutation';
import { Store } from './store';
import { setStateMutationName } from './storeMetadata';

/** Function which changes a state of the store */
export type StoreUpdate<Args extends unknown[]> = (...args: Args) => void;

/** Record of store update functions */
export type StoreUpdates<
  State,
  Mutations extends StateMutations<State>,
> = Readonly<{
  [K in keyof Mutations]: StoreUpdate<Parameters<Mutations[K]>>;
}>;

/** Creates StateUpdates for updating the store by provided state mutations */
export function createStoreUpdates<
  State,
  Mutations extends StateMutations<State> = StateMutations<State>,
>(store: Store<State>, mutations: Mutations): StoreUpdates<State, Mutations> {
  return createStoreActionsObject<State, Mutations>(store, mutations);
}

/** A factory to produce StateUpdates for a store by declared state mutations */
export type StoreUpdatesFactory<
  State,
  Mutations extends StateMutations<State>,
> = (store: Store<State>) => StoreUpdates<State, Mutations>;

/** Creates a factory to produce StateUpdates for a store by declared state mutations */
export function createStoreUpdatesFactory<
  State,
  Mutations extends StateMutations<State> = StateMutations<State>,
>(mutations: Mutations): StoreUpdatesFactory<State, Mutations> {
  return (store) =>
    createStoreActionsObject<State, Mutations>(store, mutations);
}

function createStoreActionsObject<
  State,
  Mutations extends StateMutations<State>,
>(store: Store<State>, mutations: Mutations): StoreUpdates<State, Mutations> {
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

/** Store with `updates` property updating store's state */
export type StoreWithUpdates<
  State,
  Mutations extends StateMutations<State>,
> = Store<State> & Readonly<{ updates: StoreUpdates<State, Mutations> }>;

/** Creates a proxy for the store with "updates" to change a state by provided mutations */
export function withStoreUpdates<
  State,
  Mutations extends StateMutations<State> = StateMutations<State>,
>(
  store: Store<State>,
  mutations: Mutations,
): StoreWithUpdates<State, Mutations> {
  const updates = createStoreUpdates(store, mutations);

  return { ...store, updates };
}
