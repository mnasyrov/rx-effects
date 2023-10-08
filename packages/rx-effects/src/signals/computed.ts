import { nextSafeInteger } from '../utils';
import {
  createSignalFromFunction,
  defaultEquals,
  Signal,
  SIGNAL_CLOCK,
  ValueEqualityFn,
} from './common';
import { getActiveEffect, ReactiveNode } from './graph';

export type Computation<T> = () => T;

export type CreateComputedOptions<T> = {
  equal?: ValueEqualityFn<T>;
};

/**
 * Create a computed `Signal` which derives a reactive value from an expression.
 *
 * @developerPreview
 */
export function computed<T>(
  computation: Computation<T>,
  options?: CreateComputedOptions<T>,
): Signal<T> {
  const node = new ComputedImpl(computation, options?.equal ?? defaultEquals);

  return createSignalFromFunction(node, node.signal.bind(node), {
    destroy: node.destroy.bind(node),
  });
}

/**
 * A dedicated symbol used before a computed value has been calculated for the first time.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
const UNSET: any = Symbol('UNSET');

/**
 * A dedicated symbol used in place of a computed signal value to indicate that a given computation
 * is in progress. Used to detect cycles in computation chains.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
const COMPUTING: any = Symbol('COMPUTING');

/**
 * A dedicated symbol used in place of a computed signal value to indicate that a given computation
 * failed. The thrown error is cached until the computation gets dirty again.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
const ERRORED: any = Symbol('ERRORED');

/**
 * A computation, which derives a value from a declarative reactive expression.
 *
 * `Computed`s are both producers and consumers of reactivity.
 */
export class ComputedImpl<T> extends ReactiveNode {
  private clock = SIGNAL_CLOCK;

  constructor(
    private computation: Computation<T>,
    private equal: (oldValue: T, newValue: T) => boolean,
  ) {
    super();
  }
  /**
   * Current value of the computation.
   *
   * This can also be one of the special values `UNSET`, `COMPUTING`, or `ERRORED`.
   */
  private value: T = UNSET;

  /**
   * If `value` is `ERRORED`, the error caught from the last computation attempt which will
   * be re-thrown.
   */
  private error: unknown = null;

  /**
   * Flag indicating that the computation is currently stale, meaning that one of the
   * dependencies has notified of a potential change.
   *
   * It's possible that no dependency has _actually_ changed, in which case the `stale`
   * state can be resolved without recomputing the value.
   */
  private get stale(): boolean {
    return this.value === UNSET || this.clock !== SIGNAL_CLOCK;
  }

  private recomputeValue(): void {
    if (this.value === COMPUTING) {
      // Our computation somehow led to a cyclic read of itself.
      throw new Error('Detected cycle in computations.');
    }

    const oldValue = this.value;
    this.value = COMPUTING;

    // As we're re-running the computation, update our dependent tracking version number.
    let newValue: T;
    try {
      newValue = this.computation();
    } catch (err) {
      newValue = ERRORED;
      this.error = err;
    }

    // this.stale = false;
    this.clock = SIGNAL_CLOCK;

    if (
      oldValue !== UNSET &&
      oldValue !== ERRORED &&
      newValue !== ERRORED &&
      this.equal(oldValue, newValue)
    ) {
      // No change to `valueVersion` - old and new values are
      // semantically equivalent.
      this.value = oldValue;
      return;
    }

    this.value = newValue;
    this.valueVersion = nextSafeInteger(this.valueVersion);
  }

  signal(): T {
    if (this.isDestroyed) throw new Error('Signal was destroyed');

    if (this.stale || !getActiveEffect()) {
      this.recomputeValue();
    }

    // Record that someone looked at this signal.
    this.producerAccessed();

    if (this.value === ERRORED) {
      throw this.error;
    }

    return this.value;
  }
}
