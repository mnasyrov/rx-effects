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
 * Options for "compute()" function
 */
export type ComputationOptions<T> = {
  /** A custom comparator to differ complex values */
  comparator?: Comparator<T>;

  /** Explicitly dependencies for refreshing calculations */
  dependencies?: Query<unknown>[];
};

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
export const compute: {
  <T>(computation: Computation<T>, dependencies?: Query<unknown>[]): Query<T>;
  <T>(computation: Computation<T>, options?: ComputationOptions<T>): Query<T>;
} = <T>(
  computation: Computation<T>,
  dependenciesOrOptions?: Query<unknown>[] | ComputationOptions<T>,
) => {
  const options: ComputationOptions<T> | undefined = dependenciesOrOptions
    ? Array.isArray(dependenciesOrOptions)
      ? { dependencies: dependenciesOrOptions }
      : dependenciesOrOptions
    : undefined;

  const node = createComputationNode(computation, options);
  return createComputationQuery(node);
};

/// INTERNAL

type ValueRef<T> = { value: T; params?: Array<unknown>; version?: number };

/** @internal */
export type Node<T> = {
  computation: Computation<T>;
  comparator?: (a: T, b: T) => boolean;
  hot: boolean;
  version?: number;
  valueRef?: ValueRef<T>;
  dependencies?: Query<unknown>[];
  depsSubscriptions?: (() => void)[];
  observers?: Observer<T>[];
  treeObserverCount: number;
  parents?: Node<any>[];
  children?: Node<any>[];
};

const NODES = new WeakMap<Query<any>, Node<any>>();

/** @internal */
export function createComputationNode<T>(
  computation: Computation<T>,
  options?: ComputationOptions<T>,
): Node<T> {
  const dependencies = options?.dependencies;

  return {
    computation,
    comparator: options?.comparator,
    hot: false,
    dependencies: dependencies ? [...new Set(dependencies)] : undefined,
    treeObserverCount: 0,
  };
}

/** @internal */
export function createComputationQuery<T>(node: Node<T>): Query<T> {
  const query = {
    get: () => getQueryValue(node),

    value$: new Observable<T>((observer) => {
      addValueObserver(node, observer);

      return () => removeValueObserver(node, observer);
    }),
  };

  NODES.set(query, node);

  return query;
}

/** @internal */
export function getComputationNode<T>(query: Query<T>): Node<T> | undefined {
  return NODES.get(query);
}

/// COMPUTATION ENGINE

let NODE_VERSION = 0;
let STORE_VERSION = 0;

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
  STORE_VERSION = nextVersion(STORE_VERSION);
  NODE_VERSION = nextVersion(NODE_VERSION);
}

/** @internal */
export function nextStoreVersion() {
  STORE_VERSION = nextVersion(STORE_VERSION);
}

export function getQueryValue<T>(node: Node<T>): T {
  if (node.valueRef?.version === STORE_VERSION) {
    return node.valueRef.value;
  }

  return node.computation(FAST_QUERY_GETTER);
}

export function addValueObserver<T>(node: Node<T>, observer: Observer<T>) {
  if (!node.observers) {
    node.observers = [];
  }
  node.observers.push(observer);

  makeHotNode(node, observer);

  updateTreeObserverCount(node);
}

export function removeValueObserver<T>(node: Node<T>, observer: Observer<T>) {
  node.observers = removeFromArray(node.observers, observer);

  updateTreeObserverCount(node);
}

function getTreeObserverCount(node: Node<any>): number {
  const { children, observers } = node;

  let subtreeCount = 0;

  if (children) {
    for (let i = 0; i < children.length; i++) {
      const childNode = children[i];
      subtreeCount += childNode.treeObserverCount;
    }
  }

  return subtreeCount + (observers?.length ?? 0);
}

function updateTreeObserverCount(node: Node<any>) {
  node.treeObserverCount = getTreeObserverCount(node);

  const parents = node.parents;
  if (parents) {
    for (let i = 0; i < parents.length; i++) {
      const parentNode = parents[i];
      updateTreeObserverCount(parentNode);
    }
  }

  if (node.treeObserverCount === 0) {
    makeColdNode(node);
  }
}

function makeHotNode<T>(node: Node<T>, observer?: Observer<T>) {
  let dependencies = node.dependencies;
  let valueRef =
    node.valueRef?.version === STORE_VERSION ? node.valueRef : undefined;

  if (dependencies) {
    if (observer && !valueRef) {
      valueRef = node.valueRef = calculate(node.computation);
    }
  } else {
    const visitedDeps: Set<Query<unknown>> = new Set();

    const next = calculate(node.computation, (query) => visitedDeps.add(query));

    dependencies = node.dependencies = [...visitedDeps];

    if (observer && !valueRef) {
      valueRef = node.valueRef = next;
    }
  }

  if (dependencies.length > 0 && !node.hot) {
    let depObserver;

    let depsSubscriptions = node.depsSubscriptions;
    if (!depsSubscriptions) {
      depsSubscriptions = node.depsSubscriptions = [];
    }

    for (let i = 0; i < dependencies.length; i++) {
      const parentQuery = dependencies[i];

      if (!parentQuery) {
        throw new TypeError('Incorrect dependency');
      }

      const parentNode = NODES.get(parentQuery);
      if (parentNode) {
        addChildNode(parentNode, node);
      } else {
        if (!depObserver) {
          depObserver = {
            next: () => onSourceChanged(node),
            error: (error: any) => onSourceError(node, error),
            complete: () => onSourceComplete(node),
          };
        }

        const subscription = parentQuery.value$.subscribe(depObserver);

        depsSubscriptions.push(() => subscription.unsubscribe());
      }
    }
  }

  node.hot = true;

  if (observer && valueRef) {
    observer.next(valueRef.value);
  }
}

export function addChildNode(parent: Node<any>, child: Node<any>) {
  if (!parent.children) parent.children = [];
  parent.children.push(child);

  if (!child.parents) child.parents = [];
  child.parents.push(parent);

  makeHotNode(parent);
}

export function makeColdNode<T>(node: Node<T>) {
  node.hot = false;
  node.treeObserverCount = 0;

  const { depsSubscriptions, parents } = node;
  if (depsSubscriptions) {
    for (let i = 0; i < depsSubscriptions.length; i++) {
      const unsubscribe = depsSubscriptions[i];
      unsubscribe();
    }
  }

  if (parents) {
    for (let i = 0; i < parents.length; i++) {
      const parent = parents[i];
      parent.children = removeFromArray(parent.children, node);
    }
  }

  node.valueRef = undefined;
  node.depsSubscriptions = undefined;
  node.observers = undefined;
  node.parents = undefined;
  node.children = undefined;
}

function onSourceChanged<T>(node: Node<T>) {
  nextNodeVersion();
  recompute(node);
}

export function onSourceError<T>(node: Node<T>, error: any) {
  const { children, observers } = node;

  if (observers) {
    for (let i = 0; i < observers.length; i++) {
      const observer = observers[i];
      observer.error(error);
    }
  }

  if (children) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      onSourceError(child, error);
    }
  }
}

export function onSourceComplete<T>(node: Node<T>) {
  const { children, observers } = node;

  if (observers) {
    for (let i = 0; i < observers.length; i++) {
      const observer = observers[i];
      observer.complete();
    }
  }

  if (children) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      onSourceComplete(child);
    }
  }
}

export function recompute<T>(node: Node<T>) {
  if (node.version === NODE_VERSION) {
    return;
  }
  node.version = NODE_VERSION;

  if (node.observers && node.observers.length > 0) {
    calculateValue(node);
  } else {
    node.valueRef = undefined;
  }

  if (node.treeObserverCount > 0 && node.children) {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      recompute(child);
    }
  }
}

export function calculateValue<T>(node: Node<T>) {
  const comparator = node.comparator ?? DEFAULT_COMPARATOR;

  const next = calculate(node.computation);

  const isChanged = node.valueRef
    ? isCalculationChanged(comparator, node.valueRef, next)
    : true;

  if (isChanged) {
    node.valueRef = next;

    if (node.observers) {
      const observers = node.observers;
      for (let i = 0; i < observers.length; i++) {
        const observer = observers[i];
        observer.next(next.value);
      }
    }
  }

  if (!isChanged && node.valueRef) {
    node.valueRef.version = STORE_VERSION;
  }
}

function calculate<T>(
  computation: Computation<T>,
  visitor?: (query: Query<unknown>) => void,
): ValueRef<T> {
  let params: Array<unknown> | undefined;

  const value = computation(
    (query: Query<unknown>, selector?: (value: unknown) => unknown) => {
      let param = query.get();

      if (selector) param = selector(param);

      if (!params) params = [];
      params.push(param);

      visitor?.(query);

      return param;
    },
  );

  return { value, params, version: STORE_VERSION };
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
