import { act, renderHook } from '@testing-library/react-hooks';
import { createStore, Query, StateQuery } from 'rx-effects';
import { monitorSubscriptionCount } from './test/testUtils';
import { useQuery, useStateQuery } from './useQuery';

describe('useQuery()', () => {
  it('should render with a current value and watch for value changes', () => {
    const store = createStore(1);
    let subscriptionCount = 0;

    const query: Query<number> = {
      get: store.get,
      value$: store.value$.pipe(
        monitorSubscriptionCount((count) => (subscriptionCount = count)),
      ),
    };

    const { result, unmount } = renderHook(() => useQuery(query));
    expect(result.current).toBe(1);
    expect(subscriptionCount).toBe(1);

    act(() => store.set(2));
    expect(result.current).toBe(2);

    unmount();
    act(() => store.set(3));
    expect(result.current).toBe(2);
    expect(subscriptionCount).toBe(0);
  });
});

/**
 * @deprecated
 */
describe('useStateQuery()', () => {
  it('should render with a current value and watch for value changes', () => {
    const store = createStore(1);
    let subscriptionCount = 0;

    const query: StateQuery<number> = {
      get: store.get,
      value$: store.value$.pipe(
        monitorSubscriptionCount((count) => (subscriptionCount = count)),
      ),
    };

    const { result, unmount } = renderHook(() => useStateQuery(query));
    expect(result.current).toBe(1);
    expect(subscriptionCount).toBe(1);

    act(() => store.set(2));
    expect(result.current).toBe(2);

    unmount();
    act(() => store.set(3));
    expect(result.current).toBe(2);
    expect(subscriptionCount).toBe(0);
  });
});
