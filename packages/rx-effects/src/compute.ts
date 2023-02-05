import { Observable, Observer } from 'rxjs';
import { Query } from './query';
import { DEFAULT_COMPARATOR } from './utils';

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

type ComputationQuery<T> = Query<T> & Readonly<{ _node: Node<T> }>;

export function isComputationQuery<T>(
  value: Query<T>,
): value is ComputationQuery<T> {
  return '_node' in value;
}

const FAST_QUERY_GETTER: ComputationResolver = (
  query: Query<unknown>,
  selector?: (value: unknown) => unknown,
) => {
  const value = query.get();
  return selector ? selector(value) : value;
};

type ValueRef<T> = { value: T; params?: Array<unknown> };

/** @internal */
export type Node<T> = {
  computation: Computation<T>;
  comparator?: (a: T, b: T) => boolean;
  hot: boolean;
  version?: number;
  valueRef?: ValueRef<T>;
  dependencies?: Set<Query<unknown>>;
  depsSubscriptions?: (() => void)[];
  observers?: Set<Observer<T>>;
  treeObserverCount: number;
  parents?: Set<Node<any>>;
  children?: Set<Node<any>>;
};

export function createComputationNode<T>(
  computation: Computation<T>,
  options?: ComputationOptions<T>,
): Node<T> {
  const dependencies = options?.dependencies;

  return {
    computation,
    comparator: options?.comparator,
    hot: false,
    dependencies: dependencies ? new Set(dependencies) : undefined,
    treeObserverCount: 0,
  };
}

export function createComputationQuery<T>(node: Node<T>): ComputationQuery<T> {
  return {
    _node: node,

    get: () => getQueryValue(node),

    value$: new Observable<T>((observer) => {
      addValueObserver(node, observer);

      return () => removeValueObserver(node, observer);
    }),
  };
}

/// COMPUTATION ENGINE

let GLOBAL_VERSION = 0;

/** @internal */
export function setGlobalVersion(value: number) {
  GLOBAL_VERSION = value;
}

/** @internal */
export function nextVersion(): number {
  return (GLOBAL_VERSION =
    GLOBAL_VERSION === Number.MAX_SAFE_INTEGER ? 0 : GLOBAL_VERSION + 1);
}

export function getQueryValue<T>(node: Node<T>): T {
  return node.computation(FAST_QUERY_GETTER);
}

export function addValueObserver<T>(node: Node<T>, observer: Observer<T>) {
  if (!node.observers) {
    node.observers = new Set();
  }
  node.observers.add(observer);

  makeHotNode(node, observer);

  updateTreeObserverCount(node);
}

export function removeValueObserver<T>(node: Node<T>, observer: Observer<T>) {
  node.observers?.delete(observer);

  updateTreeObserverCount(node);
}

function getTreeObserverCount(node: Node<any>): number {
  let subtreeCount = 0;

  if (node.children) {
    node.children.forEach((childNode) => {
      subtreeCount += childNode.treeObserverCount;
    });
  }

  return subtreeCount + (node.observers?.size ?? 0);
}

function updateTreeObserverCount(node: Node<any>) {
  node.treeObserverCount = getTreeObserverCount(node);

  node.parents?.forEach(updateTreeObserverCount);

  if (node.treeObserverCount === 0) {
    makeColdNode(node);
  }
}

function makeHotNode<T>(node: Node<T>, observer?: Observer<T>) {
  let dependencies = node.dependencies;
  let valueRef = node.valueRef;

  if (dependencies) {
    if (observer && !valueRef) {
      valueRef = node.valueRef = calculate(node.computation);
    }
  } else {
    const visitedDeps: Set<Query<unknown>> = new Set();

    const next = calculate(node.computation, (query) => visitedDeps.add(query));

    dependencies = visitedDeps;
    node.dependencies = dependencies;

    if (observer && !valueRef) {
      valueRef = node.valueRef = next;
    }
  }

  if (dependencies.size > 0 && !node.hot) {
    let depObserver;

    const depsSubscriptions = (node.depsSubscriptions =
      node.depsSubscriptions ?? []);

    for (const parent of dependencies.values()) {
      if (!parent) {
        throw new TypeError('Incorrect dependency');
      }

      if (isComputationQuery(parent)) {
        addChildNode(parent._node, node);
      } else {
        if (!depObserver) {
          depObserver = {
            next: () => onSourceChanged(node),
            error: (error: any) => onSourceError(node, error),
            complete: () => onSourceComplete(node),
          };
        }

        const subscription = parent.value$.subscribe(depObserver);

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
  if (!parent.children) parent.children = new Set();
  parent.children.add(child);

  if (!child.parents) child.parents = new Set();
  child.parents.add(parent);

  makeHotNode(parent);
}

export function makeColdNode<T>(node: Node<T>) {
  node.hot = false;

  node.treeObserverCount = 0;
  if (node.depsSubscriptions) {
    for (const unsubscribe of node.depsSubscriptions) {
      unsubscribe();
    }
    node.depsSubscriptions.length = 0;
  }

  node.parents?.forEach((parent) => parent.children?.delete(node));

  node.valueRef = undefined;
  node.observers?.clear();
  node.parents?.clear();
  node.children?.clear();
}

function onSourceChanged<T>(node: Node<T>) {
  nextVersion();
  recompute(node);
}

export function onSourceError<T>(node: Node<T>, error: any) {
  if (node.observers) {
    for (const observer of node.observers) {
      observer.error(error);
    }
  }

  if (node.children) {
    for (const child of node.children) {
      onSourceError(child, error);
    }
  }
}

export function onSourceComplete<T>(node: Node<T>) {
  if (node.observers) {
    for (const observer of node.observers) {
      observer.complete();
    }
  }

  if (node.children) {
    for (const child of node.children) {
      onSourceComplete(child);
    }
  }
}

export function recompute<T>(node: Node<T>) {
  if (node.version === GLOBAL_VERSION) {
    return;
  }
  node.version = GLOBAL_VERSION;

  if (node.observers && node.observers.size > 0) {
    calculateValue(node);
  }

  if (node.treeObserverCount > 0 && node.children) {
    for (const child of node.children) {
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
      for (const observer of node.observers) {
        observer.next(next.value);
      }
    }
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

  return { value, params };
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
