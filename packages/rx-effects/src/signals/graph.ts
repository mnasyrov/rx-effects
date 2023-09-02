import { nextSafeInteger } from '../utils';

type ReactiveNodeId = number;

/**
 * Counter tracking the next `ProducerId` or `ConsumerId`.
 */
let _nextReactiveId: ReactiveNodeId = -1;

function nextReactiveId(): ReactiveNodeId {
  _nextReactiveId = nextSafeInteger(_nextReactiveId);
  return _nextReactiveId;
}

/**
 * Tracks the currently active reactive consumer (or `null` if there is no active
 * consumer).
 */
let activeConsumer: ReactiveNode | undefined = undefined;

export function setActiveConsumer(
  consumer: ReactiveNode | undefined,
): ReactiveNode | undefined {
  const prev = activeConsumer;
  activeConsumer = consumer;
  return prev;
}

export function untracked<T>(nonReactiveReadsFn: () => T): T {
  const prevConsumer = setActiveConsumer(undefined);
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
type ReactiveEdge = {
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
};

// const GRAPH_NODES = new Map<number, ReactiveNode>();
//
// const GRAPH_NODE_FINALIZER = new FinalizationRegistry<number>((key) => {
//   // console.log('!!! GRAPH_NODE_FINALIZER', key, GRAPH_NODES.size);
//   GRAPH_NODES.delete(key);
// });
//
// function registerNode(id: number, node: ReactiveNode): void {
//   GRAPH_NODES.set(id, node);
//   GRAPH_NODE_FINALIZER.register(node, id);
// }
//
// function getNode(id: number): ReactiveNode | undefined {
//   return GRAPH_NODES.get(id);
// }

// const GRAPH_NODES = new Map<number, WeakRef<ReactiveNode>>();
//
// function registerNode(id: number, node: ReactiveNode): void {
//   const ref = new WeakRef(node);
//   GRAPH_NODES.set(id, ref);
// }
//
// function getNode(id: number): ReactiveNode | undefined {
//   const result = GRAPH_NODES.get(id)?.deref();
//   if (!result) GRAPH_NODES.delete(id);
//   return result;
// }

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
 * `valueVersion` is up-to-date.
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
  // private readonly id: ReactiveNodeId = nextReactiveId();

  /**
   * A cached weak reference to this node, which will be used in `ReactiveEdge`s.
   */
  // private readonly ref = new WeakRef(this);
  // private readonly ref = mockWeakRef(this);
  // private readonly ref = cacheWeakRef(this, this.id);

  /**
   * Edges to producers on which this node depends (in its consumer capacity).
   */
  private readonly producers = new Map<ReactiveNode, ReactiveEdge>();

  /**
   * Edges to consumers on which this node depends (in its producer capacity).
   */
  private readonly consumers = new Map<ReactiveNode, ReactiveEdge>();

  /**
   * Monotonically increasing counter representing a version of this `Consumer`'s
   * dependencies.
   */
  protected trackingVersion = -1;

  /**
   * Monotonically increasing counter which increases when the value of this `Producer`
   * semantically changes.
   */
  protected valueVersion = -1;

  // TODO
  // protected abstract destroy(): void;

  destroy(): void {
    this.producers.forEach((edge, producer) => producer.consumers.delete(this));
    this.producers.clear();

    this.consumers.forEach((edge, consumer) => consumer.producers.delete(this));
    this.consumers.clear();
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
    for (const [producer, edge] of this.producers) {
      if (edge.atTrackingVersion !== this.trackingVersion) {
        // This dependency edge is stale, so remove it.
        this.producers.delete(producer);
        producer.consumers.delete(this);
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
    // Prevent signal reads when we're updating the graph
    for (const [consumer, edge] of this.consumers) {
      if (consumer.trackingVersion !== edge.atTrackingVersion) {
        this.consumers.delete(consumer);
        consumer.producers.delete(this);
        continue;
      }

      consumer.onConsumerDependencyMayHaveChanged();
    }
  }

  /**
   * Mark that this producer node has been accessed in the current reactive context.
   */
  protected producerAccessed(): void {
    if (!activeConsumer) {
      return;
    }

    // Either create or update the dependency `Edge` in both directions.
    let edge = this.consumers.get(activeConsumer);
    if (!edge) {
      edge = {
        seenValueVersion: this.valueVersion,
        atTrackingVersion: activeConsumer.trackingVersion,
      };
      activeConsumer.producers.set(this, edge);
      this.consumers.set(activeConsumer, edge);
    } else {
      edge.seenValueVersion = this.valueVersion;
      edge.atTrackingVersion = activeConsumer.trackingVersion;
    }
  }

  /**
   * Whether this consumer currently has any producers registered.
   */
  protected hasProducers(): boolean {
    return this.producers.size > 0;
  }

  /**
   * Checks if a `Producer` has a current value which is different from the value
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
