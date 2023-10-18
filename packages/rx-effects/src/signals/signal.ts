import {
  createSignalFromFunction,
  defaultEquals,
  EffectNode,
  ReactiveNode,
  Signal,
  ValueEqualityFn,
} from './common';
import { SIGNAL_RUNTIME } from './runtime';

/**
 * A `Signal` with a value that can be mutated via a setter interface.
 */
export interface WritableSignal<T> extends Signal<T> {
  /**
   * Directly set the signal to a new value, and notify any dependents.
   */
  set(value: T): void;

  /**
   * Update the value of the signal based on its current value, and
   * notify any dependents.
   */
  update(updateFn: (value: T) => T): void;

  // /**
  //  * Update the current value by mutating it in-place, and
  //  * notify any dependents.
  //  */
  // mutate(mutatorFn: (value: T) => void): void;

  /**
   * Returns a readonly version of this signal. Readonly angular can be accessed to read their value
   * but can't be changed using set, update or mutate methods. The readonly angular do _not_ have
   * any built-in mechanism that would prevent deep-mutation of their value.
   */
  asReadonly(): Signal<T>;

  destroy(): void;
}

/**
 * Options passed to the `signal` creation function.
 */
export type SignalOptions<T> = {
  /**
   * Signal's name
   */
  name?: string;

  /**
   * A comparison function which defines equality for signal values.
   */
  equal?: ValueEqualityFn<T>;

  /**
   * Callback is called when the store is destroyed.
   */
  onDestroy?: () => void;
};

class WritableSignalImpl<T> implements ReactiveNode {
  private readonlySignal: Signal<T> | undefined;

  private readonly name?: string;
  private readonly equal: ValueEqualityFn<T>;
  private readonly onDestroy?: () => void;
  private readonly consumerEffects = new Map<WeakRef<EffectNode>, number>();

  private isDestroyed = false;

  constructor(private value: T, options?: SignalOptions<T>) {
    this.name = options?.name;
    this.equal = options?.equal ?? defaultEquals;
    this.onDestroy = options?.onDestroy;
  }

  signal(): T {
    if (this.isDestroyed) {
      throw new Error('Signal is destroyed');
    }

    this.producerAccessed();
    return this.value;
  }

  /**
   * Directly update the value of the signal to a new value, which may or may not be
   * equal to the previous.
   *
   * In the event that `newValue` is semantically equal to the current value, `set` is
   * a no-op.
   */
  set(newValue: T): void {
    if (this.equal(this.value, newValue)) {
      return;
    }

    this.value = newValue;
    SIGNAL_RUNTIME.updateSignalClock();

    this.producerChanged();
  }

  /**
   * Derive a new value for the signal from its current value using the `updater` function.
   *
   * This is equivalent to calling `set` on the result of running `updater` on the current
   * value.
   */
  update(updater: (value: T) => T): void {
    this.set(updater(this.value));
  }

  // /**
  //  * Calls `mutator` on the current value and assumes that it has been mutated.
  //  */
  // mutate(mutator: (value: T) => void): void {
  //   // Mutate bypasses equality checks as it's by definition changing the value.
  //   mutator(this.value);
  //   this.valueVersion++;
  //   this.producerMayHaveChanged();
  // }

  asReadonly(): Signal<T> {
    if (this.readonlySignal === undefined) {
      this.readonlySignal = createSignalFromFunction(
        this,
        () => this.signal(),
        { destroy: () => this.destroy() },
      );
    }
    return this.readonlySignal;
  }

  destroy() {
    this.consumerEffects.clear();
    this.isDestroyed = true;
    this.onDestroy?.();
  }

  /**
   * Notify all consumers of this producer that its value is changed.
   */
  protected producerChanged(): void {
    for (const [effectRef, atEffectClock] of this.consumerEffects) {
      const effect = effectRef.deref();

      if (!effect || effect.clock !== atEffectClock || effect.isDestroyed) {
        this.consumerEffects.delete(effectRef);
        continue;
      }

      effect?.notify?.();
    }
  }

  /**
   * Mark that this producer node has been accessed in the current reactive context.
   */
  protected producerAccessed(): void {
    const effects = SIGNAL_RUNTIME.getTrackedEffects();

    if (effects.length > 0) {
      effects.forEach((effect) => {
        if (!effect.isDestroyed) {
          this.consumerEffects.set(effect.ref, effect.clock);
        }
      });
    }
  }
}

/**
 * Create a `Signal` that can be set or updated directly.
 */
export function signal<T>(
  initialValue: T,
  options?: SignalOptions<T>,
): WritableSignal<T> {
  const signalNode = new WritableSignalImpl<T>(initialValue, options);

  const result: WritableSignal<T> = createSignalFromFunction(
    signalNode,
    signalNode.signal.bind(signalNode),
    {
      set: signalNode.set.bind(signalNode),
      update: signalNode.update.bind(signalNode),
      // mutate: signalNode.mutate.bind(signalNode),
      asReadonly: signalNode.asReadonly.bind(signalNode),

      destroy: signalNode.destroy.bind(signalNode),
    },
  );

  return result;
}
