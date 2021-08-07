import { firstValueFrom, Observable, Subject } from 'rxjs';
import { bufferWhen, toArray } from 'rxjs/operators';
import { createStore } from './store';

describe('Store', () => {
  type State = { value: number; data?: string };

  describe('createStateStore()', () => {
    it('should create a store with the provided initial state', () => {
      const store = createStore<State>({ value: 1 });
      expect(store.get().value).toBe(1);
    });

    it('should use a custom "stateCompare" predicate', async () => {
      const store = createStore<State>(
        { value: 1, data: 'a' },
        (s1, s2) => s1.value === s2.value,
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

      expect(changes).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
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
  });

  describe('select()', () => {
    it('should return an observable for the selected value and its further changes', async () => {
      const store = createStore<State>({ value: 1 });
      const value$ = store.select((state) => state.value);

      const changes = await collectChanges(value$, () => {
        store.set({ value: 2 });
        store.set({ value: 3 });
      });

      expect(changes).toEqual([1, 2, 3]);
    });

    it('should use the provided valueCompare', async () => {
      const store = createStore<State>({ value: 1, data: 'a,1' });
      const data$ = store.select(
        (state) => state.data,
        (v1, v2) => (v1 ?? '').split(',')[0] === (v2 ?? '').split(',')[0],
      );

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
      expect(changes).toEqual([1, 2, 3]);
    });

    it('should use the provided valueCompare', async () => {
      const store = createStore<State>({ value: 1, data: 'a,1' });
      const query = store.query(
        (state) => state.data,
        (v1, v2) => (v1 ?? '').split(',')[0] === (v2 ?? '').split(',')[0],
      );

      const changes = await collectChanges(query.value$, () => {
        store.set({ value: 1, data: 'a,2' });
        store.set({ value: 1, data: 'b,3' });
      });

      expect(query.get()).toEqual('b,3');
      expect(changes).toEqual(['a,1', 'b,3']);
    });
  });
});

function collectChanges<T>(
  source$: Observable<T>,
  action: () => void,
): Promise<Array<T>> {
  const bufferClose$ = new Subject<void>();

  setImmediate(() => {
    action();
    bufferClose$.next();
  });

  return firstValueFrom(source$.pipe(bufferWhen(() => bufferClose$)));
}
