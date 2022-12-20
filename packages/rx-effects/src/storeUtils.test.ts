import { debounceTime, filter, firstValueFrom, materialize, timer } from 'rxjs';
import { bufferWhen, map } from 'rxjs/operators';
import { createStore, declareStateUpdates } from './store';
import { declareStoreWithUpdates, pipeStore } from './storeUtils';

describe('pipeStore', () => {
  it('should creates a transformed view of the source store', () => {
    const source = createStore(1);

    const result = pipeStore(
      source,
      map((value) => value * 10),
    );

    expect(result.get()).toBe(10);

    source.set(2);
    expect(result.get()).toBe(20);
  });

  it('should unsubscribe the view when the source store is destroyed', async () => {
    const source = createStore(1);

    const result = pipeStore(
      source,
      map((value) => value * 10),
    );

    const notifications$ = result.value$.pipe(materialize());

    const notificationsPromise = firstValueFrom(
      notifications$.pipe(
        bufferWhen(() => notifications$.pipe(filter((e) => e.kind === 'C'))),
      ),
    );

    source.destroy();
    source.set(2);
    expect(result.get()).toBe(10);

    expect(await notificationsPromise).toEqual([
      {
        hasValue: true,
        kind: 'N',
        value: 10,
      },
    ]);
  });

  it('should creates a debounced view of the source store', async () => {
    const source = createStore(1);

    const result = pipeStore(source, (state$) =>
      state$.pipe(
        debounceTime(10),
        map((value) => value * 10),
      ),
    );

    expect(result.get()).toBe(1);

    await firstValueFrom(timer(20));
    expect(result.get()).toBe(10);

    source.set(2);
    expect(result.get()).toBe(10);

    await firstValueFrom(timer(20));
    expect(result.get()).toBe(20);
  });
});

describe('declareStoreWithUpdates()', () => {
  const COUNTER_UPDATES = declareStateUpdates<number>()({
    increase: () => (state) => state + 1,
    decrease: () => (state) => state - 1,
  });

  it('should declare a store with updates', () => {
    const createStore = declareStoreWithUpdates(0, COUNTER_UPDATES, {
      name: 'counterStore',
    });

    const store = createStore();
    expect(store.get()).toBe(0);
    expect(store.name).toBe('counterStore');

    store.updates.increase();
    expect(store.get()).toBe(1);

    store.updates.decrease();
    expect(store.get()).toBe(0);
  });

  it('should return a factory which can override initial parameters', () => {
    const createStore = declareStoreWithUpdates(0, COUNTER_UPDATES, {
      name: 'counterStore',
    });

    const store = createStore(10, { name: 'myCounter' });
    expect(store.get()).toBe(10);
    expect(store.name).toBe('myCounter');

    store.updates.increase();
    expect(store.get()).toBe(11);

    store.updates.decrease();
    expect(store.get()).toBe(10);
  });

  it('should work with a discriminate type of a state', () => {
    type State = { status: 'success' } | { status: 'error'; error: string };

    const initialState: State = { status: 'success' };

    const stateUpdates = declareStateUpdates<State>()({
      setSuccess: () => () => ({ status: 'success' }),
      setError: (error: string) => () => ({ status: 'error', error: error }),
    });

    const createStore = declareStoreWithUpdates<State, typeof stateUpdates>(
      initialState,
      stateUpdates,
    );

    const store = createStore();
    expect(store.get()).toEqual({ status: 'success' });

    store.updates.setError('fail');
    expect(store.get()).toEqual({ status: 'error', error: 'fail' });

    store.updates.setSuccess();
    expect(store.get()).toEqual({ status: 'success' });
  });
});
