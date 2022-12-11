import {
  createStore,
  StateUpdates,
  StoreOptions,
  StoreWithUpdates,
  withStoreUpdates,
} from 'rx-effects';
import { useController } from './useController';
import { useQuery } from './useQuery';

export function useStore<State, Updates extends StateUpdates<State>>(
  initialState: State,
  updates: Updates,
  options?: StoreOptions<State>,
): [State, Updates, StoreWithUpdates<State, Updates>] {
  const store: StoreWithUpdates<State, Updates> = useController(() => {
    return withStoreUpdates<State, Updates>(
      createStore<State>(initialState, options),
      updates,
    );
  });

  const state = useQuery(store);

  return [state, store.updates, store] as [
    State,
    Updates,
    StoreWithUpdates<State, Updates>,
  ];
}
