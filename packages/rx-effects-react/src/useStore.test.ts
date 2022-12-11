import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-test-renderer';
import { declareStateUpdates } from 'rx-effects';
import { useStore } from './useStore';

describe('useStore()', () => {
  const STATE_UPDATES = declareStateUpdates<number>({
    increase: () => (state) => state + 1,
    decrease: () => (state) => state - 1,
  });

  it('should render with the initial value, updates and a store', () => {
    const { result } = renderHook(() => useStore(0, STATE_UPDATES));

    const [value, updates, store] = result.current;

    expect(value).toBe(0);

    expect(updates).toMatchObject({
      increase: expect.any(Function),
      decrease: expect.any(Function),
    });

    expect(store).toMatchObject(
      expect.objectContaining({
        value$: expect.any(Object),
        get: expect.any(Function),
        set: expect.any(Function),
        update: expect.any(Function),
      }),
    );
  });

  it('should render a new value when the store is updated', () => {
    const { result } = renderHook(() => useStore(0, STATE_UPDATES));

    const [value1, updates1, store1] = result.current;
    expect(value1).toBe(0);

    act(() => {
      updates1.increase();
    });
    const [value2, updates2, store2] = result.current;

    expect(value2).toBe(1);
    expect(updates2).toBe(updates1);
    expect(store2).toBe(store1);
  });
});
