import { createController } from './mvc';

describe('createController()', () => {
  it('should create a controller', () => {
    const onDestroy = jest.fn();

    const controller = createController((scope) => {
      const store = scope.createStore(1);

      return {
        counter: store.asQuery(),
        increase: () => store.update((state) => state + 1),
        decrease: () => store.update((state) => state - 1),
        destroy: () => onDestroy(),
      };
    });

    const { counter, increase, decrease, destroy } = controller;
    expect(counter.get()).toBe(1);

    increase();
    expect(counter.get()).toBe(2);

    decrease();
    expect(counter.get()).toBe(1);

    destroy();
    expect(onDestroy).toHaveBeenCalled();
  });

  it('should defined a scope which is destroyed after destroying a controller', () => {
    const onDestroy = jest.fn();

    const controller = createController((scope) => {
      scope.add(() => onDestroy());

      return {};
    });

    controller.destroy();
    expect(onDestroy).toHaveBeenCalledTimes(1);
  });

  it('should defined a scope which can be destroyed twice: by a controller and by a proxy of destroy() function', () => {
    const onControllerDestroy = jest.fn();
    const onScopeDestroy = jest.fn();

    const controller = createController((scope) => {
      scope.add(() => onScopeDestroy());

      return {
        destroy() {
          onControllerDestroy();
          scope.destroy();
        },
      };
    });

    controller.destroy();
    expect(onControllerDestroy).toHaveBeenCalledTimes(1);
    expect(onScopeDestroy).toHaveBeenCalledTimes(1);
  });
});

describe('createInjectableController()', () => {
  it.todo(
    'should create a factory which accepts a DI container, revoles dependencies and constructs a controller',
  );
});

describe('declareControllerFactory()', () => {
  it.todo(
    'should declare a factory which accepts some args and return a factory of an injectable controller',
  );
});
