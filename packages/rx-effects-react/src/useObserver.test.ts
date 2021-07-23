import { renderHook } from '@testing-library/react-hooks';
import { BehaviorSubject, PartialObserver, Subject } from 'rxjs';
import { useObserver } from './useObserver';

describe('useObserver()', () => {
  it('should subscribe a listener for next values', () => {
    const source$ = new Subject();
    const listener = jest.fn();

    renderHook(() => useObserver(source$, listener));

    source$.next(1);
    expect(listener).nthCalledWith(1, 1);
  });

  it('should subscribe an observer', () => {
    const source$ = new Subject();
    const observer: PartialObserver<unknown> = {
      next: jest.fn(),
      complete: jest.fn(),
    };

    renderHook(() => useObserver(source$, observer));
    source$.next(1);
    source$.complete();

    expect(observer.next).toBeCalledWith(1);
    expect(observer.complete).toBeCalled();
  });

  it('should resubscribe if a source or listener is changed', () => {
    const source1$ = new BehaviorSubject(1);
    const source2$ = new BehaviorSubject(2);
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    const { rerender } = renderHook(
      ({ source$, listener }) => useObserver(source$, listener),
      { initialProps: { source$: source1$, listener: listener1 } },
    );
    rerender({ source$: source2$, listener: listener1 });
    rerender({ source$: source2$, listener: listener2 });

    expect(listener1).nthCalledWith(1, 1);
    expect(listener1).nthCalledWith(2, 2);
    expect(listener2).nthCalledWith(1, 2);
  });

  it('should return a subscription', () => {
    const source$ = new BehaviorSubject(1);
    const listener = jest.fn();

    const { result } = renderHook(() => useObserver(source$, listener));

    result.current.unsubscribe();
    source$.next(2);

    expect(listener).toBeCalledTimes(1);
    expect(listener).toBeCalledWith(1);
  });

  it('should unsubscribe on unmount', () => {
    const source$ = new BehaviorSubject(1);
    const listener = jest.fn();

    const { result, unmount } = renderHook(() =>
      useObserver(source$, listener),
    );

    unmount();
    source$.next(2);

    expect(listener).toBeCalledTimes(1);
    expect(listener).toBeCalledWith(1);
    expect(result.current.closed).toBe(true);
  });

  it("should not subscribe a new observer in case hook's subscription was unsubscribed", () => {
    const source$ = new BehaviorSubject(1);
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    const { result, rerender } = renderHook(
      ({ listener }) => useObserver(source$, listener),
      { initialProps: { listener: listener1 } },
    );

    result.current.unsubscribe();
    rerender({ listener: listener2 });
    source$.next(2);

    expect(listener1).toBeCalledTimes(1);
    expect(listener1).toBeCalledWith(1);

    expect(listener2).toBeCalledTimes(0);
  });
});
