/* eslint-disable @typescript-eslint/ban-ts-comment */
/// <reference types="jest-extended" />

import {
  BehaviorSubject,
  firstValueFrom,
  materialize,
  Subject,
  Subscription,
} from 'rxjs';
import { collectChanges, mockObserver } from '../test/testUtils';
import {
  addChildNode,
  addValueObserver,
  calculateValue,
  compute,
  createComputationNode,
  createComputationQuery,
  getComputationNode,
  getQueryValue,
  makeColdNode,
  nextNodeVersion,
  nextVersion,
  Node,
  onSourceComplete,
  onSourceError,
  recompute,
  removeValueObserver,
} from './compute';
import { Query } from './query';
import { queryBehaviourSubject } from './queryUtils';
import { createStore } from './store';

describe('compute()', () => {
  it('should work #1', async () => {
    const entry = createStore(0);

    const a = compute((get) => get(entry));
    const b = compute((get) => get(a) + 1);
    const c = compute((get) => get(a) + 1);
    const d = compute((get) => get(b) + get(c));
    const e = compute((get) => get(d) + 1);
    const f = compute((get) => get(d) + get(e));
    const g = compute((get) => get(d) + get(e));
    const h = compute((get) => get(f) + get(g));

    expect(h.get()).toEqual(10);

    const changes = await collectChanges(h.value$, async () => {
      entry.set(1);
      expect(h.get()).toEqual(18);

      await 0;

      entry.set(2);
      expect(h.get()).toEqual(26);

      await 0;
    });

    expect(changes).toEqual([10, 18, 26]);
  });

  it('should work #2', async () => {
    const entry = createStore(0);

    const a = compute(() => entry.get(), [entry]);
    const b = compute(() => a.get() + 1, [a]);
    const c = compute(() => a.get() + 1, [a]);
    const d = compute(() => b.get() + c.get(), [b, c]);
    const e = compute(() => d.get() + 1, [d]);
    const f = compute(() => d.get() + e.get(), [d, e]);
    const g = compute(() => d.get() + e.get(), [d, e]);
    const h = compute(() => f.get() + g.get(), [f, g]);

    expect(h.get()).toEqual(10);

    const changes = await collectChanges(h.value$, async () => {
      entry.set(1);
      expect(h.get()).toEqual(18);

      await 0;

      entry.set(2);
      expect(h.get()).toEqual(26);
    });

    expect(changes).toEqual([10, 18, 26]);
  });

  it('should have typings to return another type', () => {
    const source = createStore<number>(1);
    const query: Query<string> = compute(() => source.get() + '!', [source]);
    expect(query.get()).toBe('1!');
  });

  it('should compute "entry -> a -> observer" chain', async () => {
    const entry = createStore(0);

    const a = compute((get) => get(entry) + 1);

    expect(a.get()).toEqual(1);

    const changes = await collectChanges(a.value$, async () => {
      entry.set(1);
      expect(a.get()).toEqual(2);

      await 0;

      entry.set(2);
      expect(a.get()).toEqual(3);
    });

    expect(changes).toEqual([1, 2, 3]);
  });

  it('should compute "entry -> a -> b -> observer" chain', async () => {
    const entry = createStore(0);

    const a = compute((get) => get(entry) + 1);
    const b = compute((get) => get(a) + 1);

    expect(b.get()).toEqual(2);

    const changes = await collectChanges(b.value$, async () => {
      entry.set(1);
      expect(b.get()).toEqual(3);

      await 0;

      entry.set(2);
      expect(b.get()).toEqual(4);
    });

    expect(changes).toEqual([2, 3, 4]);
  });

  it('should compute a chain: s1 -> a; a + s2 -> b; b -> observer', async () => {
    const s1 = createStore(0);
    const s2 = createStore(0);

    const a = compute((get) => get(s1) + 1);
    const b = compute((get) => ({ a: get(a), b: get(s2) }), {
      comparator: (a, b) => a.b === b.b,
    });

    expect(b.get()).toEqual({ a: 1, b: 0 });

    const changes = await collectChanges(b.value$, () => {
      s1.set(1);
      expect(b.get()).toEqual({ a: 2, b: 0 });

      s1.set(2);
      expect(b.get()).toEqual({ a: 3, b: 0 });

      s1.set(3);
      expect(b.get()).toEqual({ a: 4, b: 0 });

      s2.set(2);
      expect(b.get()).toEqual({ a: 4, b: 2 });
    });

    expect(changes).toEqual([
      { a: 1, b: 0 },
      { a: 4, b: 2 },
    ]);
  });

  it('should compute "entry -> a -> b/c -> d -> observer" chain', async () => {
    const entry = createStore(0);

    const a = compute((get) => get(entry) + 1);
    const b = compute((get) => get(a) + 1);
    const c = compute((get) => get(a) + 1);
    const d = compute((get) => get(b) + get(c) + 1);

    expect(d.get()).toEqual(5);

    const changes = await collectChanges(d.value$, async () => {
      entry.set(1);
      expect(d.get()).toEqual(7);

      await 0;

      entry.set(2);
      expect(d.get()).toEqual(9);
    });

    expect(changes).toEqual([5, 7, 9]);
  });

  it('should throw an error on a cycle', async () => {
    const entry = createStore(0);

    const a = compute((get) => get(entry) + 1);
    // @ts-ignore
    const b = compute((get) => get(a) + get(c) + 1);
    // @ts-ignore
    // eslint-disable-next-line no-var
    var c = compute((get) => get(b) + 1);

    const result = compute((get) => get(c));

    expect(() => result.get()).toThrow(
      new RangeError('Maximum call stack size exceeded'),
    );

    const subject = new Subject();
    const changes = await collectChanges(subject.pipe(materialize()), () => {
      result.value$.subscribe(subject);
    });
    expect(changes).toEqual([
      {
        error: new RangeError('Maximum call stack size exceeded'),
        hasValue: false,
        kind: 'E',
        value: undefined,
      },
    ]);
  });

  it('should propagate "error" event from a source to observers', async () => {
    const bs = new BehaviorSubject<number>(1);
    const source = queryBehaviourSubject(bs);

    const query1 = compute(() => source.get() + 1, [source]);
    const query2 = compute(() => query1.get() * 2, [query1]);
    const node1 = getNode(query1);
    const node2 = getNode(query2);

    const subject1 = new Subject();
    const subject2 = new Subject();
    const changes = await collectChanges(subject2.pipe(materialize()), () => {
      query1.value$.subscribe(subject1);
      query2.value$.subscribe(subject2);

      bs.error('Test error 1');
      bs.error('Test error 1 second try');
    });
    expect(changes).toEqual([
      { error: undefined, hasValue: true, kind: 'N', value: 4 },
      { error: 'Test error 1', hasValue: false, kind: 'E', value: undefined },
    ]);

    const changes2 = await collectChanges(subject2.pipe(materialize()), () => {
      bs.error('Test error 3');
    });
    expect(changes2).toEqual([
      { error: 'Test error 1', hasValue: false, kind: 'E', value: undefined },
    ]);

    const subject3 = new Subject();
    const changes3 = await collectChanges(subject3.pipe(materialize()), () => {
      query2.value$.subscribe(subject3);

      bs.error('Test error 4');
    });
    expect(changes3).toEqual([
      { error: 'Test error 1', hasValue: false, kind: 'E', value: undefined },
    ]);

    expect(node1.hot).toBe(false);
    expect(node2.hot).toBe(false);

    expect(node1.treeObserverCount).toBe(0);
    expect(node2.treeObserverCount).toBe(0);
  });

  it('should propagate "complete" event from a source to observers', async () => {
    const bs = new BehaviorSubject<number>(1);
    const source = queryBehaviourSubject(bs);

    const query1 = compute(() => source.get() + 1, [source]);
    const query2 = compute(() => query1.get() * 2, [query1]);
    const node1 = getNode(query1);
    const node2 = getNode(query2);

    const subject1 = new Subject();
    const subject2 = new Subject();
    const changes = await collectChanges(subject2.pipe(materialize()), () => {
      query1.value$.subscribe(subject1);
      query2.value$.subscribe(subject2);

      bs.complete();
      bs.complete();
    });
    expect(changes).toEqual([
      { error: undefined, hasValue: true, kind: 'N', value: 4 },
      { error: undefined, hasValue: false, kind: 'C', value: undefined },
    ]);

    const changes2 = await collectChanges(subject2.pipe(materialize()), () => {
      bs.complete();
    });
    expect(changes2).toEqual([
      { error: undefined, hasValue: false, kind: 'C', value: undefined },
    ]);

    const subject3 = new Subject();
    const changes3 = await collectChanges(subject3.pipe(materialize()), () => {
      query2.value$.subscribe(subject3);

      bs.complete();
    });
    expect(changes3).toEqual([
      { error: undefined, hasValue: false, kind: 'C', value: undefined },
    ]);

    expect(node1.hot).toBe(false);
    expect(node2.hot).toBe(false);

    expect(node1.treeObserverCount).toBe(0);
    expect(node2.treeObserverCount).toBe(0);
  });

  it('should throw an error on subscription to an incorrect dependency', async () => {
    const source = createStore(1);

    const query1 = compute(
      () => 1,
      [source, undefined as unknown as Query<number>],
    );

    const subject = new Subject();
    const changes = await collectChanges(subject.pipe(materialize()), () => {
      query1.value$.subscribe(subject);
    });
    expect(changes).toEqual([
      {
        error: new TypeError('Incorrect dependency'),
        hasValue: false,
        kind: 'E',
        value: undefined,
      },
    ]);
  });

  it('should notify an observer only once on subscribe', async () => {
    const store = createStore<{ v1: string; v2: string; sum?: string }>({
      v1: 'a',
      v2: 'b',
      sum: undefined,
    });

    const v1 = compute((get) => get(store).v1);
    const v2 = compute((get) => get(store).v2);

    const sum = compute((get) => get(v1) + get(v2));

    const onSumChanged = jest.fn();
    sum.value$.subscribe(onSumChanged);
    expect(onSumChanged).toHaveBeenCalledOnceWith('ab');

    onSumChanged.mockClear();

    const storeChanges = await collectChanges(store.value$, () => {
      sum.value$.subscribe((sum) =>
        store.update((state) => ({ ...state, sum })),
      );
    });

    expect(storeChanges).toEqual([
      { sum: undefined, v1: 'a', v2: 'b' },
      { sum: 'ab', v1: 'a', v2: 'b' },
    ]);
    expect(onSumChanged).toHaveBeenCalledTimes(0);
  });

  it('should handle recursion during store updates: Value selector', async () => {
    const store = createStore({ a: 0, result: { value: 0 } });

    const $nextResult = compute((get) => ({ value: get(store, ({ a }) => a) }));

    let subscription: Subscription | undefined;

    const changes = await collectChanges(store.value$, () => {
      subscription = $nextResult.value$.subscribe((result) => {
        store.update((state) => ({ ...state, result }));
      });

      expect($nextResult.get()).toEqual({ value: 0 });

      store.update((state) => ({ ...state, a: 1 }));

      expect($nextResult.get()).toEqual({ value: 1 });
    });

    subscription?.unsubscribe();

    expect(changes).toEqual([
      { a: 0, result: { value: 0 } },
      { a: 1, result: { value: 0 } },
      { a: 1, result: { value: 1 } },
    ]);
  });

  it('should handle recursion during store updates: Intermediate computed', async () => {
    const store = createStore({ a: 0, result: { value: 0 } });

    const $a = compute((get) => get(store).a);
    const $nextResult = compute((get) => ({ value: get($a) }));

    let subscription: Subscription | undefined;

    const changes = await collectChanges(store.value$, () => {
      subscription = $nextResult.value$.subscribe((result) => {
        store.update((state) => ({ ...state, result }));
      });

      store.update((state) => ({ ...state, a: 1 }));
    });

    subscription?.unsubscribe();

    expect(changes).toEqual([
      { a: 0, result: { value: 0 } },
      { a: 1, result: { value: 0 } },
      { a: 1, result: { value: 1 } },
    ]);
  });

  it('should use a custom comparator', async () => {
    const source = createStore({ key: 1, val: 'a' });

    const query = compute((get) => get(source), {
      comparator: (a, b) => a.key === b.key,
    });

    const changes = await collectChanges(query.value$, () => {
      source.set({ key: 1, val: 'a' });
      source.set({ key: 1, val: 'b' });
      source.set({ key: 2, val: 'c' });
    });

    expect(changes).toEqual([
      { key: 1, val: 'a' },
      { key: 2, val: 'c' },
    ]);
  });

  it('should use a getter with selector', async () => {
    const source = createStore({ key: 1, val: 'a' });

    const query = compute((get) => get(source, ({ val }) => val));
    expect(query.get()).toEqual('a');
  });

  it('should use a getter without selector', async () => {
    const source = createStore({ key: 1, val: 'a' });

    const query = compute((get) => get(source));
    expect(query.get()).toEqual({ key: 1, val: 'a' });
  });
});

describe('createComputationNode()', () => {
  it('should create a default node', () => {
    const node = createComputationNode(() => 1);

    expect(node.dependencies).toBe(undefined);
    expect(node.treeObserverCount).toBe(0);
  });

  it('should create a node by options', () => {
    const s1 = createStore(1);
    const s2 = createStore(2);

    const comparator = jest.fn();
    const node = createComputationNode(() => 1, {
      comparator,
      dependencies: [s1, s2, s1],
    });

    expect(node.comparator).toBe(comparator);
    expect(node.dependencies).toEqual([s1, s2]);
    expect(node.treeObserverCount).toBe(0);
  });
});

describe('createComputationQuery()', () => {
  it('should return ComputationQuery', async () => {
    const node = createComputationNode(() => 1);
    const query = createComputationQuery(node);

    expect(getComputationNode(query)).toBe(node);
    expect(query.get()).toBe(1);
    expect(await firstValueFrom(query.value$)).toBe(1);
  });
});

describe('nextVersion()', () => {
  it('should return an increased value', () => {
    expect(nextVersion(0)).toBe(1);
    expect(nextVersion(1)).toBe(2);
    expect(nextVersion(2)).toBe(3);
  });

  it('should return zero if a current value greater or equal MAX_SAFE_INTEGER', () => {
    expect(nextVersion(Number.MAX_SAFE_INTEGER)).toBe(0);
    expect(nextVersion(Number.MAX_SAFE_INTEGER + 1)).toBe(0);
  });
});

describe('getQueryValue()', () => {
  it('should perform a direct computation', () => {
    const node = createComputationNode(() => 3);
    const result = getQueryValue(node);

    expect(result).toBe(3);
  });

  it('should not return a cached value if it is present', () => {
    const node = createComputationNode(() => 3);
    node.valueRef = { value: 10, params: [] };

    const result = getQueryValue(node);

    expect(result).toBe(3);
  });

  it('should perform a direct computation with stores', () => {
    const arg1 = createStore(1);
    const arg2 = createStore(2);

    const node = createComputationNode(() => arg1.get() + arg2.get());
    const result = getQueryValue(node);

    expect(result).toBe(3);
  });

  it('should perform a computation via the resolver', () => {
    const arg1 = createStore(1);
    const arg2 = createStore(2);

    const node = createComputationNode((get) => get(arg1) + get(arg2));
    const result = getQueryValue(node);

    expect(result).toBe(3);
  });
});

describe('addValueObserver()', () => {
  it('should add an observer and push a current value but stay as cold node if there is no dependencies', async () => {
    const calc = jest.fn(() => 1);
    const node = createComputationNode(calc);

    expect(node.observers).toBeUndefined();

    const subject = new Subject();
    const changes = await collectChanges(subject, () => {
      addValueObserver(node, subject);
    });

    expect(node.hot).toBe(true);
    expect(node.observers?.length).toBe(1);
    expect(node.treeObserverCount).toBe(1);
    expect(changes).toEqual([1]);
  });

  it('should add an observer and push a current value into it and make the node be hot', async () => {
    const source = createStore(1);

    const query1 = compute(() => 1, [source]);
    const node1 = getNode(query1);

    const query2 = compute(() => 1, [query1]);
    const node2 = getNode(query2);

    expect(node1.observers).toBeUndefined();
    expect(node1.children?.length).toBeUndefined();
    expect(node1.parents?.length).toBeUndefined();
    expect(node1.depsSubscriptions?.length).toBeUndefined();

    expect(node2.observers).toBeUndefined();
    expect(node2.children?.length).toBeUndefined();
    expect(node2.parents?.length).toBeUndefined();
    expect(node1.depsSubscriptions?.length).toBeUndefined();

    const subject = new Subject();
    const changes = await collectChanges(subject, () => {
      addValueObserver(node2, subject);
    });

    expect(node1.hot).toBe(true);
    expect(node1.treeObserverCount).toBe(1);
    expect(node1.observers?.length).toBeUndefined();
    expect(node1.children?.length).toBe(1);
    expect(node1.parents?.length).toBeUndefined();
    expect(node1.depsSubscriptions?.length).toBe(1);

    expect(node2.hot).toBe(true);
    expect(node2.treeObserverCount).toBe(1);
    expect(node2.observers?.length).toBe(1);
    expect(node2.parents?.length).toBe(1);
    expect(node2.children?.length).toBeUndefined();
    expect(node2.depsSubscriptions?.length).toBe(0);

    expect(changes).toEqual([1]);
  });
});

describe('removeValueObserver()', () => {
  it('should not fail to remove a unknown observer from an empty state', async () => {
    const calc = jest.fn(() => 1);
    const node = createComputationNode(calc);

    const subject = new Subject();

    expect(() => {
      removeValueObserver(node, subject);
    }).not.toThrow();
    expect(node.hot).toBe(false);
    expect(node.treeObserverCount).toBe(0);
  });

  it('should remove an observer and make a node be cold', async () => {
    const calc = jest.fn(() => 1);
    const node = createComputationNode(calc);

    const subject = new Subject();
    addValueObserver(node, subject);
    expect(node.hot).toBe(true);

    removeValueObserver(node, subject);
    expect(node.hot).toBe(false);
    expect(node.observers?.length).toBeUndefined();
    expect(node.treeObserverCount).toBe(0);
  });

  it('should remove an observer, make a node be cold if treeObserverCount = 0 and update parents', async () => {
    const source = createStore(1);

    const query1 = compute(() => 1, [source]);
    const node1 = getNode(query1);

    const query2 = compute(() => 1, [query1]);
    const node2 = getNode(query2);

    const subject1 = new Subject();
    const subject2 = new Subject();
    addValueObserver(node1, subject1);
    addValueObserver(node2, subject2);
    expect(node1.hot).toBe(true);
    expect(node1.treeObserverCount).toBe(2);
    expect(node2.hot).toBe(true);
    expect(node2.treeObserverCount).toBe(1);

    removeValueObserver(node2, subject2);
    expect(node1.hot).toBe(true);
    expect(node1.treeObserverCount).toBe(1);
    expect(node1.observers?.length).toBe(1);
    expect(node1.children?.length).toBe(0);
    expect(node1.parents?.length).toBeUndefined();
    expect(node1.depsSubscriptions?.length).toBe(1);

    expect(node2.hot).toBe(false);
    expect(node2.treeObserverCount).toBe(0);
    expect(node2.observers?.length).toBeUndefined();
    expect(node2.parents?.length).toBeUndefined();
    expect(node2.children?.length).toBeUndefined();
    expect(node2.depsSubscriptions?.length).toBeUndefined();
  });
});

describe('onSourceError()', () => {
  it('should propagate an error to an observer from a computation node', async () => {
    const source = createStore(1);

    const query1 = compute(() => source.get() + 1, [source]);
    const node1 = getNode(query1);

    const query2 = compute(() => query1.get() * 2, [query1]);
    const node2 = getNode(query2);

    const subject1 = new Subject();
    const subject2 = new Subject();
    const changes = await collectChanges(subject2.pipe(materialize()), () => {
      addValueObserver(node1, subject1);
      addValueObserver(node2, subject2);

      expect(node1.hot).toBe(true);
      expect(node2.hot).toBe(true);

      onSourceError(node1, 'Test error 1');
      onSourceError(node1, 'Test error 1 second try');
    });
    expect(changes).toEqual([
      { error: undefined, hasValue: true, kind: 'N', value: 4 },
      { error: 'Test error 1', hasValue: false, kind: 'E', value: undefined },
    ]);

    const changes2 = await collectChanges(subject2.pipe(materialize()), () => {
      onSourceError(node1, 'Test error 3');
    });
    expect(changes2).toEqual([
      { error: 'Test error 1', hasValue: false, kind: 'E', value: undefined },
    ]);

    const subject3 = new Subject();
    const changes3 = await collectChanges(subject3.pipe(materialize()), () => {
      addValueObserver(node2, subject3);

      expect(node1.hot).toBe(true);
      expect(node2.hot).toBe(true);

      onSourceError(node1, 'Test error 4');
    });
    expect(changes3).toEqual([
      { error: undefined, hasValue: true, kind: 'N', value: 4 },
      { error: 'Test error 4', hasValue: false, kind: 'E', value: undefined },
    ]);

    // Nodes will be made cold by unsubscribing an observable by a subscriber
    expect(node1.hot).toBe(true);
    expect(node2.hot).toBe(true);

    expect(node1.treeObserverCount).toBe(3);
    expect(node2.treeObserverCount).toBe(2);
  });
});

describe('makeColdNode()', () => {
  it('should not fail if a node has initial state', () => {
    const query = compute(() => 1);
    const node = getNode(query);

    expect(() => {
      makeColdNode(node);
    }).not.toThrow();
  });

  it('should not fail if a parent node has incorrect state', () => {
    const query = compute(() => 1);

    const parent = getNode(query);

    const node = getNode(query);
    node.parents = [];
    node.parents.push(parent);

    expect(() => {
      makeColdNode(node);
    }).not.toThrow();
  });
});

describe('onSourceComplete()', () => {
  it('should propagate "complete" to an observer from a computation node', async () => {
    const source = createStore(1);

    const query1 = compute(() => source.get() + 1, [source]);
    const node1 = getNode(query1);

    const query2 = compute(() => query1.get() * 2, [query1]);
    const node2 = getNode(query2);

    const subject1 = new Subject();
    const subject2 = new Subject();
    const changes = await collectChanges(subject2.pipe(materialize()), () => {
      addValueObserver(node1, subject1);
      addValueObserver(node2, subject2);

      expect(node1.hot).toBe(true);
      expect(node2.hot).toBe(true);

      onSourceComplete(node1);
      onSourceComplete(node1);
    });
    expect(changes).toEqual([
      { error: undefined, hasValue: true, kind: 'N', value: 4 },
      { error: undefined, hasValue: false, kind: 'C', value: undefined },
    ]);

    const changes2 = await collectChanges(subject2.pipe(materialize()), () => {
      onSourceComplete(node1);
    });
    expect(changes2).toEqual([
      { error: undefined, hasValue: false, kind: 'C', value: undefined },
    ]);

    const subject3 = new Subject();
    const changes3 = await collectChanges(subject3.pipe(materialize()), () => {
      addValueObserver(node2, subject3);

      expect(node1.hot).toBe(true);
      expect(node2.hot).toBe(true);

      onSourceComplete(node1);
    });
    expect(changes3).toEqual([
      { error: undefined, hasValue: true, kind: 'N', value: 4 },
      { error: undefined, hasValue: false, kind: 'C', value: undefined },
    ]);

    // Nodes will be made cold by unsubscribing an observable by a subscriber
    expect(node1.hot).toBe(true);
    expect(node2.hot).toBe(true);

    expect(node1.treeObserverCount).toBe(3);
    expect(node2.treeObserverCount).toBe(2);
  });
});

describe('recompute()', () => {
  it('should computes if only node.version is not equal to GLOBAL_VERSION', () => {
    const calc = jest.fn(() => 1);
    const node = createComputationNode(calc);
    addValueObserver(node, new Subject());

    calc.mockClear();
    recompute(node);
    expect(calc).toHaveBeenCalledTimes(1);

    calc.mockClear();
    recompute(node);
    expect(calc).toHaveBeenCalledTimes(0);

    calc.mockClear();
    nextNodeVersion();
    recompute(node);
    expect(calc).toHaveBeenCalledTimes(1);
  });

  it('should computes if only a node has a direct observer', () => {
    const calc = jest.fn(() => 1);
    const node = createComputationNode(calc);

    calc.mockClear();
    nextNodeVersion();
    recompute(node);
    expect(calc).toHaveBeenCalledTimes(0);

    addValueObserver(node, new Subject());
    calc.mockClear();
    nextNodeVersion();
    recompute(node);
    expect(calc).toHaveBeenCalledTimes(1);
  });

  it('should compute if only a subtree has an indirect observer', () => {
    const calc1 = jest.fn(() => 1);
    const query1 = compute(calc1);
    const node1 = getNode(query1);

    const calc2 = jest.fn((get) => get(query1) + 1);
    const query2 = compute(calc2);
    const node2 = getNode(query2);

    addChildNode(node1, node2);

    calc1.mockClear();
    calc2.mockClear();
    nextNodeVersion();
    recompute(node1);
    expect(calc1).toHaveBeenCalledTimes(0);
    expect(calc2).toHaveBeenCalledTimes(0);

    addValueObserver(node2, new Subject());
    calc1.mockClear();
    calc2.mockClear();
    nextNodeVersion();
    recompute(node1);
    expect(calc1).toHaveBeenCalledTimes(1);
    expect(calc2).toHaveBeenCalledTimes(1);

    expect(node1.valueRef).toBeUndefined();
    expect(node2.valueRef).not.toBeUndefined();
  });

  it('should not trigger recomputing for cold nodes', () => {
    const calc1 = jest.fn(() => 1);
    const node1 = createComputationNode(calc1);

    const calc2 = jest.fn(() => 2);
    const node2 = createComputationNode(calc2);
    addValueObserver(node2, new Subject());

    addChildNode(node1, node2);

    calc1.mockClear();
    calc2.mockClear();
    nextNodeVersion();
    recompute(node1);
    expect(calc1).toHaveBeenCalledTimes(0);
    expect(calc2).toHaveBeenCalledTimes(0);
  });
});

describe('calculateValue()', () => {
  it('should notify subscribers with a new value', () => {
    const observer = mockObserver<number>();
    let value = 1;

    calculateValue({
      computation: () => ++value,
      hot: false,
      treeObserverCount: 1,
      observers: [observer],
    });

    expect(value).toBe(2);
    expect(observer.next).toHaveBeenCalledOnceWith(2);
  });

  it('should cache value in the node in case valueRef is undefined', () => {
    const observer = mockObserver<number>();
    const source = 1;

    const comparator = () => true;
    const node = {
      ...createComputationNode(() => source, { comparator }),
      treeObserverCount: 1,
      observers: [observer],
    };

    calculateValue(node);
    expect(observer.next).toHaveBeenCalledOnceWith(1);
    expect(node.valueRef).toEqual(expect.objectContaining({ value: 1 }));
  });

  it('should not cache value in the node in case valueRef is undefined', () => {
    const observer = mockObserver<number>();
    const source = 2;

    const comparator = () => true;
    const node = {
      ...createComputationNode(() => source, { comparator }),
      treeObserverCount: 1,
      observers: [observer],
    };
    node.valueRef = { value: 1, params: [] };

    calculateValue(node);
    expect(observer.next).toHaveBeenCalledTimes(0);
  });
});

function getNode<T>(query: Query<T>): Node<T> {
  const node = getComputationNode(query);

  if (node) return node;

  throw new Error('Not ComputationQuery');
}
