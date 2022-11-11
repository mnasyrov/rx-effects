import { StateMutations } from './stateMutation';
import { createStore } from './store';
import {
  createStoreUpdates,
  createStoreUpdatesFactory,
  withStoreUpdates,
} from './storeUpdates';

describe('createStoreUpdates()', () => {
  it('should provide actions to change a state of a store', () => {
    const store = createStore(1);

    const storeUpdates = createStoreUpdates(store, {
      add: (value: number) => (state) => state + value,
      multiply: (value: number) => (state) => state * value,
    });

    storeUpdates.add(2);
    expect(store.get()).toBe(3);

    storeUpdates.multiply(3);
    expect(store.get()).toBe(9);
  });
});

describe('createStoreUpdatesFactory()', () => {
  it('should return a factory in case a store is not specified', () => {
    type State = number;

    const getStoreUpdates = createStoreUpdatesFactory<State>({
      add: (value: number) => (state: number) => state + value,
      multiply: (value: number) => (state: number) => state * value,
    });

    const store = createStore(1);
    const storeUpdates = getStoreUpdates(store);

    storeUpdates.add(2);
    expect(store.get()).toBe(3);

    storeUpdates.multiply(3);
    expect(store.get()).toBe(9);
  });
});

describe('withStoreUpdates()', () => {
  it('should use return a proxy for the store which is enhanced by update actions', () => {
    const store = withStoreUpdates(createStore(1), {
      add: (value: number) => (state) => state + value,
      multiply: (value: number) => (state) => state * value,
    });

    store.updates.add(2);
    expect(store.get()).toBe(3);

    store.updates.multiply(3);
    expect(store.get()).toBe(9);
  });

  it('should use a declared state mutations', () => {
    const stateUpdates: StateMutations<number> = {
      add: (value: number) => (state) => state + value,
      multiply: (value: number) => (state) => state * value,
    };

    const store = withStoreUpdates(createStore(1), stateUpdates);

    store.updates.add(2);
    expect(store.get()).toBe(3);

    store.updates.multiply(3);
    expect(store.get()).toBe(9);
  });

  it('should return a proxy which shares the state with the original store', () => {
    const originalStore = createStore(1);

    const proxyStore = withStoreUpdates(originalStore, {
      add: (value: number) => (state) => state + value,
    });

    proxyStore.updates.add(2);
    expect(proxyStore.get()).toBe(3);
    expect(originalStore.get()).toBe(3);
  });
});
