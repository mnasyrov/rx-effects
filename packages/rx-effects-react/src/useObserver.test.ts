import { renderHook } from '@testing-library/react-hooks';
import { BehaviorSubject, PartialObserver, Subject } from 'rxjs';
import { isBrowser, useObserver } from './useObserver';

describe('useObserver()', () => {
  it('should subscribe a listener for next values', () => {
    const source$ = new Subject();
    const listener = jest.fn();

    renderHook(() => useObserver(source$, listener));

    source$.next(1);
    expect(listener).toHaveBeenNthCalledWith(1, 1);
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

    expect(observer.next).toHaveBeenCalledWith(1);
    expect(observer.complete).toHaveBeenCalled();
  });

  it('should resubscribe if a only source is changed', () => {
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

    expect(listener1).toHaveBeenNthCalledWith(1, 1);
    expect(listener1).toHaveBeenNthCalledWith(2, 2);
    expect(listener2).toHaveBeenCalledTimes(0);

    source2$.next(1);
    expect(listener2).toHaveBeenNthCalledWith(1, 1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  it('should handled it all variants of the listener', () => {
    const sourceNext$ = new BehaviorSubject(1);

    expect(() => {
      renderHook(() =>
        useObserver(sourceNext$, {
          next: undefined,
        }),
      );
      renderHook(() => useObserver(sourceNext$, undefined as any));

      sourceNext$.next(1);
    }).not.toThrow();

    const sourceError$ = new BehaviorSubject(1);
    expect(() => {
      renderHook(() =>
        useObserver(sourceError$, {
          error: undefined,
        }),
      );
      renderHook(() => useObserver(sourceError$, undefined as any));
      sourceError$.error(new Error('some error'));
    }).not.toThrow();

    const sourceComplete$ = new BehaviorSubject(1);
    expect(() => {
      renderHook(() =>
        useObserver(sourceComplete$, {
          complete: undefined,
        }),
      );
      renderHook(() => useObserver(sourceComplete$, undefined as any));
      sourceComplete$.complete();
    }).not.toThrow();
  });

  it('should subscribe to error', () => {
    const source$ = new Subject();
    const observer: PartialObserver<unknown> = {
      error: jest.fn(),
    };

    renderHook(() => useObserver(source$, observer));

    source$.error(new Error('some error'));

    expect(observer.error).toHaveBeenCalledTimes(1);
  });

  it('should use useLayoutEffect when isBrowser is true', () => {
    jest.resetModules();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.window = {};

    const useIsomorphicLayoutEffect =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('./useObserver').useIsomorphicLayoutEffect;

    expect(typeof useIsomorphicLayoutEffect).toBe('function');

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete global.window;
  });

  it('should return a subscription', () => {
    const source$ = new BehaviorSubject(1);
    const listener = jest.fn();

    const { result } = renderHook(() => useObserver(source$, listener));

    result.current.unsubscribe();
    source$.next(2);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(1);
  });

  it('should do nothing if is unsubscribe', () => {
    const source1$ = new BehaviorSubject(1);
    const source2$ = new BehaviorSubject(1);
    const listener = jest.fn();

    const { result, rerender } = renderHook(
      ({ source$ }) => useObserver(source$, listener),
      { initialProps: { source$: source1$ } },
    );

    result.current.unsubscribe();

    rerender({ source$: source2$ });

    source2$.next(2);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(1);
  });

  it('should unsubscribe on unmount', () => {
    const source$ = new BehaviorSubject(1);
    const listener = jest.fn();

    const { result, unmount } = renderHook(() =>
      useObserver(source$, listener),
    );

    unmount();
    source$.next(2);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(1);
    expect(result.current.closed).toBe(true);
  });

  it('should unsubscribe old Observable and subscribe to new one when it changes', () => {
    const source1$ = new BehaviorSubject(1);
    const source2$ = new BehaviorSubject(2);
    const listener = jest.fn();

    const { rerender } = renderHook(
      ({ source$ }) => {
        useObserver(source$, listener);
      },
      {
        initialProps: {
          source$: source1$,
        },
      },
    );

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith(1);

    rerender({ source$: source2$ });

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(2);
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

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener1).toHaveBeenCalledWith(1);

    expect(listener2).toHaveBeenCalledTimes(0);
  });
});

describe('isBrowser()', () => {
  it('should return true when the window exists', () => {
    const isBrowserFalsy = isBrowser();
    expect(isBrowserFalsy).toBeFalsy();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.window = {};

    const isBrowserTruthy = isBrowser();
    expect(isBrowserTruthy).toBeTruthy();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete global.window;
  });
});
