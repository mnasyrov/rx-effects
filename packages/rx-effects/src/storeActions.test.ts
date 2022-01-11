import { declareState } from './stateDeclaration';
import { createStore } from './store';
import { createStoreActions } from './storeActions';

describe('StoreActions', () => {
  it('should provide actions to change a state of a store', () => {
    const store = createStore(1);

    const storeActions = createStoreActions(store, {
      add: (value: number) => (state) => state + value,
      multiply: (value: number) => (state) => state * value,
    });

    storeActions.add(2);
    expect(store.get()).toBe(3);

    storeActions.multiply(3);
    expect(store.get()).toBe(9);
  });

  it('should return a factory in case a store is not specified', () => {
    const declaration = declareState(1);

    const getStoreActions = declaration.createStoreActions({
      add: (value: number) => (state: number) => state + value,
      multiply: (value: number) => (state: number) => state * value,
    });

    const store = declaration.createStore();
    const storeActions = getStoreActions(store);

    storeActions.add(2);
    expect(store.get()).toBe(3);

    storeActions.multiply(3);
    expect(store.get()).toBe(9);
  });
});
