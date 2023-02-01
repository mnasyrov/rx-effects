import { renderHook } from '@testing-library/react-hooks';
import { Container, token } from 'ditox';
import { DependencyContainer, useDependency } from 'ditox-react';
import React from 'react';
import {
  declareController,
  declareViewController,
  InferredService,
  Query,
} from 'rx-effects';
import {
  createControllerContainer,
  useInjectableController,
  useViewController,
} from './mvc';

describe('useInjectableController()', () => {
  it('should fail in case there is no a dependency container in the render tree', () => {
    const viewController = declareController({}, () => ({}));

    const { result } = renderHook(() =>
      useInjectableController(viewController),
    );

    expect(result.error).toEqual(
      new Error('Container is not provided by DependencyContainer component'),
    );
  });

  it('should not fail in case there is a dependency container in the render tree', () => {
    const viewController = declareController({}, () => ({}));

    const { result } = renderHook(
      () => useInjectableController(viewController),
      {
        wrapper: ({ children }) => (
          <DependencyContainer>{children}</DependencyContainer>
        ),
      },
    );

    expect(result.error).toBeUndefined();
  });

  it('should injects dependencies from a container in the render tree', () => {
    const VALUE_TOKEN = token<number>();
    const valueBinder = (container: Container) => {
      container.bindValue(VALUE_TOKEN, 1);
    };

    const onDestroy = jest.fn();

    const viewController = declareController(
      { value: VALUE_TOKEN },
      ({ value }) => ({
        getValue: () => value * 10,
        destroy: () => onDestroy(),
      }),
    );

    const { result, unmount } = renderHook(
      () => useInjectableController(viewController),
      {
        wrapper: ({ children }) => (
          <DependencyContainer binder={valueBinder}>
            {children}
          </DependencyContainer>
        ),
      },
    );

    expect(result.current.getValue()).toBe(10);
    expect(onDestroy).toHaveBeenCalledTimes(0);

    unmount();
    expect(onDestroy).toHaveBeenCalledTimes(1);
  });
});
describe('useViewController()', () => {
  it('should fail in case there is no a dependency container in the render tree', () => {
    const viewController = declareViewController(() => ({}));

    const { result } = renderHook(() => useViewController(viewController));

    expect(result.error).toEqual(
      new Error('Container is not provided by DependencyContainer component'),
    );
  });

  it('should not fail in case there is a dependency container in the render tree', () => {
    const viewController = declareViewController(() => ({}));

    const { result } = renderHook(() => useViewController(viewController), {
      wrapper: ({ children }) => (
        <DependencyContainer>{children}</DependencyContainer>
      ),
    });

    expect(result.error).toBeUndefined();
  });

  it('should injects dependencies from a container in the render tree', () => {
    const VALUE_TOKEN = token<number>();
    const valueBinder = (container: Container) => {
      container.bindValue(VALUE_TOKEN, 1);
    };

    const onDestroy = jest.fn();

    const viewController = declareViewController(
      { value: VALUE_TOKEN },
      ({ value }) => ({
        getValue: () => value * 10,
        destroy: () => onDestroy(),
      }),
    );

    const { result, unmount } = renderHook(
      () => useViewController(viewController),
      {
        wrapper: ({ children }) => (
          <DependencyContainer binder={valueBinder}>
            {children}
          </DependencyContainer>
        ),
      },
    );

    expect(result.current.getValue()).toBe(10);
    expect(onDestroy).toHaveBeenCalledTimes(0);

    unmount();
    expect(onDestroy).toHaveBeenCalledTimes(1);
  });

  it('should create a view controller and pass parameters to it without recreation', () => {
    const VALUE_TOKEN = token<number>();
    const valueBinder = (container: Container) => {
      container.bindValue(VALUE_TOKEN, 1);
    };

    const onDestroy = jest.fn();

    const viewController = declareViewController(
      { value: VALUE_TOKEN },
      ({ value }) =>
        (scope, param: Query<number>) => ({
          getValue: () => value * 10 + param.get(),
          destroy: () => onDestroy(),
        }),
    );

    const { result, rerender, unmount } = renderHook(
      (param: number) => useViewController(viewController, param),
      {
        initialProps: 2,
        wrapper: ({ children }) => (
          <DependencyContainer binder={valueBinder}>
            {children}
          </DependencyContainer>
        ),
      },
    );

    expect(result.current.getValue()).toBe(12);
    expect(onDestroy).toHaveBeenCalledTimes(0);

    rerender(4);
    expect(result.current.getValue()).toBe(14);
    expect(onDestroy).toHaveBeenCalledTimes(0);

    unmount();
    expect(onDestroy).toHaveBeenCalledTimes(1);
  });
});

describe('createControllerContainer()', () => {
  it('should create a Functional Component which add a provided controller to DI tree', () => {
    const VALUE_TOKEN = token<number>();
    const valueBinder = (container: Container) => {
      container.bindValue(VALUE_TOKEN, 1);
    };

    const controllerFactory = declareController(
      { value: VALUE_TOKEN },
      ({ value }) => {
        return {
          getValue: () => value,
        };
      },
    );

    const serviceToken = token<InferredService<typeof controllerFactory>>();
    const ControllerContainer = createControllerContainer(
      serviceToken,
      controllerFactory,
    );

    const { result } = renderHook(() => useDependency(serviceToken), {
      wrapper: ({ children }) => (
        <DependencyContainer binder={valueBinder}>
          <ControllerContainer>{children}</ControllerContainer>
        </DependencyContainer>
      ),
    });

    expect(result.current.getValue()).toBe(1);
  });
});
