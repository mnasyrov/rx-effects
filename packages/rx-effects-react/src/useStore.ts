import { useMemo } from 'react';
import { createStore, Store, StoreOptions, StoreUpdater } from 'rx-effects';
import { useController } from './useController';
import { useQuery } from './useQuery';

export type ReactStore<T> = Readonly<{ value: T } & StoreUpdater<T>>;

export function useStore<T>(store: Store<T>): ReactStore<T> {
  const value = useQuery(store);

  return useMemo(() => {
    const { set, update, updates } = store;

    return { value, set, update, updates };
  }, [store, value]);
}

export function useStoreFactory<T>(
  initialState: T,
  options?: StoreOptions<T>,
): ReactStore<T> {
  const store = useController(() => createStore(initialState, options));

  return useStore(store);
}
