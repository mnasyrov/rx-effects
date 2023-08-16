import { nextStoreVersion } from '../compute';

/**
 * Counter tracking the next `ProducerId` or `ConsumerId`.
 */
let _nextReactiveId = 0;

/**
 * Tracks the currently active reactive consumer (or `null` if there is no active
 * consumer).
 */
let activeConsumer: ReactiveNode | null = null;

/**
 * Whether the graph is currently propagating change notifications.
 */
let inNotificationPhase = false;

export function setActiveConsumer(
  consumer: ReactiveNode | null,
): ReactiveNode | null {
  const prev = activeConsumer;
  activeConsumer = consumer;
  return prev;
}

export function untracked<T>(nonReactiveReadsFn: () => T): T {
  const prevConsumer = setActiveConsumer(null);
  // We are not trying to catch any particular errors here, just making sure that the consumers
  // stack is restored in case of errors.
  try {
    return nonReactiveReadsFn();
  } finally {
    setActiveConsumer(prevConsumer);
  }
}

/**
 * A bidirectional edge in the dependency graph of `ReactiveNode`s.
 */
interface ReactiveEdge {
  /**
   * Weakly held reference to the consumer side of this edge.
   */
  readonly producerNode: WeakRef<ReactiveNode>;

  /**
   * Weakly held reference to the producer side of this edge.
   */
  readonly consumerNode: WeakRef<ReactiveNode>;
  /**
   * `trackingVersion` of the consumer at which this dependency edge was last observed.
   *
   * If this doesn't match the consumer's current `trackingVersion`, then this dependency record
   * is stale, and needs to be cleaned up.
   */
  atTrackingVersion: number;

  /**
   * `valueVersion` of the producer at the time this dependency was last accessed.
   */
  seenValueVersion: number;
}

/**
 * A node in the reactive graph.
 *
 * Nodes can be producers of reactive values, consumers of other reactive values, or both.
 *
 * Producers are nodes that produce values, and can be depended upon by consumer nodes.
 *
 * Producers expose a monotonic `valueVersion` counter, and are responsible for incrementing this
 * version when their value semantically changes. Some producers may produce their values lazily and
 * thus at times need to be polled for potential updates to their value (and by extension their
 * `valueVersion`). This is accomplished via the `onProducerUpdateValueVersion` method for
 * implemented by producers, which should perform whatever calculations are necessary to ensure
 * `valueVersion` is up to date.
 *
 * Consumers are nodes that depend on the values of producers and are notified when those values
 * might have changed.
 *
 * Consumers do not wrap the reads they consume themselves, but rather can be set as the active
 * reader via `setActiveConsumer`. Reads of producers that happen while a consumer is active will
 * result in those producers being added as dependencies of that consumer node.
 *
 * The set of dependencies of a consumer is dynamic. Implementers expose a monotonically increasing
 * `trackingVersion` counter, which increments whenever the consumer is about to re-run any reactive
 * reads it needs and establish a new set of dependencies as a result.
 *
 * Producers store the last `trackingVersion` they've seen from `Consumer`s which have read them.
 * This allows a producer to identify whether its record of the dependency is current or stale, by
 * comparing the consumer's `trackingVersion` to the version at which the dependency was
 * last observed.
 */
export abstract class ReactiveNode {
  private readonly id = _nextReactiveId++;

  /**
   * A cached weak reference to this node, which will be used in `ReactiveEdge`s.
   */
  private readonly ref = new WeakRef(this);

  /**
   * Edges to producers on which this node depends (in its consumer capacity).
   */
  private readonly producers = new Map<number, ReactiveEdge>();

  /**
   * Edges to consumers on which this node depends (in its producer capacity).
   */
  private readonly consumers = new Map<number, ReactiveEdge>();

  /**
   * Monotonically increasing counter representing a version of this `Consumer`'s
   * dependencies.
   */
  protected trackingVersion = 0;

  /**
   * Monotonically increasing counter which increases when the value of this `Producer`
   * semantically changes.
   */
  protected valueVersion = 0;

  // TODO
  // protected abstract destroy(): void;

  destroy(): void {
    // makeColdNode() {
    //   this.hot = false;
    //
    //   const { subscriptions } = this;
    //   if (subscriptions) {
    //     for (let i = 0; i < subscriptions.length; i++) {
    //       const unsubscribe = subscriptions[i];
    //       unsubscribe();
    //     }
    //   }
    //
    //   this.trackingVersion = undefined;
    //   this.valueRef = undefined;
    //   this.subscriptions = undefined;
    //   this.observers = undefined;
    // }
  }

  /**
   * Called for consumers whenever one of their dependencies notifies that it might have a new
   * value.
   */
  protected abstract onConsumerDependencyMayHaveChanged(): void;

  /**
   * Called for producers when a dependent consumer is checking if the producer's value has actually
   * changed.
   */
  protected abstract onProducerUpdateValueVersion(): void;

  /**
   * Polls dependencies of a consumer to determine if they have actually changed.
   *
   * If this returns `false`, then even though the consumer may have previously been notified of a
   * change, the values of its dependencies have not actually changed and the consumer should not
   * rerun any reactions.
   */
  protected consumerPollProducersForChange(): boolean {
    for (const [producerId, edge] of this.producers) {
      const producer = edge.producerNode.deref();

      if (!producer || edge.atTrackingVersion !== this.trackingVersion) {
        // This dependency edge is stale, so remove it.
        this.producers.delete(producerId);
        producer?.consumers.delete(this.id);
        continue;
      }

      if (producer.producerPollStatus(edge.seenValueVersion)) {
        // One of the dependencies reports a real value change.
        return true;
      }
    }

    // No dependency reported a real value change, so the `Consumer` has also not been
    // impacted.
    return false;
  }

  /**
   * Notify all consumers of this producer that its value may have changed.
   */
  protected producerMayHaveChanged(): void {
    // nextStoreVersion();
    // scheduleNotify(store);
    //
    // const pinnedState = currentState;
    // subscribers?.forEach((subscriber) => subscriber.next(pinnedState));

    // Prevent signal reads when we're updating the graph
    const prev = inNotificationPhase;
    inNotificationPhase = true;
    try {
      for (const [consumerId, edge] of this.consumers) {
        const consumer = edge.consumerNode.deref();

        if (!consumer || consumer.trackingVersion !== edge.atTrackingVersion) {
          this.consumers.delete(consumerId);
          consumer?.producers.delete(this.id);
          continue;
        }

        consumer.onConsumerDependencyMayHaveChanged();
      }
    } finally {
      inNotificationPhase = prev;
    }
  }

  /**
   * Mark that this producer node has been accessed in the current reactive context.
   */
  protected producerAccessed(): void {
    if (inNotificationPhase) {
      // Assertion error: signal read during notification phase
    }

    if (activeConsumer === null) {
      return;
    }

    // Either create or update the dependency `Edge` in both directions.
    let edge = activeConsumer.producers.get(this.id);
    if (edge === undefined) {
      edge = {
        consumerNode: activeConsumer.ref,
        producerNode: this.ref,
        seenValueVersion: this.valueVersion,
        atTrackingVersion: activeConsumer.trackingVersion,
      };
      activeConsumer.producers.set(this.id, edge);
      this.consumers.set(activeConsumer.id, edge);
    } else {
      edge.seenValueVersion = this.valueVersion;
      edge.atTrackingVersion = activeConsumer.trackingVersion;
    }
  }

  /**
   * Whether this consumer currently has any producers registered.
   */
  protected get hasProducers(): boolean {
    return this.producers.size > 0;
  }

  /**
   * Checks if a `Producer` has a current value which is different than the value
   * last seen at a specific version by a `Consumer` which recorded a dependency on
   * this `Producer`.
   */
  private producerPollStatus(lastSeenValueVersion: number): boolean {
    // `producer.valueVersion` may be stale, but a mismatch still means that the value
    // last seen by the `Consumer` is also stale.
    if (this.valueVersion !== lastSeenValueVersion) {
      return true;
    }

    // Trigger the `Producer` to update its `valueVersion` if necessary.
    this.onProducerUpdateValueVersion();

    // At this point, we can trust `producer.valueVersion`.
    return this.valueVersion !== lastSeenValueVersion;
  }
}