import { act, renderHook } from '@testing-library/react-hooks';
import { Subject } from 'rxjs';
import { monitorSubscriptionCount } from './test/testUtils';
import { useObservable } from './useObservable';

describe('useObservable()', () => {
  it('should render with the initial state', () => {
    const source$ = new Subject();
    const { result } = renderHook(() => useObservable(source$, 1));
    expect(result.current).toBe(1);
  });

  it('should subscribe on changes and unsubscribe on unmount', () => {
    const source$ = new Subject();

    let subscriptionCount = 0;
    const monitor$ = source$.pipe(
      monitorSubscriptionCount((count) => (subscriptionCount = count)),
    );

    const { result, unmount } = renderHook(() => useObservable(monitor$, 1));
    expect(subscriptionCount).toBe(1);

    act(() => source$.next(2));
    expect(result.current).toBe(2);

    unmount();
    act(() => source$.next(3));
    expect(result.current).toBe(2);
    expect(subscriptionCount).toBe(0);
  });

  it('should update the result only if the state comparator does not match a previous state with a next state', () => {
    type State = { key: number; value: number };
    const source$ = new Subject<State>();
    const initialState = { key: 1, value: 1 };

    const { result } = renderHook(() =>
      useObservable(
        source$,
        initialState,
        (state1, state2) => state1.key === state2.key,
      ),
    );
    expect(result.current).toEqual({ key: 1, value: 1 });

    act(() => source$.next({ key: 1, value: 2 }));
    expect(result.current).toEqual({ key: 1, value: 1 });

    act(() => source$.next({ key: 2, value: 3 }));
    expect(result.current).toEqual({ key: 2, value: 3 });
  });
});
