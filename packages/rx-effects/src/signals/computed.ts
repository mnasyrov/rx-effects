import {
  createSignalFromFunction,
  defaultEquals,
  EffectNode,
  getActiveEffect,
  ReactiveNode,
  Signal,
  SIGNAL_CLOCK,
  ValueEqualityFn,
} from './common';

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
export class ComputedImpl<T> implements ReactiveNode {
  private clock = SIGNAL_CLOCK;

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
  private error: unknown = undefined;

  private lastEffectRef: WeakRef<EffectNode> | undefined;

  constructor(
    private computation: Computation<T>,
    private equal: (oldValue: T, newValue: T) => boolean,
  ) {}

  destroy(): void {
    this.value = UNSET;
    this.lastEffectRef = undefined;
  }

  signal(): T {
    if (this.value === COMPUTING) {
      // Our computation somehow led to a cyclic read of itself.
      throw new Error('Detected cycle in computations');
    }

    const activeEffect = getActiveEffect();

    const isStale =
      this.clock !== SIGNAL_CLOCK ||
      this.value === UNSET ||
      !activeEffect ||
      this.lastEffectRef !== activeEffect.ref;

    if (isStale) {
      this.lastEffectRef = activeEffect?.ref;
      this.recomputeValue();
    }

    if (this.value === ERRORED) {
      throw this.error;
    }

    return this.value;
  }

  private recomputeValue(): void {
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
  }
}
