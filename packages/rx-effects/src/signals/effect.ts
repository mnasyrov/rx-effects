import { MicrotaskScheduler, SyncTaskScheduler } from '../utils';
import { Watch } from './watch';

export const ASYNC_EFFECT_SCHEDULER = new MicrotaskScheduler<Watch>((entry) =>
  entry.run(),
);

export const SYNC_EFFECT_SCHEDULER = new SyncTaskScheduler<Watch>((entry) =>
  entry.run(),
);

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
export type EffectRef = Readonly<{
  /**
   * Shut down the effect, removing it from any upcoming scheduled executions.
   */
  destroy(): void;
}>;

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
  const scheduler = options?.sync
    ? SYNC_EFFECT_SCHEDULER
    : ASYNC_EFFECT_SCHEDULER;

  const watch = new Watch(effectFn, scheduler.schedule);

  // Effects start dirty.
  watch.notify();

  return {
    destroy: () => watch.destroy(),
  };
}
