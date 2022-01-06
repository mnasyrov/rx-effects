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
});
