import { pipeStateMutations, StateMutation } from './stateMutation';
import { createStore, Store } from './store';

describe('pipeStateMutations()', () => {
  type State = { value: number };

  it('should compose the provided mutations to a single mutation', () => {
    const composedMutation: StateMutation<State> = pipeStateMutations([
      () => ({ value: 10 }),
      (state) => ({ value: state.value + 1 }),
      (state) => ({ value: state.value * 2 }),
    ]);

    const store: Store<State> = createStore<State>({ value: 0 });
    store.update(composedMutation);
    expect(store.get().value).toBe(22);
  });
});
