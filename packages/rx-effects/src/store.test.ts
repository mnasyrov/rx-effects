import { firstValueFrom, Observable, Subject } from 'rxjs';
import { bufferWhen, toArray } from 'rxjs/operators';
import { StateMutation } from './stateMutation';
import { mapQuery, mergeQueries } from './stateQuery';
import { createStore, Store } from './store';
import { OBJECT_COMPARATOR } from './utils';

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
        { stateComparator: (s1, s2) => s1.value === s2.value },
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

      expect(changes).toEqual([1, 2, 3]);
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
      expect(changes).toEqual([1, 2, 3]);
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
});

describe('Concurrent Store updates', () => {
  it('should update the store and apply derived updates until completing the current one', () => {
    const { store, patch, history } = createTestStore<{
      v1: string;
      v2: string;
      merged?: string;
      uppercase?: string;
    }>({
      v1: 'a',
      v2: 'b',
    });

    const v1 = store.query((state) => state.v1);
    const v2 = store.query((state) => state.v2);

    const merged = mergeQueries([v1, v2], (value1, value2) => value1 + value2);

    const uppercase = mapQuery(merged, (value) => value.toUpperCase());

    merged.value$.subscribe((merged) => store.update(patch({ merged })));

    uppercase.value$.subscribe((uppercase) =>
      store.update(patch({ uppercase })),
    );

    expect(store.get().merged).toEqual('ab');
    expect(store.get().uppercase).toEqual('AB');

    store.update((state) => ({ ...state, v1: 'c' }));
    store.update((state) => ({ ...state, v2: 'd' }));

    expect(store.get().merged).toEqual('cd');
    expect(store.get().uppercase).toEqual('CD');

    expect(history).toEqual([
      { v1: 'a', v2: 'b' },
      { v1: 'a', v2: 'b', merged: 'ab' },
      { v1: 'a', v2: 'b', merged: 'ab', uppercase: 'AB' },
      { v1: 'c', v2: 'b', merged: 'ab', uppercase: 'AB' },
      { v1: 'c', v2: 'b', merged: 'cb', uppercase: 'CB' },
      { v1: 'c', v2: 'd', merged: 'cb', uppercase: 'CB' },
      { v1: 'c', v2: 'd', merged: 'cd', uppercase: 'CD' },
    ]);
  });

  it('should trigger a listener in case a state was changed', () => {
    const { store, patch, history } = createTestStore<{
      bar: number;
      foo: number;
    }>({ bar: 0, foo: 0 }, OBJECT_COMPARATOR);

    store.update(patch({ foo: 1 }));
    store.update(patch({ foo: 2 }));
    store.update(patch({ bar: 42 }));
    store.update(patch({ foo: 2 }));
    store.update(patch({ foo: 3 }));

    expect(history).toEqual([
      { bar: 0, foo: 0 },
      { bar: 0, foo: 1 },
      { bar: 0, foo: 2 },
      { bar: 42, foo: 2 },
      { bar: 42, foo: 3 },
    ]);
  });

  it('should preserve order of pending updates during applying the current update', () => {
    const { store, patch, history } = createTestStore<{
      x: number;
      y: number;
      z: number;
    }>({ x: 0, y: 0, z: 0 }, OBJECT_COMPARATOR);

    store.value$.subscribe(({ x }) => store.update(patch({ y: x })));
    store.value$.subscribe(({ y }) => store.update(patch({ z: y })));
    store.update(patch({ x: 1 }));
    store.update(patch({ x: 2 }));
    store.update(patch({ x: 3 }));

    expect(history).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 1, y: 1, z: 0 },
      { x: 1, y: 1, z: 1 },
      { x: 2, y: 1, z: 1 },
      { x: 2, y: 2, z: 1 },
      { x: 2, y: 2, z: 2 },
      { x: 3, y: 2, z: 2 },
      { x: 3, y: 3, z: 2 },
      { x: 3, y: 3, z: 3 },
    ]);
  });

  it('should reschedule continuous setting a state by subscribers', () => {
    const { store, history } = createTestStore<number>(0);

    store.value$.subscribe((x) => {
      if (x < 100) {
        store.set(x * 10);
      }
    });
    store.set(1);
    store.set(2);
    store.set(3);

    expect(history).toEqual([0, 1, 10, 100, 2, 20, 200, 3, 30, 300]);
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

function createTestStore<State>(
  initialState: State,
  comparator?: (prevState: State, nextState: State) => boolean,
): {
  store: Store<State>;
  patch: (partial: Partial<State>) => StateMutation<State>;
  history: State[];
} {
  const patch =
    (partial: Partial<State>) =>
    (state: State): State => ({ ...state, ...partial });
  const store = createStore(initialState, { stateComparator: comparator });

  const history: State[] = [];
  store.value$.subscribe((state) => history.push(state));

  return { store, patch, history };
}
