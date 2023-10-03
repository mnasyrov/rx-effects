import { nextSafeInteger } from '../utils';
import { ReactiveNode, setActiveConsumer } from './graph';

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

/**
 * Watches a reactive expression and allows it to be scheduled to re-run
 * when any dependencies notify of a change.
 *
 * `Watch` doesn't run reactive expressions itself, but relies on a consumer-provided
 * scheduling operation to coordinate calling `Watch.run()`.
 */
export class Watch extends ReactiveNode {
  private dirty = false;

  private action: undefined | ((onCleanup: WatchCleanupRegisterFn) => void);
  private schedule: undefined | ((watch: Watch) => void);
  private cleanupFn = NOOP_CLEANUP_FN;

  private registerOnCleanup = (cleanupFn: WatchCleanupFn) => {
    this.cleanupFn = cleanupFn;
  };

  constructor(
    action: (onCleanup: WatchCleanupRegisterFn) => void,
    schedule: (watch: Watch) => void,
  ) {
    super();
    this.action = action;
    this.schedule = schedule;
  }

  notify(): void {
    if (this.isDestroyed) {
      return;
    }

    const needsSchedule = !this.dirty;
    this.dirty = true;

    if (needsSchedule) {
      this.schedule?.(this);
    }
  }

  protected override onConsumerDependencyMayHaveChanged(): void {
    this.notify();
  }

  protected override onProducerUpdateValueVersion(): void {
    // Watches are not producers.
  }

  /**
   * Execute the reactive expression in the context of this `Watch` consumer.
   *
   * Should be called by the user scheduling algorithm when the provided
   * `schedule` hook is called by `Watch`.
   */
  run(): void {
    this.dirty = false;

    if (this.isDestroyed) {
      return;
    }

    if (this.trackingVersion !== -1 && !this.consumerPollProducersForChange()) {
      return;
    }

    const prevConsumer = setActiveConsumer(this);
    this.trackingVersion = nextSafeInteger(this.trackingVersion);
    try {
      this.cleanupFn();
      this.cleanupFn = NOOP_CLEANUP_FN;
      this.action?.(this.registerOnCleanup);
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }

  override destroy(): void {
    try {
      this.cleanupFn();
    } finally {
      this.action = undefined;
      this.schedule = undefined;
      this.cleanupFn = NOOP_CLEANUP_FN;

      if (!this.isDestroyed) {
        super.destroy();
      }
    }
  }
}
