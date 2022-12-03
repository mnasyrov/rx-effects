import { createStore, StoreOptions } from 'rx-effects';
import {
  StateUpdates,
  StoreWithUpdates,
  withStoreUpdates,
} from 'rx-effects/src/index';
import { useController } from './useController';
import { useQuery } from './useQuery';

export function useStore<State, Updates extends StateUpdates<State>>(
  initialState: State,
  updates: Updates,
  options?: StoreOptions<State>,
): [State, Updates] {
  const store: StoreWithUpdates<State, Updates> = useController(() => {
    return withStoreUpdates<State, Updates>(
      createStore<State>(initialState, options),
      updates,
    );
  });

  const state = useQuery(store);

  return [state, store.updates] as [State, Updates];
}
