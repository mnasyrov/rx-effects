import { createEffectController } from './effectController';

describe('EffectController', () => {
  describe('start()', () => {
    it('should increase pendingCount', () => {
      const controller = createEffectController();
      expect(controller.state.pendingCount.get()).toBe(0);

      controller.start();
      expect(controller.state.pendingCount.get()).toBe(1);

      controller.start();
      expect(controller.state.pendingCount.get()).toBe(2);
    });
  });

  describe('complete()', () => {
    it('should decrease pendingCount', () => {
      const controller = createEffectController();

      controller.start();
      controller.start();
      expect(controller.state.pendingCount.get()).toBe(2);

      controller.complete();
      controller.complete();
      expect(controller.state.pendingCount.get()).toBe(0);
    });

    it('should not decrease pendingCount below zero', () => {
      const controller = createEffectController();

      controller.complete();
      expect(controller.state.pendingCount.get()).toBe(0);

      controller.start();
      controller.complete();
      controller.complete();
      expect(controller.state.pendingCount.get()).toBe(0);
    });
  });
});
