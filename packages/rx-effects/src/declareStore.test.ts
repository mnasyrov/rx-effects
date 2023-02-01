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

  it('should initial state to be able to be a function', () => {
    const simpleStore = createSimpleStore((state) => ({
      ...state,
      value: 'updated text',
    }));

    const { get } = simpleStore.asQuery();

    expect(get().count).toBe(0);

    expect(get().value).toBe('updated text');
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
