import { act, renderHook } from '@testing-library/react-hooks';
import { identity, Subject } from 'rxjs';
import { monitorSubscriptionCount } from './test/testUtils';
import { useSelector } from './useSelector';

describe('useSelector()', () => {
  it('should render with the initial state', () => {
    const source$ = new Subject();
    const { result } = renderHook(() => useSelector(source$, 1, identity));
    expect(result.current).toBe(1);
  });

  it('should subscribe on changes and unsubscribe on unmount', () => {
    const source$ = new Subject();

    let subscriptionCount = 0;
    const monitor$ = source$.pipe(
      monitorSubscriptionCount((count) => (subscriptionCount = count)),
    );

    const { result, unmount } = renderHook(() =>
      useSelector(monitor$, 1, identity),
    );
    expect(subscriptionCount).toBe(1);

    act(() => source$.next(2));
    expect(result.current).toBe(2);

    unmount();
    act(() => source$.next(3));
    expect(result.current).toBe(2);
    expect(subscriptionCount).toBe(0);
  });

  it('should map state with the selector', () => {
    type State = { value: number };
    const source$ = new Subject<State>();
    const initialState = { value: 1 };

    const { result } = renderHook(() =>
      useSelector(source$, initialState, (state) => state.value),
    );
    expect(result.current).toBe(1);

    act(() => source$.next({ value: 2 }));
    expect(result.current).toBe(2);
  });

  it('should update the result only if the state comparator does not match a previous state with a next state', () => {
    type State = { key: number; value: number };
    const source$ = new Subject<State>();
    const initialState = { key: 1, value: 1 };

    const { result } = renderHook(() =>
      useSelector(
        source$,
        initialState,
        identity,
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
