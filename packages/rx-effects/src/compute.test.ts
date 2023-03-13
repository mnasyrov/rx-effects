/* eslint-disable @typescript-eslint/ban-ts-comment */
/// <reference types="jest-extended" />

import {
  BehaviorSubject,
  firstValueFrom,
  materialize,
  Subject,
  Subscription,
} from 'rxjs';
import { collectChanges } from '../test/testUtils';
import {
  addValueObserver,
  compute,
  createComputationNode,
  createComputationQuery,
  getQueryValue,
  nextNodeVersion,
  nextVersion,
  recompute,
  removeValueObserver,
} from './compute';
import { Query } from './query';
import { queryBehaviourSubject } from './queryUtils';
import { createStore } from './store';

describe('compute()', () => {
  it('should calculate the benchmark', async () => {
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

  it('should have typings to return another type', () => {
    const source = createStore<number>(1);
    const query: Query<string> = compute((get) => get(source) + '!');
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
    const b = compute(
      (get) => ({ a: get(a), b: get(s2) }),
      (a, b) => a.b === b.b,
    );

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

    const query1 = compute((get) => get(source) + 1);
    const query2 = compute((get) => get(query1) * 2);

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
  });

  it('should propagate "complete" event from a source to observers', async () => {
    const bs = new BehaviorSubject<number>(1);
    const source = queryBehaviourSubject(bs);

    const query1 = compute((get) => get(source) + 1);
    const query2 = compute((get) => get(query1) * 2);

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
  });

  it('should throw an error on subscription to an incorrect dependency', async () => {
    const query1 = compute((get) => get(undefined as any));

    const subject = new Subject();
    const changes = await collectChanges(subject.pipe(materialize()), () => {
      query1.value$.subscribe(subject);
    });
    expect(changes).toEqual([
      {
        error: new TypeError(
          "Cannot read properties of undefined (reading 'get')",
        ),
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

    const query = compute(
      (get) => get(source),
      (a, b) => a.key === b.key,
    );

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

describe('createComputationQuery()', () => {
  it('should return ComputationQuery', async () => {
    const node = createComputationNode(() => 1);
    const query = createComputationQuery(node);

    expect((query as any)._computed).toBe(true);
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
    expect(changes).toEqual([1]);
  });

  it('should add an observer and push a current value into it and make the node be hot', async () => {
    const source = createStore(1);

    const query1 = compute((get) => get(source) + 1);

    const query2 = compute((get) => get(query1) + 1);

    const subject = new Subject();
    const changes = await collectChanges(subject, () => {
      query2.value$.subscribe(subject);
    });

    expect(changes).toEqual([3]);
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
  });

  it('should remove an observer, make a node be cold if treeObserverCount = 0 and update parents', async () => {
    const source = createStore(1);

    const query1 = compute((get) => get(source) + 1);

    const query2 = compute((get) => get(query1) + 1);

    const subject1 = new Subject();
    const subject2 = new Subject();
    query1.value$.subscribe(subject1);
    query2.value$.subscribe(subject2);
  });
});

describe('onSourceError()', () => {
  it('should propagate an error to an observer from a computation node', async () => {
    const bs = new BehaviorSubject(1);
    const source = queryBehaviourSubject(bs);

    const query1 = compute((get) => get(source) + 1);

    const query2 = compute((get) => get(query1) * 2);

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
  });
});

describe('onSourceComplete()', () => {
  it('should propagate "complete" to an observer from a computation node', async () => {
    const bs = new BehaviorSubject(1);
    const source = queryBehaviourSubject(bs);

    const query1 = compute((get) => get(source) + 1);

    const query2 = compute((get) => get(query1) * 2);

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
    const bs = new BehaviorSubject(1);
    const source = queryBehaviourSubject(bs);

    const calc1 = jest.fn((get) => get(source) + 1);
    const query1 = compute(calc1);

    const calc2 = jest.fn((get) => get(query1) + 1);
    const query2 = compute(calc2);

    calc1.mockClear();
    calc2.mockClear();
    nextNodeVersion();
    bs.next(1);
    expect(calc1).toHaveBeenCalledTimes(0);
    expect(calc2).toHaveBeenCalledTimes(0);

    query1.value$.subscribe();
    query2.value$.subscribe();
    calc1.mockClear();
    calc2.mockClear();
    nextNodeVersion();
    bs.next(2);
    expect(calc1).toHaveBeenCalledTimes(2);
    expect(calc2).toHaveBeenCalledTimes(1);
  });

  it('should not trigger recomputing for cold nodes', () => {
    const calc1 = jest.fn(() => 1);
    const node1 = createComputationNode(calc1);

    const calc2 = jest.fn(() => 2);
    const node2 = createComputationNode(calc2);
    addValueObserver(node2, new Subject());

    calc1.mockClear();
    calc2.mockClear();
    nextNodeVersion();
    recompute(node1);
    expect(calc1).toHaveBeenCalledTimes(0);
    expect(calc2).toHaveBeenCalledTimes(0);
  });
});
