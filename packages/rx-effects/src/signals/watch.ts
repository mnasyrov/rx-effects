import { nextSafeInteger, Runnable } from '../utils';
import { ComputedNode, EffectNode } from './common';
import { SIGNAL_RUNTIME } from './runtime';

/**
 * A cleanup function that can be optionally registered from the watch logic. If registered, the
 * cleanup logic runs before the next watch execution.
 */
export type WatchCleanupFn = () => void;

/**
 * A callback passed to the watch function that makes it possible to register cleanup logic.
 */
export type WatchCleanupRegisterFn = (cleanupFn: WatchCleanupFn) => void;

const NOOP_CLEANUP_FN: WatchCleanupFn = () => undefined;
let WATCH_ID = 0;
/**
 * Watches a reactive expression and allows it to be scheduled to re-run
 * when any dependencies notify of a change.
 *
 * `Watch` doesn't run reactive expressions itself, but relies on a consumer-provided
 * scheduling operation to coordinate calling `Watch.run()`.
 */
export class Watch implements EffectNode, Runnable {
  readonly id: number = (WATCH_ID = nextSafeInteger(WATCH_ID));
  readonly ref: WeakRef<EffectNode> = new WeakRef(this);
  clock = 0;

  private dirty = false;
  isDestroyed = false;

  private action: undefined | ((onCleanup: WatchCleanupRegisterFn) => void);
  private schedule: undefined | ((watch: Watch) => void);
  private cleanupFn = NOOP_CLEANUP_FN;

  private seenComputedNodes: undefined | ComputedNode<any>[];

  private registerOnCleanup = (cleanupFn: WatchCleanupFn) => {
    this.cleanupFn = cleanupFn;
  };

  constructor(
    action: (onCleanup: WatchCleanupRegisterFn) => void,
    schedule: (watch: Watch) => void,
  ) {
    this.action = action;
    this.schedule = schedule;
  }

  notify = (): void => {
    if (this.isDestroyed) {
      return;
    }

    this.clock = nextSafeInteger(this.clock);
    const needsSchedule = !this.dirty;
    this.dirty = true;

    if (needsSchedule) {
      this.schedule?.(this);
    }
  };

  /**
   * Execute the reactive expression in the context of this `Watch` consumer.
   *
   * Should be called by the user scheduling algorithm when the provided
   * `schedule` hook is called by `Watch`.
   */
  run(): void {
    if (!this.dirty) {
      return;
    }

    this.dirty = false;

    if (this.isDestroyed) {
      return;
    }

    const prevEffect = SIGNAL_RUNTIME.setCurrentEffect(this);

    const isChanged =
      !this.seenComputedNodes || isComputedNodesChanged(this.seenComputedNodes);

    if (!isChanged) {
      SIGNAL_RUNTIME.setCurrentEffect(prevEffect);
      return;
    }

    try {
      this.cleanupFn();
      this.cleanupFn = NOOP_CLEANUP_FN;
      this.action?.(this.registerOnCleanup);
    } finally {
      SIGNAL_RUNTIME.setCurrentEffect(prevEffect);

      this.seenComputedNodes = SIGNAL_RUNTIME.getVisitedComputedNodes();

      if (!prevEffect) {
        SIGNAL_RUNTIME.resetVisitedComputedNodes();
      }
    }
  }

  destroy(): void {
    this.isDestroyed = true;
    this.action = undefined;
    this.schedule = undefined;
    this.seenComputedNodes = undefined;

    try {
      this.cleanupFn();
    } finally {
      this.cleanupFn = NOOP_CLEANUP_FN;
    }
  }
}

function isComputedNodesChanged(nodes: ComputedNode<any>[]): boolean {
  if (nodes.length === 0) {
    return true;
  }

  for (const node of nodes) {
    if (node.isChanged()) {
      return true;
    }
  }

  return false;
}
