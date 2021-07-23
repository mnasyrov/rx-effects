import {
  firstValueFrom,
  from,
  mapTo,
  Observable,
  of,
  throwError,
  timer,
} from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { createAction } from './action';
import { createEffect } from './effect';

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
        { event: 2, error: new Error('test error') },
      ]);
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
      expect(await results).toEqual([1, 2, 3]);
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
      expect(await final).toBe(1);
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
        event: 1,
        error: new Error('test error'),
      });
      await expect(finalPromise).resolves.toBe(1);
    });

    it('should handle an observable', async () => {
      const effect = createEffect((value: number) => value * 2);

      const result = firstValueFrom(effect.result$);
      const done = firstValueFrom(effect.done$);
      const final = firstValueFrom(effect.final$);

      effect.handle(of(1));

      expect(await result).toBe(2);
      expect(await done).toEqual({ event: 1, result: 2 });
      expect(await final).toBe(1);
    });

    it('should handle error from the source', async () => {
      const effect = createEffect((value: number) => value * 2);

      const onSourceFailed = jest.fn();
      effect.handle(
        throwError(() => new Error('test error')),
        { onSourceFailed },
      );

      await expect(onSourceFailed).nthCalledWith(1, new Error('test error'));
    });

    // it('should execute an observable in case the handler returns it', async () => {
    //   const effect = createEffect<number, number>((value: number) =>
    //     firstValueFrom(timer(10).pipe(mapTo(value))),
    //   );
    //
    //   const resultPromise = getFirstValues(effect.result$, 3);
    //   effect.handle(of(3));
    //
    //   await expect(resultPromise).toEqual([30, 31, 32]);
    // });
  });
});

async function getFirstValues<T>(
  source: Observable<T>,
  count: number,
): Promise<Array<T>> {
  return firstValueFrom(source.pipe(take(count), toArray()));
}
