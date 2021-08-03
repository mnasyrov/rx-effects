import { firstValueFrom, materialize } from 'rxjs';
import { createAction } from './action';
import { createEffectScope } from './effectScope';

describe('EffectScope', () => {
  describe('destroy()', () => {
    it('should unsubscribe all collected subscriptions', () => {
      const scope = createEffectScope();
      const teardown = jest.fn();

      scope.add(teardown);
      scope.destroy();

      expect(teardown).toBeCalledTimes(1);
    });
  });

  describe('handleAction()', () => {
    it('should be able to unsubscribe the created effect from the action', async () => {
      const scope = createEffectScope();

      const action = createAction<number>();
      const handler = jest.fn((value) => value * 3);

      const effect = scope.handleAction(action, handler);
      scope.destroy();

      const resultPromise = firstValueFrom(effect.result$.pipe(materialize()));
      action(2);

      expect(await resultPromise).toEqual({ hasValue: false, kind: 'C' });
    });
  });

  describe('createEffect()', () => {
    it('should be able to unsubscribe the created effect from the action', async () => {
      const scope = createEffectScope();

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
      const scope = createEffectScope();

      const destroy = jest.fn();
      scope.createController(() => ({ destroy }));

      scope.destroy();
      expect(destroy).toBeCalledTimes(1);
    });
  });
});
