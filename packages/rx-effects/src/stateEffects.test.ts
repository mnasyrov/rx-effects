import { createAction } from './action';
import { createEffect } from './effect';
import {
  createReduceStoreEffect,
  createResetStoreEffect,
  withQuery,
  withStore,
} from './stateEffects';
import { createStore } from './store';

describe('createReduceStoreEffect()', () => {
  it('should create an effect which reduce the store with a handled event', () => {
    type Actions = 'increase' | 'decrease';

    const store = createStore<number>(0);

    const reducerEffect = createReduceStoreEffect<Actions, number>(
      store,
      (state, event) => {
        switch (event) {
          case 'increase':
            return state + 1;
          case 'decrease':
            return state - 1;
          default:
            return state;
        }
      },
    );

    const dispatch = createAction<Actions>();
    reducerEffect.handle(dispatch);

    dispatch('increase');
    expect(store.get()).toBe(1);

    dispatch('increase');
    expect(store.get()).toBe(2);

    dispatch('decrease');
    expect(store.get()).toBe(1);
  });
});

describe('createResetStoreEffect()', () => {
  it('should create an effect which resets the store by an event', () => {
    const store = createStore<number>(0);

    const action = createAction();
    createResetStoreEffect(store, 0).handle(action);

    store.set(1);
    expect(store.get()).toBe(1);

    action();
    expect(store.get()).toBe(0);
  });
});

describe('withStore()', () => {
  it('should create an effect which passes an event and currnt state to the handler', () => {
    const store = createStore<number>(0);
    const sumAction = createAction<number>();

    const sumEffect = createEffect<[number, number]>(([arg, value]) =>
      store.set(arg + value),
    );
    sumEffect.handle(withStore(sumAction, store));

    sumAction(3);
    expect(store.get()).toBe(3);

    sumAction(5);
    expect(store.get()).toBe(8);
  });
});

describe('withQuery()', () => {
  it('should create an effect which passes an event and currnt state to the handler', () => {
    const store = createStore({ value: 0 });
    const sumAction = createAction<number>();

    const sumEffect = createEffect<[number, number]>(([arg, prevValue]) =>
      store.set({ value: arg + prevValue }),
    );
    sumEffect.handle(
      withQuery(
        sumAction,
        store.query((state) => state.value),
      ),
    );

    sumAction(3);
    expect(store.get()).toEqual({ value: 3 });

    sumAction(5);
    expect(store.get()).toEqual({ value: 8 });
  });
});
