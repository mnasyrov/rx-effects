import { AnyObject, nextSafeInteger } from '../utils';

/**
 * Symbol used to tell `Signal`s apart from other functions.
 *
 * This can be used to auto-unwrap angular in various cases, or to auto-wrap non-signal values.
 */
const SIGNAL = Symbol.for('rx-effects.signal');

export let SIGNAL_CLOCK = -1;

export function updateSignalClock(): number {
  SIGNAL_CLOCK = nextSafeInteger(SIGNAL_CLOCK);
  return SIGNAL_CLOCK;
}

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
    [SIGNAL]: unknown;

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
    (value as Signal<unknown>)[SIGNAL] !== undefined
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
  (fn as any)[SIGNAL] = node;
  // Copy properties from `extraApi` to `fn` to complete the desired API of the `Signal`.
  return Object.assign(fn, extraApi) as Signal<T> & U;
}

export type ReactiveNode = Readonly<{
  destroy: () => void;
}>;

export type EffectNode = ReactiveNode &
  Readonly<{
    ref: WeakRef<EffectNode>;

    /**
     * Monotonically increasing counter representing a version of this `Consumer`'s
     * dependencies.
     */
    clock: number;

    notify: () => void;
  }>;

/**
 * Tracks the currently active effects
 */
let activeEffect: EffectNode | undefined = undefined;
let activeEffects: EffectNode[] = [];

export function getActiveEffect(): EffectNode | undefined {
  return activeEffect;
}

export function getActiveEffects(): EffectNode[] {
  return activeEffects;
}

export function setActiveEffect(
  effect: EffectNode | undefined,
): EffectNode | undefined {
  const prev = activeEffect;
  activeEffect = effect;

  if (effect) {
    activeEffects.push(effect);
  } else {
    activeEffects = [];
  }

  return prev;
}

export function untracked<T>(nonReactiveReadsFn: () => T): T {
  const prevActiveEffect = activeEffect;
  const prevActiveEffects = activeEffects;

  activeEffect = undefined;
  activeEffects = [];

  try {
    return nonReactiveReadsFn();
  } finally {
    activeEffect = prevActiveEffect;
    activeEffects = prevActiveEffects;
  }
}
