/* eslint-disable no-var */
import { Observable, Observer, TeardownLogic } from 'rxjs';
import { Query } from './query';
import {
  Comparator,
  DEFAULT_COMPARATOR,
  isSetEqual,
  nextSafeInteger,
  removeFromArray,
} from './utils';

//region PUBLIC API

/**
 * This function returns a current value of a provided Query and registers it as a dependency for computation.
 */
export type ComputationResolver = {
  <T>(query: Query<T>): T;
  <T, R>(query: Query<T>, selector?: (value: T) => R): R;
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
  const node = new ComputationNode<T>(computation, comparator);
  return node.createQuery();
}

//endregion PUBLIC API

//region INTERNAL IMPLEMENTATION

let NODE_VERSION = 0;
let STORE_VERSION = 0;

let DEPS_COLLECTOR: undefined | ((query: Query<unknown>) => void);

const FAST_QUERY_GETTER: ComputationResolver = (
  query: Query<unknown>,
  selector?: (value: unknown) => unknown,
) => {
  const value = query.get();
  return selector ? selector(value) : value;
};

/** @internal */
export function nextNodeVersion() {
  NODE_VERSION = nextSafeInteger(NODE_VERSION);
}

/** @internal */
export function nextStoreVersion() {
  STORE_VERSION = nextSafeInteger(STORE_VERSION);
}

type ValueRef<T> = { value: T; version?: number };

type ComputationQuery<T> = Query<T> &
  Readonly<{
    // _node: () => ComputationNode<T>;
    _computed: true;
  }>;

function isComputationQuery<T>(query: Query<T>): query is ComputationQuery<T> {
  // return !!(query as ComputationQuery<T>)._node;
  return (query as ComputationQuery<T>)._computed;
}

// function getComputationNode<T>(
//   query: Query<T>,
// ): ComputationNode<T> | undefined {
//   return (query as ComputationQuery<T>)._node?.();
// }

class ComputationNode<T> {
  computation: Computation<T>;
  comparator: (a: T, b: T) => boolean;
  hot = false;
  version?: number;
  valueRef?: ValueRef<T>;
  resolvedDeps?: ReadonlySet<Query<unknown>>;
  subscriptions?: (() => void)[];
  observers?: Observer<T>[];
  depObserver?: Observer<T>;

  constructor(
    computation: Computation<any>,
    comparator: Comparator<any> | undefined,
  ) {
    this.computation = computation;
    this.comparator = comparator ?? DEFAULT_COMPARATOR;
  }

  createQuery(): ComputationQuery<T> {
    return {
      // _node: () => this,
      _computed: true,
      get: () => this.getQueryValue(),
      value$: new Observable<any>((observer) => this.onSubscribe(observer)),
    };
  }

  onSubscribe(observer: Observer<T>): TeardownLogic {
    this.addValueObserver(observer);

    return () => this.removeValueObserver(observer);
  }

  getQueryValue(): T {
    if (DEPS_COLLECTOR) {
      if (this.version === NODE_VERSION && this.valueRef) {
        return this.valueRef.value;
      }

      this.version = NODE_VERSION;
      this.valueRef = calculate(this.computation);
      return this.valueRef.value;
    }

    if (this.valueRef?.version === STORE_VERSION) {
      return this.valueRef.value;
    }

    const nextValue = this.computation(FAST_QUERY_GETTER);

    if (this.valueRef) {
      if (this.comparator(this.valueRef.value, nextValue)) {
        return this.valueRef.value;
      }
    }

    return nextValue;
  }

  addValueObserver(observer: Observer<T>) {
    if (!this.observers) this.observers = [];
    this.observers.push(observer);

    nextNodeVersion();
    this.makeHotNode(observer);
  }

  removeValueObserver(observer: Observer<T>) {
    this.observers = removeFromArray(this.observers, observer);

    if (!this.observers || this.observers.length === 0) {
      this.makeColdNode();
    }
  }

  makeHotNode(observer: Observer<T>) {
    if (this.hot && this.valueRef) {
      observer.next(this.valueRef.value);
      return;
    }

    let valueRef = this.valueRef;
    if (this.resolvedDeps) {
      if (!valueRef) {
        valueRef = calculate(this.computation);
      }
    } else {
      const visitedDeps: Set<Query<unknown>> = new Set();

      DEPS_COLLECTOR = (query) => {
        if (!isComputationQuery(query)) visitedDeps.add(query);
      };
      const next = calculate(this.computation);
      DEPS_COLLECTOR = undefined;

      valueRef = next;
      this.resolvedDeps = visitedDeps;
    }

    if (this.resolvedDeps.size > 0) {
      this.valueRef = valueRef;
    }

    if (this.resolvedDeps.size > 0) {
      this.resolvedDeps.forEach((parentQuery) => {
        if (!this.depObserver) {
          this.depObserver = {
            next: () => this.onSourceChanged(),
            error: (error: any) => this.onSourceError(error),
            complete: () => this.onSourceComplete(),
          };
        }
        const subscription = parentQuery.value$.subscribe(
          this.depObserver as any,
        );

        if (!this.subscriptions) this.subscriptions = [];
        this.subscriptions.push(() => subscription.unsubscribe());
      });
    }

    this.hot = true;

    observer.next(valueRef.value);
  }

  makeColdNode() {
    this.hot = false;

    const { subscriptions } = this;
    if (subscriptions) {
      for (let i = 0; i < subscriptions.length; i++) {
        const unsubscribe = subscriptions[i];
        unsubscribe();
      }
    }

    this.version = undefined;
    this.valueRef = undefined;
    this.subscriptions = undefined;
    this.observers = undefined;
  }

  onSourceChanged() {
    nextNodeVersion();
    this.recompute();
  }

  onSourceError(error: any) {
    const { observers } = this;

    if (observers) {
      for (let i = 0; i < observers.length; i++) {
        const observer = observers[i];
        observer.error(error);
      }
    }

    this.observers = undefined;
    this.makeColdNode();
  }

  onSourceComplete() {
    const { observers } = this;

    if (observers) {
      for (let i = 0; i < observers.length; i++) {
        const observer = observers[i];
        observer.complete();
      }
    }

    this.observers = undefined;
    this.makeColdNode();
  }

  recompute() {
    if (!this.hot || !this.observers || this.version === NODE_VERSION) return;
    this.version = NODE_VERSION;

    const visitedDeps: Set<Query<unknown>> = new Set();
    DEPS_COLLECTOR = (query) => {
      if (!isComputationQuery(query)) visitedDeps.add(query);
    };

    let next;
    try {
      next = calculate(this.computation);
    } finally {
      DEPS_COLLECTOR = undefined;
    }

    const isChanged =
      !this.valueRef || !this.comparator(this.valueRef.value, next.value);

    if (isChanged) {
      this.valueRef = next;
      const value = next.value;
      const observers = this.observers;

      for (let i = 0; i < observers.length; i++) {
        const observer = observers[i];
        observer.next(value);
      }
    } else if (this.valueRef) {
      this.valueRef.version = STORE_VERSION;
    }

    if (this.resolvedDeps && !isSetEqual(this.resolvedDeps, visitedDeps)) {
      const { subscriptions } = this;
      if (subscriptions) {
        for (let i = 0; i < subscriptions.length; i++) {
          const unsubscribe = subscriptions[i];
          unsubscribe();
        }
      }

      this.resolvedDeps = visitedDeps;
      this.subscriptions = [];

      this.resolvedDeps.forEach((parentQuery) => {
        if (!this.depObserver) {
          this.depObserver = {
            next: () => this.onSourceChanged(),
            error: (error: any) => this.onSourceError(error),
            complete: () => this.onSourceComplete(),
          };
        }
        const subscription = parentQuery.value$.subscribe(
          this.depObserver as any,
        );

        this.subscriptions?.push(() => subscription.unsubscribe());
      });
    }
  }
}

function calculate<T>(computation: Computation<T>): ValueRef<T> {
  const value = computation(
    (query: Query<unknown>, selector?: (value: unknown) => unknown) => {
      let value = query.get();

      if (selector) value = selector(value);

      DEPS_COLLECTOR?.(query);

      return value;
    },
  );

  return { value, version: STORE_VERSION };
}

//endregion INTERNAL IMPLEMENTATION
