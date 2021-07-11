import { renderHook } from '@testing-library/react-hooks';

import { useConst } from './useConst';

describe('useConst()', () => {
  it('should return preserve the first value between rerenders', () => {
    const { result, rerender } = renderHook(({ value }) => useConst(value), {
      initialProps: { value: 1 },
    });
    expect(result.current).toBe(1);

    rerender({ value: 2 });
    expect(result.current).toBe(1);
  });

  it('should call the factory only once', () => {
    const factory1 = jest.fn(() => 1);
    const factory2 = jest.fn(() => 2);

    const { result, rerender } = renderHook(
      ({ factory }) => useConst(factory),
      {
        initialProps: { factory: factory1 },
      },
    );
    expect(result.current).toBe(1);

    rerender({ factory: factory2 });
    expect(result.current).toBe(1);

    expect(factory1).toBeCalledTimes(1);
    expect(factory2).toBeCalledTimes(0);
  });
});
