import { firstValueFrom } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { collectChanges } from '../test/testUtils';
import { mapQuery, mergeQueries } from './queryMappers';
import {
  createStore,
  createStoreUpdates,
  declareStateUpdates,
  pipeStateMutations,
  StateMutation,
  StateUpdates,
  Store,
  withStoreUpdates,
} from './store';
import { STORE_EVENT_BUS } from './storeEvents';
import { OBJECT_COMPARATOR } from './utils';

describe('pipeStateMutations()', () => {
  type State = { value: number };

  it('should compose the provided mutations to a single mutation', () => {
    const composedMutation: StateMutation<State> = pipeStateMutations([
      () => ({ value: 10 }),
      (state) => ({ value: state.value + 1 }),
      (state) => ({ value: state.value * 2 }),
    ]);

    const store = withStoreUpdates(createStore({ value: 0 }), {
      increment: () => (state: State) => state,
    });
    store.update(composedMutation);
    store.updates.increment();
    expect(store.get().value).toBe(22);
  });
});

describe('Store', () => {
  type State = { value: number; data?: string };

  describe('createStateStore()', () => {
    it('should create a store with the provided initial state', () => {
      const store = createStore<State>({ value: 1 });
      expect(store.get().value).toBe(1);
    });

    it('should use a custom comparator', async () => {
      const store = createStore<State>(
        { value: 1, data: 'a' },
        { comparator: (s1, s2) => s1.value === s2.value },
      );

      const changes = await collectChanges(store.value$, () => {
        store.set({ value: 1, data: 'b' });
        store.set({ value: 2, data: 'c' });
      });

      expect(changes).toEqual([
        { value: 1, data: 'a' },
        { value: 2, data: 'c' },
      ]);
    });
  });

  describe('state$', () => {
    it('should return an observable for the current state and its further changes', async () => {
      const store = createStore<State>({ value: 1 });

      const changes = await collectChanges(store.value$, () => {
        store.set({ value: 2 });
        store.set({ value: 3 });
      });

      expect(changes).toEqual([{ value: 1 }, { value: 3 }]);
    });
  });

  describe('get()', () => {
    it('should return a current state of the store', () => {
      const store = createStore<State>({ value: 1 });
      expect(store.get()).toEqual({ value: 1 });
    });
  });

  describe('set()', () => {
    it('should set a new state to the store', () => {
      const store = createStore<State>({ value: 1 });
      store.set({ value: 2 });
      expect(store.get()).toEqual({ value: 2 });
    });
  });

  describe('update()', () => {
    it('should apply a mutation to the store', () => {
      const store = createStore<State>({ value: 1 });
      store.update((state) => ({ value: state.value + 10 }));
      expect(store.get()).toEqual({ value: 11 });
    });

    it('should not apply a mutation if the new state is the same', async () => {
      const store = createStore<State>({ value: 1 });

      const statePromise = firstValueFrom(store.value$.pipe(toArray()));
      store.update((state) => state);
      store.destroy();

      expect(await statePromise).toEqual([{ value: 1 }]);
    });

    it('should apply multiply mutations in the right order', () => {
      const store: Store<State> = createStore<State>({ value: 0 });
      store.update([
        () => ({ value: 10 }),
        (state) => ({ value: state.value + 1 }),
        (state) => ({ value: state.value * 2 }),
      ]);
      expect(store.get().value).toBe(22);
    });

    it('should skip not-true items from mutations', () => {
      const store: Store<State> = createStore<State>({ value: 0 });
      store.update([
        () => ({ value: 10 }),
        !global && ((state) => ({ value: state.value + 1 })),
        (state) => ({ value: state.value * 2 }),
      ]);
      expect(store.get().value).toBe(20);
    });
  });

  describe('select()', () => {
    it('should return an observable for the selected value and its further changes', async () => {
      const store = createStore<State>({ value: 1 });
      const value$ = store.select((state) => state.value);

      const changes = await collectChanges(value$, () => {
        store.set({ value: 2 });
        store.set({ value: 3 });
      });

      expect(changes).toEqual([1, 3]);
    });

    it('should use the provided valueCompare', async () => {
      const store = createStore<State>({ value: 1, data: 'a,1' });
      const data$ = store.select((state) => state.data, {
        distinct: {
          comparator: (v1, v2) =>
            (v1 ?? '').split(',')[0] === (v2 ?? '').split(',')[0],
        },
      });

      const changes = await collectChanges(data$, () => {
        store.set({ value: 1, data: 'a,2' });
        store.set({ value: 1, data: 'b,3' });
      });

      expect(changes).toEqual(['a,1', 'b,3']);
    });
  });

  describe('query()', () => {
    it('should return a query for the selected value of the state', async () => {
      const store = createStore<State>({ value: 1 });

      const query = store.query((state) => state.value);
      expect(query.get()).toEqual(1);

      const changes = await collectChanges(query.value$, () => {
        store.set({ value: 2 });
        store.set({ value: 3 });
      });

      expect(query.get()).toEqual(3);
      expect(changes).toEqual([1, 3]);
    });

    it('should use the provided valueCompare', async () => {
      const store = createStore<State>({ value: 1, data: 'a,1' });
      const query = store.query((state) => state.data, {
        distinct: {
          comparator: (v1, v2) =>
            (v1 ?? '').split(',')[0] === (v2 ?? '').split(',')[0],
        },
      });

      const changes = await collectChanges(query.value$, () => {
        store.set({ value: 1, data: 'a,2' });
        store.set({ value: 1, data: 'b,3' });
      });

      expect(query.get()).toEqual('b,3');
      expect(changes).toEqual(['a,1', 'b,3']);
    });
  });

  describe('asQuery()', () => {
    it('should return the same store', () => {
      const store = createStore(1);
      const query = store.asQuery();

      expect(query).toBe(store);
    });
  });

  describe('destroy()', () => {
    it('should complete an internal store', async () => {
      const store = createStore<number>(1);

      const changes = await collectChanges(store.value$, () => {
        store.set(2);
        store.destroy();
        store.set(3);
      });

      expect(changes).toEqual([1]);
    });

    it('should send a signal about the destroyed store to STORE_EVENT_BUS', async () => {
      const store = createStore<number>(1);

      const events = await collectChanges(STORE_EVENT_BUS, () => {
        store.destroy();
      });

      expect(events).toEqual([{ type: 'destroyed', store }]);
    });

    it('should call `onDestroy` callback', async () => {
      const onDestroy = jest.fn();
      const store = createStore<number>(1, { onDestroy });

      store.destroy();
      expect(onDestroy).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Concurrent Store updates', () => {
  it('should update the store and apply derived updates until completing the current one', async () => {
    const store = createStore<{
      v1: string;
      v2: string;
      merged?: string;
      uppercase?: string;
    }>({ v1: 'a', v2: 'b' });

    const v1 = store.query((state) => state.v1);
    const v2 = store.query((state) => state.v2);

    const merged = mergeQueries([v1, v2], (value1, value2) => value1 + value2);

    const uppercase = mapQuery(merged, (value) => value.toUpperCase());

    const history = await collectChanges(store.value$, async () => {
      merged.value$.subscribe((merged) =>
        store.update((state) => ({ ...state, merged })),
      );

      uppercase.value$.subscribe((uppercase) =>
        store.update((state) => ({ ...state, uppercase })),
      );

      await 0;

      expect(store.get().merged).toEqual('ab');
      expect(store.get().uppercase).toEqual('AB');

      store.update((state) => ({ ...state, v1: 'c' }));
      store.update((state) => ({ ...state, v2: 'd' }));

      expect(store.get().merged).toEqual('ab');
      expect(store.get().uppercase).toEqual('AB');

      await 0;

      expect(store.get().merged).toEqual('cd');
      expect(store.get().uppercase).toEqual('CD');
    });

    expect(history).toEqual([
      { v1: 'a', v2: 'b' },
      { v1: 'a', v2: 'b', merged: 'ab', uppercase: 'AB' },
      { v1: 'c', v2: 'd', merged: 'ab', uppercase: 'AB' },
      { v1: 'c', v2: 'd', merged: 'cd', uppercase: 'CD' },
    ]);
  });

  it('should trigger a listener in case a state was changed', async () => {
    const store = createStore<{
      bar: number;
      foo: number;
    }>({ bar: 0, foo: 0 }, { comparator: OBJECT_COMPARATOR });

    const history = await collectChanges(store.value$, () => {
      store.update((state) => ({ ...state, foo: 1 }));
      store.update((state) => ({ ...state, foo: 2 }));
      store.update((state) => ({ ...state, bar: 42 }));
      store.update((state) => ({ ...state, foo: 2 }));
      store.update((state) => ({ ...state, foo: 3 }));
    });

    expect(history).toEqual([
      { bar: 0, foo: 0 },
      { bar: 42, foo: 3 },
    ]);
  });

  it('should preserve order of pending updates during applying the current update', async () => {
    const store = createStore<{
      x: number;
      y: number;
      z: number;
    }>({ x: 0, y: 0, z: 0 }, { comparator: OBJECT_COMPARATOR });

    store.value$.subscribe(({ x }) =>
      store.update((state) => ({ ...state, y: x })),
    );
    store.value$.subscribe(({ y }) =>
      store.update((state) => ({ ...state, z: y })),
    );

    const history = await collectChanges(store.value$, () => {
      store.update((state) => ({ ...state, x: 1 }));
      store.update((state) => ({ ...state, x: 2 }));
      store.update((state) => ({ ...state, x: 3 }));
    });

    expect(history).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 3, y: 0, z: 0 },
      { x: 3, y: 3, z: 0 },
      { x: 3, y: 3, z: 3 },
    ]);
  });

  it('should reschedule continuous setting a state by subscribers', async () => {
    const store = createStore<number>(0);

    store.value$.subscribe((x) => {
      if (x < 100) {
        store.set(x * 10);
      }
    });

    const changes = await collectChanges(store.value$, () => {
      store.set(1);
      store.set(2);
      store.set(3);
    });

    expect(changes).toEqual([0, 3, 30, 300]);
  });
});

describe('createStoreUpdates()', () => {
  it('should provide actions to change a state of a store', () => {
    const store = createStore(1);

    const updates = createStoreUpdates(store.update, {
      add: (value: number) => (state) => state + value,
      multiply: (value: number) => (state) => state * value,
    });

    updates.add(2);
    expect(store.get()).toBe(3);

    updates.multiply(3);
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
    const stateUpdates: StateUpdates<number> = {
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

describe('declareStateUpdates()', () => {
  it('should declare a record of state mutations #1', () => {
    const stateUpdates = declareStateUpdates<number>()({
      add: (value: number) => (state) => state + value,
      multiply: (value: number) => (state) => state * value,
    });

    const store = createStore<number>(1);
    const storeUpdates = createStoreUpdates(store.update, stateUpdates);

    storeUpdates.add(2);
    storeUpdates.multiply(4);
    expect(store.get()).toBe(12);
  });

  it('should declare a record of state mutations #2', () => {
    const stateUpdates = declareStateUpdates(0, {
      add: (value: number) => (state) => state + value,
      multiply: (value: number) => (state) => state * value,
    });

    const store = createStore<number>(1);
    const storeUpdates = createStoreUpdates(store.update, stateUpdates);

    storeUpdates.add(2);
    storeUpdates.multiply(4);
    expect(store.get()).toBe(12);
  });
});
