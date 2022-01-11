import { createStore } from './store';
import { registerStoreExtension } from './storeExtensions';

describe('registerStoreExtension()', () => {
  it('should register an extension', () => {
    const eventHandler = jest.fn();

    registerStoreExtension(() => ({
      onStoreEvent: eventHandler,
    }));

    createStore<number>(0, { name: 'test' });

    expect(eventHandler).nthCalledWith(1, {
      type: 'created',
      store: expect.objectContaining({ name: 'test' }),
    });
  });

  it('should register an empty extension', () => {
    registerStoreExtension(() => ({}));
    createStore<number>(0, { name: 'test' });
    expect.assertions(0);
  });

  it('should not emit events from internal stores', () => {
    const eventHandler = jest.fn();

    registerStoreExtension(() => ({
      onStoreEvent: eventHandler,
    }));

    createStore<number>(0, { name: 'test', internal: true });

    expect(eventHandler).toBeCalledTimes(0);
  });
});
