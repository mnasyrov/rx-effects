import { renderHook } from '@testing-library/react-hooks';
import { Controller } from 'rx-effects';
import { useController } from './useController';

describe('useController()', () => {
  it('should create a controller by the factory and destroy it on unmount', () => {
    const action = jest.fn();
    const destroy = jest.fn();

    function createController(): Controller<{
      value: number;
      action: () => void;
    }> {
      return { value: 1, action, destroy };
    }

    const { result, unmount } = renderHook(() =>
      useController(createController),
    );

    expect(result.current.value).toBe(1);

    result.current.action();
    expect(action).toBeCalledTimes(1);

    unmount();
    expect(destroy).toBeCalledTimes(1);
  });

  it('should recreate the controller if a dependency is changed', () => {
    const destroy = jest.fn();

    const createController = (value: number) => ({ value, destroy });

    const { result, rerender, unmount } = renderHook(
      ({ value }) => useController(() => createController(value), [value]),
      { initialProps: { value: 1 } },
    );

    const controller1 = result.current;
    expect(controller1.value).toBe(1);

    rerender({ value: 1 });
    const controller2 = result.current;
    expect(controller2).toBe(controller1);
    expect(controller2.value).toBe(1);

    rerender({ value: 2 });
    const controller3 = result.current;
    expect(controller3).not.toBe(controller2);
    expect(controller3.value).toBe(2);

    unmount();
    expect(destroy).toBeCalledTimes(2);
  });
});
