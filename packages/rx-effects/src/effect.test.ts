import {
  exhaustMap,
  firstValueFrom,
  from,
  mapTo,
  materialize,
  Observable,
  of,
  tap,
  throwError,
  timer,
} from 'rxjs';
import { switchMap, take, toArray } from 'rxjs/operators';
import { createAction } from './action';
import { createEffect } from './effect';
import { GLOBAL_EFFECT_UNHANDLED_ERROR$ } from './effectController';

describe('Effect', () => {
  describe('result$', () => {
    it('should emit a result value of the handler', async () => {
      const effect = createEffect((value: number) => value * 2);
      const results = getFirstValues(effect.result$, 3);

      effect.handle(from([1, 2, 3]));
      expect(await results).toEqual([2, 4, 6]);
    });
  });

  describe('done$', () => {
    it('should emit an event and result value when the handler completes', async () => {
      const effect = createEffect((value: number) => value * 2);
      const results = getFirstValues(effect.done$, 3);

      effect.handle(from([1, 2, 3]));
      expect(await results).toEqual([
        { event: 1, result: 2 },
        { event: 2, result: 4 },
        { event: 3, result: 6 },
      ]);
    });
  });

  describe('error$', () => {
    it('should emit the error in case the handler fails', async () => {
      const effect = createEffect((value: number) => {
        if (value === 2) throw new Error('test error');
        return value * 2;
      });
      const results = getFirstValues(effect.error$, 1);

      effect.handle(from([1, 2, 3]));
      expect(await results).toEqual([
        { origin: 'handler', event: 2, error: new Error('test error') },
      ]);
    });

    it('should emit GLOBAL_EFFECT_UNHANDLED_ERROR$ in case error$ is not observed', async () => {
      const effect = createEffect<number>(() => {
        throw new Error('test error');
      });

      const promise = firstValueFrom(GLOBAL_EFFECT_UNHANDLED_ERROR$);
      effect.handle(of(1));

      expect(await promise).toEqual({
        origin: 'handler',
        event: 1,
        error: new Error('test error'),
      });
    });
  });

  describe('final$', () => {
    it('should emit source events in case the handler completes or fails', async () => {
      const effect = createEffect((value: number) => {
        if (value === 2) throw new Error('test error');
        return value * 2;
      });
      const results = getFirstValues(effect.final$, 3);

      effect.handle(from([1, 2, 3]));
      expect(await results).toEqual([
        {
          type: 'result',
          event: 1,
          result: 2,
        },
        {
          type: 'error',
          error: new Error('test error'),
          event: 2,
          origin: 'handler',
        },
        {
          type: 'result',
          event: 3,
          result: 6,
        },
      ]);
    });
  });

  describe('pending', () => {
    it('should indicate if the async handler works right now', async () => {
      const effect = createEffect((value: number) =>
        timer(10 * value).pipe(take(1), mapTo(value * 2)),
      );
      const results = getFirstValues(effect.result$, 3);

      expect(effect.pending.get()).toBe(false);

      effect.handle(from([1, 2, 3]));
      expect(effect.pending.get()).toBe(true);

      expect(await results).toEqual([2, 4, 6]);
      expect(effect.pending.get()).toBe(false);
    });
  });

  describe('pendingCount', () => {
    it('should contain a count of active handlers', async () => {
      const effect = createEffect((value: number) =>
        timer(40 - 10 * value).pipe(take(1), mapTo(value * 2)),
      );
      const results = getFirstValues(effect.result$, 3);

      expect(effect.pendingCount.get()).toBe(0);

      effect.handle(from([1, 2, 3]));
      expect(effect.pendingCount.get()).toBe(3);

      expect(await results).toEqual([6, 4, 2]);
      expect(effect.pendingCount.get()).toBe(0);
    });
  });

  describe('handle()', () => {
    it('should fail in case the source is not observable, action or query', () => {
      const effect = createEffect(() => undefined);
      expect(() => effect.handle('invalid-value' as any)).toThrowError(
        new TypeError('Unexpected source type'),
      );
    });

    it('should handle an action', async () => {
      const action = createAction<number>();
      const effect = createEffect((value: number) => value * 2);

      const result = firstValueFrom(effect.result$);
      const done = firstValueFrom(effect.done$);
      const final = firstValueFrom(effect.final$);

      effect.handle(action);
      action(1);

      expect(await result).toBe(2);
      expect(await done).toEqual({ event: 1, result: 2 });
      expect(await final).toEqual({ type: 'result', event: 1, result: 2 });
    });

    it('should propagate in error from the handler', async () => {
      const action = createAction<number>();
      const effect = createEffect<number>(() => {
        throw new Error('test error');
      });

      const errorPromise = firstValueFrom(effect.error$);
      const finalPromise = firstValueFrom(effect.final$);

      effect.handle(action);
      action(1);

      await expect(errorPromise).resolves.toEqual({
        origin: 'handler',
        event: 1,
        error: new Error('test error'),
      });
      await expect(finalPromise).resolves.toEqual({
        type: 'error',
        origin: 'handler',
        event: 1,
        error: new Error('test error'),
      });
    });

    it('should handle an observable', async () => {
      const effect = createEffect((value: number) => value * 2);

      const result = firstValueFrom(effect.result$);
      const done = firstValueFrom(effect.done$);
      const final = firstValueFrom(effect.final$);

      effect.handle(of(1));

      expect(await result).toBe(2);
      expect(await done).toEqual({ event: 1, result: 2 });
      expect(await final).toEqual({ type: 'result', event: 1, result: 2 });
    });

    it('should propagate an error from the source to error$ and final$ observables', async () => {
      const effect = createEffect((value: number) => value * 2);

      const errorPromise = firstValueFrom(effect.error$);
      const finalPromise = firstValueFrom(effect.final$);

      const theError = new Error('test error');

      expect(() =>
        effect.handle(throwError(() => theError)),
      ).not.toThrowError();

      await expect(errorPromise).resolves.toEqual({
        origin: 'source',
        error: theError,
      });
      await expect(finalPromise).resolves.toEqual({
        type: 'error',
        origin: 'source',
        error: theError,
      });
    });

    it('should handle error from the source', async () => {
      const effect = createEffect((value: number) => value * 2);

      const onSourceFailed = jest.fn();
      effect.error$.subscribe(({ error }) => onSourceFailed(error));
      effect.handle(throwError(() => new Error('test error')));

      expect(onSourceFailed).nthCalledWith(1, new Error('test error'));
    });

    it('should execute an observable in case the handler returns it', async () => {
      const effect = createEffect<number, number>((value: number) =>
        timer(10).pipe(mapTo(value)),
      );

      const resultPromise = getFirstValues(effect.result$, 3);
      effect.handle(from([1, 2, 3]));

      expect(effect.pending.get()).toBe(true);
      expect(await resultPromise).toEqual([1, 2, 3]);
      expect(effect.pending.get()).toBe(false);
    });

    it('should catch error of the observable handler', async () => {
      const effect = createEffect<number, number>((value: number) =>
        timer(10).pipe(
          switchMap(() => from([value * 2, value * 3, value * 5])),
          tap((result) => {
            if (result === 6) {
              throw new Error('test error');
            }
          }),
        ),
      );

      const resultPromise = getFirstValues(effect.result$, 4);
      const pendingCountPromise = getFirstValues(effect.pendingCount.value$, 5);
      const errorPromise = firstValueFrom(effect.error$);

      effect.handle(from([1, 2]));
      expect(effect.pendingCount.get()).toBe(2);

      expect(await resultPromise).toEqual([2, 3, 5, 4]);
      expect(effect.pendingCount.get()).toBe(0);

      expect(await pendingCountPromise).toEqual([0, 1, 2, 1, 0]);

      expect(await errorPromise).toEqual({
        origin: 'handler',
        event: 2,
        error: new Error('test error'),
      });
    });
  });

  describe('destroy()', () => {
    it('should cancel all internal subscriptions', () => {
      const listener = jest.fn();
      const action = createAction<number>();

      const effect = createEffect(listener);
      effect.handle(action);

      action(1);
      action(2);
      effect.destroy();
      action(3);

      expect(listener).toBeCalledTimes(2);
      expect(listener).nthCalledWith(1, 1);
      expect(listener).nthCalledWith(2, 2);
    });

    it('should completes result observables', async () => {
      const effect = createEffect(jest.fn());

      const donePromise = firstValueFrom(effect.done$.pipe(materialize()));
      const resultPromise = firstValueFrom(effect.result$.pipe(materialize()));
      const errorPromise = firstValueFrom(effect.error$.pipe(materialize()));
      const finalPromise = firstValueFrom(effect.final$.pipe(materialize()));
      const pendingPromise = firstValueFrom(
        effect.pending.value$.pipe(materialize(), toArray()),
      );
      const pendingCountPromise = firstValueFrom(
        effect.pendingCount.value$.pipe(materialize(), toArray()),
      );

      effect.destroy();

      const completedEvent = { hasValue: false, kind: 'C' };
      expect(await donePromise).toEqual(completedEvent);
      expect(await resultPromise).toEqual(completedEvent);
      expect(await errorPromise).toEqual(completedEvent);
      expect(await finalPromise).toEqual(completedEvent);

      expect(await pendingPromise).toEqual([
        {
          hasValue: true,
          kind: 'N',
          value: false,
        },
        completedEvent,
      ]);
      expect(await pendingCountPromise).toEqual([
        {
          hasValue: true,
          kind: 'N',
          value: 0,
        },
        completedEvent,
      ]);
    });
  });

  describe('EffectOptions.pipeline', () => {
    const timeIntervalHandler = (interval: number) =>
      timer(interval).pipe(mapTo(interval));

    it('should use the default mergeMap pipeline in case the option is not set', async () => {
      const effect = createEffect<number, number>(timeIntervalHandler);

      const resultPromise = getFirstValues(effect.result$, 3);
      effect.handle(from([100, 50, 10]));

      expect(effect.pending.get()).toBe(true);
      expect(await resultPromise).toEqual([10, 50, 100]);
      expect(effect.pending.get()).toBe(false);
    });

    it('should specify a custom pipeline (switchMap) for effect execution', async () => {
      const effect = createEffect<number, number>(timeIntervalHandler, {
        pipeline: (eventProject) => switchMap(eventProject),
      });

      const resultPromise = getFirstValues(effect.result$, 1);
      effect.handle(from([100, 50, 10]));

      expect(await resultPromise).toEqual([10]);
    });

    it('should specify a custom pipeline (exhaustMap) for effect execution', async () => {
      const effect = createEffect<number, number>(timeIntervalHandler, {
        pipeline: (eventProject) => exhaustMap(eventProject),
      });

      const resultPromise = getFirstValues(effect.result$, 1);
      effect.handle(from([100, 50, 10]));

      expect(await resultPromise).toEqual([100]);
    });
  });
});

describe('GLOBAL_EFFECT_UNHANDLED_ERROR$', () => {
  it('should emit event and error in case it is  observed', async () => {
    const effect = createEffect<number>(() => {
      throw 'test error';
    });

    const promise = firstValueFrom(GLOBAL_EFFECT_UNHANDLED_ERROR$);
    effect.handle(of(1));

    expect(await promise).toEqual({
      origin: 'handler',
      event: 1,
      error: 'test error',
    });
  });

  it('should print an error to the console in case it is not observed', async () => {
    const effect = createEffect<number>(() => {
      throw 'test error';
    });

    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    effect.handle(of(1));

    expect(consoleError).toBeCalledWith('Uncaught error in Effect', {
      origin: 'handler',
      event: 1,
      error: 'test error',
    });

    consoleError.mockReset();
  });
});

async function getFirstValues<T>(
  source: Observable<T>,
  count: number,
): Promise<Array<T>> {
  return firstValueFrom(source.pipe(take(count), toArray()));
}
