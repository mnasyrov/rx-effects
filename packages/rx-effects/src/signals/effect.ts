import { MicrotaskScheduler } from '../utils';
import { Watch } from './watch';

/**
 * An effect can, optionally, register a cleanup function. If registered, the cleanup is executed
 * before the next effect run. The cleanup function makes it possible to "cancel" any work that the
 * previous effect run might have started.
 */
export type EffectCleanupFn = () => void;

/**
 * A callback passed to the effect function that makes it possible to register cleanup logic.
 */
export type EffectCleanupRegisterFn = (cleanupFn: EffectCleanupFn) => void;

/**
 * A global reactive effect, which can be manually destroyed.
 */
export interface EffectRef {
  /**
   * Shut down the effect, removing it from any upcoming scheduled executions.
   */
  destroy(): void;
}

/**
 * Options passed to the `effect` function.
 */
export interface CreateEffectOptions {
  sync?: boolean;
}

export function effect(
  effectFn: (onCleanup: EffectCleanupRegisterFn) => void,
  options?: CreateEffectOptions,
): EffectRef {
  const manager = options?.sync ? SYNC_EFFECT_MANAGER : ASYNC_EFFECT_MANAGER;
  return manager.create(effectFn);
}

export type EffectManager = Readonly<{
  create: (effectFn: (onCleanup: EffectCleanupRegisterFn) => void) => EffectRef;

  flush: () => void;
}>;

export class AsyncEffectManager implements EffectManager {
  private readonly scheduler = new MicrotaskScheduler<Watch>((entry) => {
    entry.run();
  });

  create(effectFn: (onCleanup: EffectCleanupRegisterFn) => void): EffectRef {
    const watch = new Watch(effectFn, (watch) =>
      this.scheduler.schedule(watch),
    );

    // Effects start dirty.
    watch.notify();

    return {
      destroy: () => {
        this.scheduler.remove(watch);
        watch.cleanup();
      },
    };
  }

  flush(): void {
    this.scheduler.execute();
  }
}

export class SyncEffectManager implements EffectManager {
  create(effectFn: (onCleanup: EffectCleanupRegisterFn) => void): EffectRef {
    const watch = new Watch(effectFn, (watch) => watch.run());

    // Effects start dirty.
    watch.notify();

    return {
      destroy() {
        watch.cleanup();
      },
    };
  }

  flush() {
    // Do nothing
  }
}

export const ASYNC_EFFECT_MANAGER: EffectManager = new AsyncEffectManager();
export const SYNC_EFFECT_MANAGER: EffectManager = new SyncEffectManager();
