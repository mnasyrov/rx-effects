/* eslint-disable no-var */
import { Observable, Observer } from 'rxjs';
import { Query } from './query';
import { DEFAULT_COMPARATOR, removeFromArray } from './utils';

type Comparator<T> = (a: T, b: T) => boolean;

/// PUBLIC API

/**
 * This function returns a current value of a provided Query and registers it as a dependency for computation.
 */
export type ComputationResolver = {
  <T>(query: Query<T>): T;
  <T, R>(query: Query<T>, selector: (value: T) => R): R;
};

/**
 * This function calculates a value from external sources or resolved sources by a provided "resolver".
 */
export type Computation<T> = (resolver: ComputationResolver) => T;

/**
 * Creates a computable query which calculates its values by provided "computation" function and dependencies.
 *
 * Rules of "Computation" function:
 * - it must have no side effects
 * - it recalculates only when specified dependencies are updated
 * - its "formula" may have other sources of values, however they don't trigger updates
 *
 * "Computation" function provides a resolver for using a dependency withing a calculation expression.
 *
 * Dependency can be declared explicitly as an array by the second argument. It has the following advantages:
 * - Faster dependency subscription
 * - Ability to specify extra queries or observables as dependencies
 *
 * A custom value comparator can be specified by "options" object as the second argument.
 * It helps to decide if a new value differs from a previous one in complex cases.
 *
 * @example
 * ```ts
 * const greeting = createStore('Hello');
 * const username = createStore('World');
 *
 * // Dependency are implicitly resolved
 * const message = compute((get) => get(greeting) + ' ' + get(username) + '!');
 *
 * // Dependency declared explicitly
 * const messageUppercase = compute(() => message.get().toUpperCase(), [message]);
 *
 * expect(message.get()).toBe('Hello World!');
 * expect(messageUppercase.get()).toBe('HELLO WORLD!');
 * ```
 */
export function compute<T>(
  computation: Computation<T>,
  comparator?: Comparator<T>,
): Query<T> {
  const node = createComputationNode(computation, comparator);
  return createComputationQuery(node);
}

/// INTERNAL

type ValueRef<T> = { value: T; params?: Array<unknown>; version?: number };

/** @internal */
export type Node<T> = {
  computation: Computation<T>;
  comparator?: (a: T, b: T) => boolean;
  hot: boolean;
  version?: number;
  valueRef?: ValueRef<T>;
  resolvedDeps?: ReadonlySet<Query<unknown>>;
  subscriptions?: (() => void)[];
  observers?: Observer<T>[];
  depObserver?: Observer<T>;
};

/** @internal */
export function createComputationNode<T>(
  computation: Computation<T>,
  comparator?: Comparator<T>,
): Node<T> {
  return {
    hot: false,
    computation,
    comparator,
  };
}

/** @internal */
export function createComputationQuery<T>(node: Node<T>): Query<T> {
  const query = {
    _computed: true,

    get: () => getQueryValue(node),

    value$: new Observable<T>((observer) => {
      addValueObserver(node, observer);

      return () => removeValueObserver(node, observer);
    }),
  };

  return query;
}

/// COMPUTATION ENGINE

var NODE_VERSION = 0;
var STORE_VERSION = 0;

var DEPS_COLLECTOR: undefined | ((query: Query<unknown>) => void);
var RECOMPUTE = false;

const FAST_QUERY_GETTER: ComputationResolver = (
  query: Query<unknown>,
  selector?: (value: unknown) => unknown,
) => {
  const value = query.get();
  return selector ? selector(value) : value;
};

/** @internal */
export function nextVersion(currentValue: number): number {
  return currentValue >= Number.MAX_SAFE_INTEGER ? 0 : currentValue + 1;
}

/** @internal */
export function nextNodeVersion() {
  NODE_VERSION = nextVersion(NODE_VERSION);
}

/** @internal */
export function nextStoreVersion() {
  STORE_VERSION = nextVersion(STORE_VERSION);
}

export function getQueryValue<T>(node: Node<T>): T {
  if (DEPS_COLLECTOR) {
    if (node.version === NODE_VERSION && node.valueRef) {
      return node.valueRef.value;
    }

    node.version = NODE_VERSION;
    node.valueRef = calculate(node.computation);
    return node.valueRef.value;
  }

  if (RECOMPUTE) {
    if (node.version === NODE_VERSION && node.valueRef) {
      return node.valueRef.value;
    }

    node.version = NODE_VERSION;
    node.valueRef = calculate(node.computation);
    return node.valueRef.value;
  }

  if (node.valueRef?.version === STORE_VERSION) {
    return node.valueRef.value;
  }

  return node.computation(FAST_QUERY_GETTER);
}

export function addValueObserver<T>(node: Node<T>, observer: Observer<T>) {
  if (!node.observers) node.observers = [];
  node.observers.push(observer);

  nextNodeVersion();
  makeHotNode(node, observer);
}

export function removeValueObserver<T>(node: Node<T>, observer: Observer<T>) {
  node.observers = removeFromArray(node.observers, observer);

  if (!node.observers || node.observers.length === 0) {
    makeColdNode(node);
  }
}

function makeHotNode<T>(node: Node<T>, observer: Observer<T>) {
  if (node.hot && node.valueRef) {
    observer.next(node.valueRef.value);
    return;
  }

  let valueRef = node.valueRef;
  if (node.resolvedDeps) {
    if (!valueRef) {
      valueRef = node.valueRef = calculate(node.computation);
    }
  } else {
    const visitedDeps: Set<Query<unknown>> = new Set();

    DEPS_COLLECTOR = (query) => {
      if (!(query as any)._computed) visitedDeps.add(query);
    };
    const next = calculate(node.computation);
    DEPS_COLLECTOR = undefined;

    if (!valueRef || isNodeValueChanged(node, next)) {
      valueRef = node.valueRef = next;
    }

    node.resolvedDeps = visitedDeps;
  }

  if (node.resolvedDeps.size > 0) {
    node.resolvedDeps.forEach((parentQuery) => {
      if (!node.depObserver) {
        node.depObserver = {
          next: () => onSourceChanged(node),
          error: (error: any) => onSourceError(node, error),
          complete: () => onSourceComplete(node),
        };
      }
      const subscription = parentQuery.value$.subscribe(
        node.depObserver as any,
      );

      if (!node.subscriptions) node.subscriptions = [];
      node.subscriptions.push(() => subscription.unsubscribe());
    });
  }

  node.hot = true;

  observer.next(valueRef.value);
}

export function makeColdNode<T>(node: Node<T>) {
  node.hot = false;

  const { subscriptions } = node;
  if (subscriptions) {
    for (let i = 0; i < subscriptions.length; i++) {
      const unsubscribe = subscriptions[i];
      unsubscribe();
    }
  }

  node.version = undefined;
  node.valueRef = undefined;
  node.subscriptions = undefined;
  node.observers = undefined;
}

function onSourceChanged<T>(node: Node<T>) {
  nextNodeVersion();
  recompute(node);
}

export function onSourceError<T>(node: Node<T>, error: any) {
  const { observers } = node;

  if (observers) {
    for (let i = 0; i < observers.length; i++) {
      const observer = observers[i];
      observer.error(error);
    }
  }

  node.observers = undefined;
  makeColdNode(node);
}

export function onSourceComplete<T>(node: Node<T>) {
  const { observers } = node;

  if (observers) {
    for (let i = 0; i < observers.length; i++) {
      const observer = observers[i];
      observer.complete();
    }
  }

  node.observers = undefined;
  makeColdNode(node);
}

export function recompute<T>(node: Node<T>) {
  if (!node.hot || !node.observers || node.version === NODE_VERSION) return;
  node.version = NODE_VERSION;

  RECOMPUTE = true;
  let next;
  try {
    next = calculate(node.computation);
  } finally {
    RECOMPUTE = false;
  }

  const isChanged = isNodeValueChanged(node, next);
  if (isChanged) {
    node.valueRef = next;
    const value = next.value;
    const observers = node.observers;

    for (let i = 0; i < observers.length; i++) {
      const observer = observers[i];
      observer.next(value);
    }
  } else if (node.valueRef) {
    node.valueRef.version = STORE_VERSION;
  }
}

function calculate<T>(computation: Computation<T>): ValueRef<T> {
  let params: Array<unknown> | undefined;

  const value = computation(
    (query: Query<unknown>, selector?: (value: unknown) => unknown) => {
      let param = query.get();

      if (selector) param = selector(param);

      DEPS_COLLECTOR?.(query);

      if (!params) params = [];
      params.push(param);

      return param;
    },
  );

  return { value, params, version: STORE_VERSION };
}

function isNodeValueChanged<T>(node: Node<T>, next: ValueRef<T>): boolean {
  return node.valueRef
    ? isCalculationChanged(
        node.comparator ?? DEFAULT_COMPARATOR,
        node.valueRef,
        next,
      )
    : true;
}

function isCalculationChanged<T>(
  comparator: Comparator<T>,
  a: ValueRef<T>,
  b: ValueRef<T>,
): boolean {
  if (comparator(a.value, b.value)) {
    return false;
  }

  return !(a.params && b.params && isArrayEqual(a.params, b.params));
}

function isArrayEqual(
  a: ReadonlyArray<unknown>,
  b: ReadonlyArray<unknown>,
): boolean {
  return a.length === b.length && a.every((value, index) => b[index] === value);
}
