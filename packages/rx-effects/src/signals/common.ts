import { dump } from '../../test/testUtils';
import { AnyObject, nextSafeInteger } from '../utils';

/**
 * Symbol used to tell `Signal`s apart from other functions.
 *
 * This can be used to auto-unwrap angular in various cases, or to auto-wrap non-signal values.
 */
const SIGNAL_SYMBOL = Symbol.for('rx-effects.signal');

/**
 * A reactive value which notifies consumers of any changes.
 *
 * Signals are functions which returns their current value. To access the current value of a signal,
 * call it.
 *
 * Ordinary values can be turned into `Signal`s with the `signal` function.
 *
 * @developerPreview
 */
export type Signal<T> = (() => T) &
  Readonly<{
    [SIGNAL_SYMBOL]: unknown;

    destroy(): void;
  }>;

/**
 * Checks if the given `value` is a reactive `Signal`.
 *
 * @developerPreview
 */
export function isSignal(value: unknown): value is Signal<unknown> {
  return (
    typeof value === 'function' &&
    (value as Signal<unknown>)[SIGNAL_SYMBOL] !== undefined
  );
}

/**
 * A comparison function which can determine if two values are equal.
 */
export type ValueEqualityFn<T> = (a: T, b: T) => boolean;

/**
 * The default equality function used for `signal` and `computed`, which treats values using identity semantics.
 */
export const defaultEquals: ValueEqualityFn<unknown> = Object.is;

/**
 * Converts `fn` into a marked signal function (where `isSignal(fn)` will be `true`).
 *
 * @param fn A zero-argument function which will be converted into a `Signal`.
 */
export function createSignalFromFunction<T>(
  node: ReactiveNode,
  fn: () => T,
): Signal<T>;

/**
 * Converts `fn` into a marked signal function (where `isSignal(fn)` will be `true`), and
 * potentially add some set of extra properties (passed as an object record `extraApi`).
 *
 * @param fn A zero-argument function which will be converted into a `Signal`.
 * @param extraApi An object whose properties will be copied onto `fn` in order to create a specific
 *     desired interface for the `Signal`.
 */
export function createSignalFromFunction<T, U extends Record<string, unknown>>(
  node: ReactiveNode,
  fn: () => T,
  extraApi: U,
): Signal<T> & U;

/**
 * Converts `fn` into a marked signal function (where `isSignal(fn)` will be `true`), and
 * potentially add some set of extra properties (passed as an object record `extraApi`).
 */
export function createSignalFromFunction<
  T,
  U extends Record<string, unknown> = AnyObject,
>(node: ReactiveNode, fn: () => T, extraApi: U = {} as U): Signal<T> & U {
  (fn as any)[SIGNAL_SYMBOL] = node;
  // Copy properties from `extraApi` to `fn` to complete the desired API of the `Signal`.
  return Object.assign(fn, extraApi) as Signal<T> & U;
}

export type ReactiveNode = Readonly<{
  destroy: () => void;
}>;

export type ComputedNode<T> = ReactiveNode &
  Readonly<{
    clock: number;
    version: number;
    signal: () => T;
    isChanged: () => boolean;
  }>;

export type EffectNode = ReactiveNode &
  Readonly<{
    id: number;

    ref: WeakRef<EffectNode>;

    /**
     * Monotonically increasing counter representing a version of this `Consumer`'s
     * dependencies.
     */
    clock: number;

    notify: () => void;
  }>;

export class SignalContext {
  private untrackedMutex = 0;
  private currentEffect: EffectNode | undefined = undefined;
  private trackedEffects: EffectNode[] = [];
  private visitedComputedNodes: ComputedNode<any>[] = [];

  clock = -1;

  updateSignalClock(): void {
    const prevClock = this.clock;

    this.clock = nextSafeInteger(this.clock);

    dump('updateSignalClock()', { prev: prevClock, next: this.clock });
  }

  getCurrentEffect(): EffectNode | undefined {
    if (this.untrackedMutex > 0) return undefined;

    dump('getCurrentEffect()', { currentEffect: this.currentEffect });

    return this.currentEffect;
  }

  getTrackedEffects(): EffectNode[] {
    if (this.untrackedMutex > 0) return [];

    dump('getTrackedEffects()', { trackedEffects: this.trackedEffects });

    return this.trackedEffects;
  }

  setCurrentEffect(effect: EffectNode | undefined): EffectNode | undefined {
    const prev = this.currentEffect;
    this.currentEffect = effect;

    if (this.untrackedMutex === 0) {
      if (effect) {
        this.trackedEffects.push(effect);
      } else {
        this.trackedEffects = [];
      }
    }

    dump('setCurrentEffect()', {
      prev,
      effect,
      trackedEffects: this.trackedEffects,
    });

    return prev;
  }

  getVisitedComputedNodes(): ComputedNode<any>[] {
    dump('getVisitedComputedNodes()', {
      visitedComputedNodes: this.visitedComputedNodes,
    });

    return this.visitedComputedNodes;
  }

  resetVisitedComputedNodes() {
    dump('resetVisitedComputedNodes()');

    this.visitedComputedNodes = [];
  }

  visitComputedNode(node: ComputedNode<any>) {
    if (this.untrackedMutex > 0) return;

    dump('visitComputedNode()', {
      currentEffect: this.currentEffect,
      visitedComputedNodes: this.visitedComputedNodes,
    });

    if (this.currentEffect) {
      this.visitedComputedNodes.push(node);
    }
  }

  untracked<T>(nonReactiveReadsFn: () => T): T {
    this.untrackedMutex++;

    dump('untracked() begin', { untrackMutex: this.untrackedMutex });

    try {
      return nonReactiveReadsFn();
    } finally {
      this.untrackedMutex--;

      dump('untracked() end', { untrackMutex: this.untrackedMutex });
    }
  }

  // untracked<T>(nonReactiveReadsFn: () => T): T {
  //   const prevActiveEffect = this.activeEffect;
  //   const prevActiveEffects = this.activeEffects;
  //   const prevVisitedComputedNodes = this.visitedComputedNodes;
  //
  //   this.activeEffect = undefined;
  //   this.activeEffects = [];
  //   this.visitedComputedNodes = [];
  //
  //   try {
  //     return nonReactiveReadsFn();
  //   } finally {
  //     this.activeEffect = prevActiveEffect;
  //     this.activeEffects = prevActiveEffects;
  //     this.visitedComputedNodes = prevVisitedComputedNodes;
  //   }
  // }
}

export const SIGNAL_CONTEXT = new SignalContext();
