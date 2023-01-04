import { act, renderHook, waitFor } from '@testing-library/react';
import { createStore, Query } from 'rx-effects';
import { monitorSubscriptionCount } from './test/testUtils';
import { useQuery } from './useQuery';

describe('useQuery()', () => {
  it('should render with a current value and watch for value changes', async () => {
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
    await waitFor(() => expect(result.current).toBe(2));

    unmount();
    act(() => store.set(3));
    await waitFor(() => {
      expect(result.current).toBe(2);
      expect(subscriptionCount).toBe(0);
    });
  });
});
