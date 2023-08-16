/* eslint-disable no-var */
import { Observer, TeardownLogic } from 'rxjs';
import { nextSafeInteger } from '../utils';
import {
  createSignalFromFunction,
  defaultEquals,
  Signal,
  ValueEqualityFn,
} from './common';
import { ComputedImpl } from './computed';

export type Computation<T> = () => T;

export type CreateComputedOptions<T> = {
  equal?: ValueEqualityFn<T>;
};

//endregion PUBLIC API

//region INTERNAL IMPLEMENTATION

let GLOBAL_TRACKING_VERSION = 0;
let GLOBAL_VALUE_VERSION = 0;

let DEPS_COLLECTOR: undefined | ((query: Query<unknown>) => void);
let RECOMPUTE = false;

const FAST_QUERY_GETTER: ComputationResolver = (
  query: Query<unknown>,
  selector?: (value: unknown) => unknown,
) => {
  const value = query.get();
  return selector ? selector(value) : value;
};

/** @internal */
export function nextGlobalTrackingVersion() {
  GLOBAL_TRACKING_VERSION = nextSafeInteger(GLOBAL_TRACKING_VERSION);
}

/** @internal */
export function nextGlobalValueVersion() {
  GLOBAL_VALUE_VERSION = nextSafeInteger(GLOBAL_VALUE_VERSION);
}

type ValueRef<T> = { value: T; params?: Array<unknown>; version?: number };

type ComputationQuery<T> = Query<T> &
  Readonly<{
    // _node: () => ComputationNode<T>;
    _computed: true;
  }>;

function isComputationQuery<T>(query: Query<T>): query is ComputationQuery<T> {
  return (query as ComputationQuery<T>)._computed;
}

class ComputationNode<T> {
  computation: Computation<T>;
  comparator: (a: T, b: T) => boolean;

  hot = false;
  trackingVersion?: number;
  valueRef?: ValueRef<T>;
  resolvedDeps?: ReadonlySet<Query<unknown>>;
  subscriptions?: (() => void)[];
  observers?: Observer<T>[];

  constructor(
    computation: Computation<any>,
    comparator: Comparator<any> | undefined,
  ) {
    this.computation = computation;
    this.comparator = comparator ?? DEFAULT_COMPARATOR;
  }

  // createQuery(): ComputationQuery<T> {
  //   return {
  //     // _node: () => this,
  //     _computed: true,
  //     get: () => this.getQueryValue(),
  //     value$: new Observable<any>((observer) => this.onSubscribe(observer)),
  //   };
  // }

  // onSubscribe(observer: Observer<T>): TeardownLogic {
  //   // this.addValueObserver(observer);
  //
  //   // return () => this.removeValueObserver(observer);
  // }

  // Add producer
  // addValueObserver(observer: Observer<T>) {
  //   if (!this.observers) this.observers = [];
  //   this.observers.push(observer);
  //
  //   nextGlobalTrackingVersion();
  //   this.makeHotNode(observer);
  // }

  // makeHotNode(observer: Observer<T>) {
  //   if (this.hot && this.valueRef) {
  //     observer.next(this.valueRef.value);
  //     return;
  //   }
  //
  //   let valueRef = this.valueRef;
  //   if (this.resolvedDeps) {
  //     if (!valueRef) {
  //       valueRef = this.valueRef = calculate(this.computation);
  //     }
  //   } else {
  //     const visitedDeps: Set<Query<unknown>> = new Set();
  //
  //     DEPS_COLLECTOR = (query) => {
  //       if (!isComputationQuery(query)) visitedDeps.add(query);
  //     };
  //     const next = calculate(this.computation);
  //     DEPS_COLLECTOR = undefined;
  //
  //     valueRef = this.valueRef = next;
  //     this.resolvedDeps = visitedDeps;
  //   }
  //
  //   if (this.resolvedDeps.size > 0) {
  //     this.resolvedDeps.forEach((parentQuery) => {
  //       const subscription = parentQuery.value$.subscribe(() =>
  //         this.recompute(),
  //       );
  //
  //       if (!this.subscriptions) this.subscriptions = [];
  //       this.subscriptions.push(() => subscription.unsubscribe());
  //     });
  //   }
  //
  //   this.hot = true;
  //
  //   observer.next(valueRef.value);
  // }

  // Remove producer
  // removeValueObserver(observer: Observer<T>) {
  //   this.observers = removeFromArray(this.observers, observer);
  //
  //   if (!this.observers || this.observers.length === 0) {
  //     this.makeColdNode();
  //   }
  // }

  // makeColdNode() {
  //   this.hot = false;
  //
  //   const { subscriptions } = this;
  //   if (subscriptions) {
  //     for (let i = 0; i < subscriptions.length; i++) {
  //       const unsubscribe = subscriptions[i];
  //       unsubscribe();
  //     }
  //   }
  //
  //   this.trackingVersion = undefined;
  //   this.valueRef = undefined;
  //   this.subscriptions = undefined;
  //   this.observers = undefined;
  // }

  recompute() {
    if (
      !this.hot ||
      !this.observers ||
      this.trackingVersion === GLOBAL_TRACKING_VERSION
    ) {
      return;
    }
    this.trackingVersion = GLOBAL_TRACKING_VERSION;

    RECOMPUTE = true;
    let next;
    try {
      next = calculate(this.computation);
    } finally {
      RECOMPUTE = false;
    }

    const isChanged =
      !this.valueRef ||
      isCalculationChanged(this.comparator, this.valueRef, next);

    if (isChanged) {
      this.valueRef = next;
      const value = next.value;
      const observers = this.observers;

      for (let i = 0; i < observers.length; i++) {
        const observer = observers[i];
        observer.next(value);
      }
    } else if (this.valueRef) {
      this.valueRef.version = GLOBAL_VALUE_VERSION;
    }
  }

  getQueryValue(): T {
    if (DEPS_COLLECTOR || RECOMPUTE) {
      if (this.trackingVersion === GLOBAL_TRACKING_VERSION && this.valueRef) {
        return this.valueRef.value;
      }

      this.trackingVersion = GLOBAL_TRACKING_VERSION;
      this.valueRef = calculate(this.computation);
      return this.valueRef.value;
    }

    if (this.valueRef?.version === GLOBAL_VALUE_VERSION) {
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

  return { value, params, version: GLOBAL_VALUE_VERSION };
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
