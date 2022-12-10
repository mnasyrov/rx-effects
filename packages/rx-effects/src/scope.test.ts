import { firstValueFrom, materialize, Subject, toArray } from 'rxjs';
import { createAction } from './action';
import { createScope } from './scope';
import { createStore } from './store';

describe('Scope', () => {
  describe('destroy()', () => {
    it('should unsubscribe all collected subscriptions', () => {
      const scope = createScope();
      const teardown = jest.fn();

      scope.onDestroy(teardown);
      scope.destroy();

      expect(teardown).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleAction()', () => {
    it('should be able to unsubscribe the created effect from the action', async () => {
      const scope = createScope();

      const action = createAction<number>();
      const handler = jest.fn((value) => value * 3);

      const effect = scope.handle(action, handler);
      scope.destroy();

      const resultPromise = firstValueFrom(effect.result$.pipe(materialize()));
      action(2);

      expect(await resultPromise).toEqual({ hasValue: false, kind: 'C' });
    });
  });

  describe('createEffect()', () => {
    it('should be able to unsubscribe the created effect from the action', async () => {
      const scope = createScope();

      const action = createAction<number>();
      const handler = jest.fn((value) => value * 3);

      const effect = scope.createEffect(handler);
      effect.handle(action);
      scope.destroy();

      const resultPromise = firstValueFrom(effect.result$.pipe(materialize()));
      action(2);

      expect(await resultPromise).toEqual({ hasValue: false, kind: 'C' });
    });
  });

  describe('createController()', () => {
    it('should be able to unsubscribe the created controller', async () => {
      const scope = createScope();

      const destroy = jest.fn();
      scope.createController(() => ({ destroy }));

      scope.destroy();
      expect(destroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('createStore()', () => {
    it('should be able to unsubscribe the created store', async () => {
      const scope = createScope();

      const store = scope.createStore(1);
      const valuePromise = firstValueFrom(store.value$.pipe(toArray()));

      store.set(2);
      scope.destroy();
      store.set(3);
      expect(await valuePromise).toEqual([1, 2]);
    });
  });

  describe('handleQuery()', () => {
    it('should be able to unsubscribe the created effect from the query', async () => {
      const store = createStore(1);

      const scope = createScope();

      const handler = jest.fn((value) => value * 3);

      const effect = scope.handle(store, handler);

      const resultPromise = firstValueFrom(
        effect.result$.pipe(materialize(), toArray()),
      );
      store.set(2);

      scope.destroy();
      store.set(3);

      expect(await resultPromise).toEqual([
        { hasValue: true, kind: 'N', value: 6 },
        { hasValue: false, kind: 'C' },
      ]);
    });
  });

  describe('subscribe()', () => {
    it('should be able to unsubscribe the created subscription from the observable', async () => {
      const subject = new Subject<number>();

      const scope = createScope();

      const handler = jest.fn((value) => value * 3);
      scope.subscribe(subject, handler);

      subject.next(2);

      scope.destroy();
      subject.next(3);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenLastCalledWith(2);
      expect(handler).toHaveLastReturnedWith(6);
    });

    it('should be subscribe an observer', async () => {
      const subject = new Subject<number>();

      const scope = createScope();

      const handler = jest.fn((value) => value * 3);
      scope.subscribe(subject, {
        next: handler,
      });

      subject.next(2);

      scope.destroy();
      subject.next(3);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenLastCalledWith(2);
      expect(handler).toHaveLastReturnedWith(6);
    });
  });
});
