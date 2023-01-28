import { declareStore } from './declareStore';

describe('createStore()', () => {
  type SimpleState = {
    value: string;
    count: number;
  };
  const initialState: SimpleState = {
    value: 'initial text',
    count: 0,
  };
  const createSimpleStore = declareStore({
    initialState,
    updates: {
      set: (value: number) => (state) => {
        return {
          ...state,
          count: value,
        };
      },
      sum: (value1: number, value2: number) => (state) => {
        return {
          ...state,
          count: value1 + value2,
        };
      },
      increment: () => (state) => {
        return {
          ...state,
          count: state.count + 1,
        };
      },
      decrement: () => (state) => {
        return {
          ...state,
          count: state.count - 1,
        };
      },
    },
  });

  it('should allow testing of updates', () => {
    expect(initialState.count).toBe(0);

    const result = createSimpleStore.updates.set(10)(initialState);

    expect(result.count).toBe(10);
  });

  it('should executing without mutation for initial state', () => {
    createSimpleStore.updates.set(10)(initialState);

    expect(initialState.count).toBe(0);
  });

  it('should initial state be function for declareStore', () => {
    const createLocalStore = declareStore({
      initialState: () => ({ userId: 101 }),
      updates: {
        increment: () => (state) => {
          return {
            ...state,
            userId: state.userId + 1,
          };
        },
      },
    });

    const localStore = createLocalStore();
    const { get } = localStore.asQuery();

    expect(get().userId).toBe(101);

    localStore.updates.increment();

    expect(get().userId).toBe(102);

    expect(localStore.getInitialState().userId).toBe(101);
  });

  it('should update initial state during initialization', () => {
    const simpleStore = createSimpleStore({
      count: 12,
      value: 'new initial text',
    });

    const { get } = simpleStore.asQuery();

    expect(get().count).toBe(12);

    expect(get().value).toBe('new initial text');
  });

  it('should update the state', () => {
    const simpleStore = createSimpleStore();
    const { get } = simpleStore.asQuery();
    expect(get().count).toBe(0);

    simpleStore.updates.set(10);

    expect(get().count).toBe(10);

    simpleStore.updates.increment();

    expect(get().count).toBe(11);

    simpleStore.updates.decrement();
    simpleStore.updates.decrement();

    expect(get().count).toBe(9);
  });

  it('should execute query selector', () => {
    const simpleStore = createSimpleStore();
    const { get } = simpleStore.query((state) => state.count);

    simpleStore.updates.set(1);

    expect(get()).toBe(1);
  });

  it('should use a lot of arguments in updates', () => {
    const simpleStore = createSimpleStore();
    const { get } = simpleStore.asQuery();

    simpleStore.updates.sum(1, 11);

    expect(get().count).toBe(12);
  });

  it('should get initial state without mutation after executing updates', () => {
    const simpleStore = createSimpleStore();
    const { get } = simpleStore.asQuery();

    expect(get().count).toBe(0);

    simpleStore.updates.increment();

    expect(get().count).toBe(1);

    expect(simpleStore.getInitialState().count).toBe(0);
  });

  it('should reset changed state to initial state', () => {
    const simpleStore1 = createSimpleStore();
    const simpleStore1Query = simpleStore1.asQuery();

    const simpleStore2 = createSimpleStore({
      count: 100,
      value: 'new value',
    });
    const simpleStore2Query = simpleStore2.asQuery();

    const simpleStore3 = createSimpleStore((state) => ({
      ...state,
      count: 12,
    }));
    const simpleStore3Query = simpleStore3.asQuery();

    simpleStore1.updates.increment();

    simpleStore2.updates.increment();

    simpleStore3.updates.increment();

    expect(simpleStore1Query.get().count).toBe(1);

    expect(simpleStore2Query.get().count).toBe(101);

    expect(simpleStore3Query.get().count).toBe(13);

    simpleStore1.reset();

    simpleStore2.reset();

    simpleStore3.reset();

    expect(simpleStore1Query.get().count).toBe(0);

    expect(simpleStore2Query.get().count).toBe(100);

    expect(simpleStore3Query.get().count).toBe(12);
  });

  it('should use custom comparator', () => {
    const createLocalStore = declareStore({
      initialState: () => ({ userId: 101 }),
      updates: {
        increment: () => (state) => {
          return {
            ...state,
            userId: state.userId + 1,
          };
        },
      },
      comparator: (prevState, nextState) => prevState === nextState,
    });

    const localStore = createLocalStore(
      { userId: 1 },
      { comparator: (prevState, nextState) => prevState === nextState },
    );
    const { get } = localStore.asQuery();

    expect(get().userId).toBe(1);

    localStore.updates.increment();

    expect(get().userId).toBe(2);
  });
});
