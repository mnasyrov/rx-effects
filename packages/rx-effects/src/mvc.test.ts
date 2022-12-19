import { createContainer, token } from 'ditox';
import {
  createController,
  declareController,
  declareViewController,
} from './mvc';
import { Query } from './query';
import { createStore } from './store';

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

describe('declareController()', () => {
  it('should create a factory which accepts a DI container, resolves dependencies and constructs a controller', () => {
    const VALUE_TOKEN = token<number>();

    const controllerFactory = declareController(
      { value: VALUE_TOKEN },
      ({ value }) => ({
        getValue: () => value * 10,
      }),
    );

    const container = createContainer();
    container.bindValue(VALUE_TOKEN, 1);

    const controller = controllerFactory(container);
    expect(controller.getValue()).toBe(10);
  });
});

describe('declareViewController()', () => {
  it('should create a factory which accepts a DI container, resolves dependencies and constructs a controller', () => {
    const VALUE_TOKEN = token<number>();

    const controllerFactory = declareViewController(
      { value: VALUE_TOKEN },
      ({ value }) => ({
        getValue: () => value * 10,
      }),
    );

    const container = createContainer();
    container.bindValue(VALUE_TOKEN, 1);

    const controller = controllerFactory(container);
    expect(controller.getValue()).toBe(10);
  });

  it('should create a factory without DI dependencies', () => {
    const controllerFactory = declareViewController(() => ({
      getValue: () => 10,
    }));

    const container = createContainer();

    const controller = controllerFactory(container);
    expect(controller.getValue()).toBe(10);
  });

  it('should create a factory which accepts resolved dependencies and parameters as Queries', () => {
    const VALUE_TOKEN = token<number>();

    const controllerFactory = declareViewController(
      { value: VALUE_TOKEN },
      ({ value }) =>
        (arg: Query<number>) => ({
          getValue: () => value * 10 + arg.get(),
        }),
    );

    const container = createContainer();
    container.bindValue(VALUE_TOKEN, 1);

    const controller = controllerFactory(container, createStore(2));
    expect(controller.getValue()).toBe(12);
  });
});
