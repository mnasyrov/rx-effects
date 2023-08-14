/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { MicrotaskScheduler } from '../../utils';
import { Watch } from '../src/watch';

/**
 * An effect can, optionally, register a cleanup function. If registered, the cleanup is executed
 * before the next effect run. The cleanup function makes it possible to "cancel" any work that the
 * previous effect run might have started.
 *
 * @developerPreview
 */
export type EffectCleanupFn = () => void;

/**
 * A callback passed to the effect function that makes it possible to register cleanup logic.
 */
export type EffectCleanupRegisterFn = (cleanupFn: EffectCleanupFn) => void;

/**
 * Tracks all effects registered within a given application and runs them via `flush`.
 */
export class EffectManager {
  private all = new Set<Watch>();
  private queue = new Set<Watch>();

  create(
    effectFn: (onCleanup: (cleanupFn: EffectCleanupFn) => void) => void,
    allowSignalWrites: boolean,
  ): EffectRef {
    const watch = new Watch(
      effectFn,
      (watch) => {
        if (!this.all.has(watch)) {
          return;
        }

        this.queue.add(watch);
      },
      allowSignalWrites,
    );

    this.all.add(watch);

    // Effects start dirty.
    watch.notify();

    const destroy = () => {
      watch.cleanup();
      this.all.delete(watch);
      this.queue.delete(watch);
    };

    return {
      destroy,
    };
  }

  flush(): void {
    if (this.queue.size === 0) {
      return;
    }

    for (const watch of this.queue) {
      this.queue.delete(watch);
      watch.run();
    }
  }

  get isQueueEmpty(): boolean {
    return this.queue.size === 0;
  }
}

/**
 * A global reactive effect, which can be manually destroyed.
 *
 * @developerPreview
 */
export interface EffectRef {
  /**
   * Shut down the effect, removing it from any upcoming scheduled executions.
   */
  destroy(): void;
}

/**
 * Options passed to the `effect` function.
 *
 * @developerPreview
 */
export interface CreateEffectOptions {
  /**
   * Whether the `effect` should allow writing to angular-signals.
   *
   * Using effects to synchronize data by writing to angular-signals can lead to confusing and potentially
   * incorrect behavior, and should be enabled only when necessary.
   */
  allowSignalWrites?: boolean;

  // TODO: Remove?
  sync?: boolean;
}

/**
 * Create a global `Effect` for the given reactive function.
 *
 * @developerPreview
 */
export function effect(
  effectFn: (onCleanup: EffectCleanupRegisterFn) => void,
  options?: CreateEffectOptions,
): EffectRef {
  const effectManager = getEffectManager();
  return effectManager.create(effectFn, options);
}

// TODO
let EFFECT_MANAGER: MyEffectManager | undefined;

export function getEffectManager(): MyEffectManager {
  if (!EFFECT_MANAGER) {
    EFFECT_MANAGER = new MyEffectManager();
  }
  return EFFECT_MANAGER;
}

export class MyEffectManager {
  private readonly scheduler = new MicrotaskScheduler<Watch>((entry) => {
    entry.run();
  });

  create(
    effectFn: (onCleanup: (cleanupFn: EffectCleanupFn) => void) => void,
    options?: CreateEffectOptions,
  ): EffectRef {
    const allowSignalWrites = options?.allowSignalWrites === true;
    const sync = options?.sync === true;

    const watch = new Watch(
      effectFn,
      (watch) => {
        // TODO: Remove sync mode?
        if (sync) {
          watch.run();
          return;
        }

        this.scheduler.schedule(watch);
      },

      allowSignalWrites,
    );

    // Effects start dirty.
    watch.notify();

    const destroy = () => {
      watch.cleanup();
      this.scheduler.remove(watch);
    };

    return {
      destroy,
    };
  }

  flush(): void {
    this.scheduler.execute();
  }

  get isQueueEmpty(): boolean {
    return this.scheduler.isEmpty();
  }
}
