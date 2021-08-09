import {
  declareState,
  StateDeclaration,
  StateFactory,
} from './stateDeclaration';

describe('StateDeclaration', () => {
  type State = { value: number; data?: string };
  const stateFactory: StateFactory<State> = (values) => ({
    value: 1,
    ...values,
  });

  describe('declareState()', () => {
    it('should declare a state for a record (type check)', () => {
      const initialState = { foo: 'bar', count: 1 };
      const declaration = declareState((values) => ({
        ...initialState,
        ...values,
      }));

      expect(declaration.initialState).toEqual(initialState);

      const state1 = declaration.createState();
      const store1 = declaration.createStore();
      expect(state1).toEqual(initialState);
      expect(store1.get()).toEqual(initialState);

      const state2 = declaration.createState({ foo: 'xyz' });
      const store2 = declaration.createStore({ foo: 'xyz' });
      expect(state2).toEqual({ foo: 'xyz', count: 1 });
      expect(store2.get()).toEqual({ foo: 'xyz', count: 1 });
    });

    it('should declare a state for a primitive (type check)', () => {
      const NUMBER_STATE: StateDeclaration<number> = declareState(1);
      expect(NUMBER_STATE.initialState).toBe(1);
      expect(NUMBER_STATE.createState(2)).toBe(1);

      const STRING_STATE: StateDeclaration<string> = declareState(() => 'foo');
      expect(STRING_STATE.initialState).toBe('foo');
    });

    it('should declare a state with an initial object and provide the state factory, which can create derived states', () => {
      const initialState = { foo: 'bar', count: 1 };
      const declaration = declareState(initialState);

      expect(declaration.initialState).toBe(initialState);

      const state1 = declaration.createState();
      const store1 = declaration.createStore();
      expect(state1).toBe(initialState);
      expect(store1.get()).toBe(initialState);

      const state2 = declaration.createState({ foo: 'xyz' });
      const store2 = declaration.createStore({ foo: 'xyz' });
      expect(state2).toEqual({ foo: 'xyz', count: 1 });
      expect(store2.get()).toEqual({ foo: 'xyz', count: 1 });
    });
  });

  describe('initialState', () => {
    it('should be equal to an initial state from the state factory', () => {
      const moduleState: StateDeclaration<State> = declareState(stateFactory);
      expect(moduleState.initialState).toEqual({ value: 1 });
    });
  });

  describe('createState()', () => {
    it('should return a new state which can be customized', () => {
      const moduleState: StateDeclaration<State> = declareState(stateFactory);

      expect(moduleState.createState({ data: 'a' })).toEqual({
        value: 1,
        data: 'a',
      });

      expect(moduleState.createState({ value: 2 })).toEqual({ value: 2 });
    });
  });

  describe('createStore()', () => {
    it('should return a new store', () => {
      const moduleState: StateDeclaration<State> = declareState(stateFactory);

      expect(moduleState.createStore().get()).toEqual({
        value: 1,
      });

      expect(moduleState.createStore({ value: 2 }).get()).toEqual({
        value: 2,
      });
    });
  });
});
