import { StateMutation } from './stateMutation';
import { createStore } from './store';
import { createStoreActions } from './storeActions';
import { registerStoreExtension } from './storeExtensions';
import { createStoreLoggerExtension } from './storeLoggerExtension';

describe('createStoreLoggerExtension()', () => {
  it('should log store events', () => {
    const logger = jest.fn();

    registerStoreExtension(createStoreLoggerExtension(logger));

    const increment: StateMutation<number> = (state) => state + 1;

    const store = createStore<number>(0, { name: 'test' });
    const actions = createStoreActions(store, {
      increment: () => increment,
    });

    store.set(1);
    store.update(increment);
    actions.increment();
    store.destroy();

    expect(logger).nthCalledWith(1, 'test#1', 'created');

    expect(logger).nthCalledWith(2, 'test#1', 'mutation', 'anonymous', {
      nextState: 1,
      prevState: 0,
    });
    expect(logger).nthCalledWith(3, 'test#1', 'updated', {
      nextState: 1,
      prevState: 0,
    });

    expect(logger).nthCalledWith(4, 'test#1', 'mutation', 'anonymous', {
      nextState: 2,
      prevState: 1,
    });
    expect(logger).nthCalledWith(5, 'test#1', 'updated', {
      nextState: 2,
      prevState: 1,
    });

    expect(logger).nthCalledWith(6, 'test#1', 'mutation', 'increment', {
      nextState: 3,
      prevState: 2,
    });
    expect(logger).nthCalledWith(7, 'test#1', 'updated', {
      nextState: 3,
      prevState: 2,
    });

    expect(logger).nthCalledWith(8, 'test#1', 'destroyed');
  });
});
