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
