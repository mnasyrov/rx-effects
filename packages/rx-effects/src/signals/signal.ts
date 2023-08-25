import { nextSafeInteger } from '../utils';
import {
  createSignalFromFunction,
  defaultEquals,
  Signal,
  ValueEqualityFn,
} from './common';
import { ReactiveNode } from './graph';

/**
 * A `Signal` with a value that can be mutated via a setter interface.
 *
 * @developerPreview
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
   * Returns a readonly version of this signal. Readonly angular-signals can be accessed to read their value
   * but can't be changed using set, update or mutate methods. The readonly angular-signals do _not_ have
   * any built-in mechanism that would prevent deep-mutation of their value.
   */
  asReadonly(): Signal<T>;

  /**
   * Immediately notifies dependents if there is a pending changes
   */
  notify(): void;

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

class WritableSignalImpl<T> extends ReactiveNode {
  private readonlySignal: Signal<T> | undefined;

  private readonly name?: string;
  private readonly equal: ValueEqualityFn<T>;
  private readonly onDestroy?: () => void;

  constructor(private value: T, options?: SignalOptions<T>) {
    super();

    this.name = options?.name;
    this.equal = options?.equal ?? defaultEquals;
    this.onDestroy = options?.onDestroy;
  }

  protected override onConsumerDependencyMayHaveChanged(): void {
    // This never happens for writable angular-signals as they're not consumers.
  }

  protected override onProducerUpdateValueVersion(): void {
    // Writable signal value versions are always up-to-date.
  }

  signal(): T {
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
    if (!this.equal(this.value, newValue)) {
      this.value = newValue;
      this.valueVersion = nextSafeInteger(this.valueVersion);

      // TODO: это может сделать асинхронным?
      this.producerMayHaveChanged();
    }
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
      this.readonlySignal = createSignalFromFunction(this, () => this.signal());
    }
    return this.readonlySignal;
  }

  notify() {
    // TODO: удалить?
    // TODO: как следать опциональный синхронный notify()?
    // const pinnedState = currentState;
    // subscribers?.forEach((subscriber) => subscriber.next(pinnedState));
  }

  destroy(): void {
    // this.destroyNode();

    // subscribers?.forEach((subscriber) => subscriber.complete());
    // subscribers = [];

    this.onDestroy?.();
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

      notify: signalNode.notify.bind(signalNode),
      destroy: signalNode.destroy.bind(signalNode),
    },
  );

  return result;
}
