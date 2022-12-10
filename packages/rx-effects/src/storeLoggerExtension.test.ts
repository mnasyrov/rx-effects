import { createAction } from './action';
import { createScope } from './scope';
import { createStore, createStoreUpdates, StateMutation } from './store';
import { registerStoreExtension } from './storeExtensions';
import { createStoreLoggerExtension } from './storeLoggerExtension';

describe('createStoreLoggerExtension()', () => {
  it('should log store events', () => {
    const logger = jest.fn();

    registerStoreExtension(createStoreLoggerExtension(logger));

    const increment: StateMutation<number> = (state) => state + 1;

    const store = createStore<number>(0, { name: 'test' });
    const updates = createStoreUpdates(store.update, {
      increment: () => increment,
    });

    store.set(1);
    store.update(increment);
    updates.increment();
    store.destroy();

    expect(logger).toHaveBeenNthCalledWith(1, 'test#1', 'created');

    expect(logger).toHaveBeenNthCalledWith(
      2,
      'test#1',
      'mutation',
      'anonymous',
      {
        nextState: 1,
        prevState: 0,
      },
    );
    expect(logger).toHaveBeenNthCalledWith(3, 'test#1', 'updated', {
      nextState: 1,
      prevState: 0,
    });

    expect(logger).toHaveBeenNthCalledWith(
      4,
      'test#1',
      'mutation',
      'anonymous',
      {
        nextState: 2,
        prevState: 1,
      },
    );
    expect(logger).toHaveBeenNthCalledWith(5, 'test#1', 'updated', {
      nextState: 2,
      prevState: 1,
    });

    expect(logger).toHaveBeenNthCalledWith(
      6,
      'test#1',
      'mutation',
      'increment',
      {
        nextState: 3,
        prevState: 2,
      },
    );
    expect(logger).toHaveBeenNthCalledWith(7, 'test#1', 'updated', {
      nextState: 3,
      prevState: 2,
    });

    expect(logger).toHaveBeenNthCalledWith(8, 'test#1', 'destroyed');
  });

  it('should log only store ID in case its name is empty', () => {
    const logger = jest.fn();

    registerStoreExtension(createStoreLoggerExtension(logger));

    createStore<number>(0);
    expect(logger).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/^#\d/),
      'created',
    );
  });

  it('should not log events from internal stores', () => {
    const logger = jest.fn();

    registerStoreExtension(createStoreLoggerExtension(logger));

    const scope = createScope();
    const action = createAction<number>();
    scope.handle(action, () => {
      // Do nothing
    });
    action(1);

    expect(logger).toHaveBeenCalledTimes(0);
  });
});
