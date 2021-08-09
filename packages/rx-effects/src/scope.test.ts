import { firstValueFrom, materialize, toArray } from 'rxjs';
import { createAction } from './action';
import { createScope } from './scope';
import { declareState } from './stateDeclaration';

describe('Scope', () => {
  describe('destroy()', () => {
    it('should unsubscribe all collected subscriptions', () => {
      const scope = createScope();
      const teardown = jest.fn();

      scope.add(teardown);
      scope.destroy();

      expect(teardown).toBeCalledTimes(1);
    });
  });

  describe('handleAction()', () => {
    it('should be able to unsubscribe the created effect from the action', async () => {
      const scope = createScope();

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
      expect(destroy).toBeCalledTimes(1);
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

  describe('createDeclaredStore()', () => {
    it('should be able to unsubscribe the created store bya declaration', async () => {
      const scope = createScope();

      const declaration = declareState(1);
      const store = scope.createDeclaredStore(declaration);
      const valuePromise = firstValueFrom(store.value$.pipe(toArray()));

      store.set(2);
      scope.destroy();
      store.set(3);
      expect(await valuePromise).toEqual([1, 2]);
    });
  });
});
