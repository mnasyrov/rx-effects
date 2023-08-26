import { BehaviorSubject, materialize, Subject, Subscription } from 'rxjs';
import { collectChanges, waitForMicrotask } from '../../test/testUtils';
import { Signal } from './common';
import { computed, track } from './computed';
import { ASYNC_EFFECT_MANAGER, effect } from './effect';
import { toObservable, toSignal } from './rxjs-interop';
import { signal } from './signal';

describe('computed()', () => {
  it('should calculate the benchmark', () => {
    const entry = signal(0); // 0

    const a = computed(() => entry()); // [0] -> 0
    const b = computed(() => a() + 1); // [0] -> 1
    const c = computed(() => a() + 1); // [0] -> 1
    const d = computed(() => b() + c()); // [1, 1] -> 2
    const e = computed(() => d() + 1); // [2] -> 3
    const f = computed(() => d() + e()); // [2, 3] -> 5
    const g = computed(() => d() + e()); // [2, 3] -> 5
    const h = computed(() => f() + g()); // [5, 5] -> 10

    const results: number[] = [];

    effect(() => results.push(h()));
    ASYNC_EFFECT_MANAGER.flush();

    entry.set(1);
    ASYNC_EFFECT_MANAGER.flush();

    entry.set(2);
    ASYNC_EFFECT_MANAGER.flush();

    expect(results).toEqual([10, 18, 26]);
  });

  it('should process dynamic dependencies', async () => {
    let i = 0;
    const isA = signal(true);
    const a = signal('a1');
    const b = signal('b1');

    const output = computed(() => (isA() ? a() : b()) + `, i${i}`);

    const results: any[] = [];
    effect(() => results.push(output()));

    ASYNC_EFFECT_MANAGER.flush();

    i = 1;
    b.set('b1a');
    ASYNC_EFFECT_MANAGER.flush();

    i = 2;
    a.set('a2');
    b.set('b2');
    ASYNC_EFFECT_MANAGER.flush();

    i = 3;
    isA.set(false);
    ASYNC_EFFECT_MANAGER.flush();

    i = 4;
    b.set('b3');
    ASYNC_EFFECT_MANAGER.flush();

    i = 5;
    a.set('a4');
    ASYNC_EFFECT_MANAGER.flush();

    expect(results).toEqual(['a1, i0', 'a2, i2', 'b2, i3', 'b3, i4']);
  });

  it('should have typings to return another type', () => {
    const source = signal<number>(1);
    const query: Signal<string> = computed(() => source() + '!');
    expect(query()).toBe('1!');
  });

  it('should compute "entry -> a" chain', async () => {
    const source = signal(1);

    const a = computed(() => source() * 10);
    expect(a()).toEqual(10);

    source.set(2);
    expect(a()).toEqual(20);

    source.set(3);
    expect(a()).toEqual(30);
  });

  it('should compute "entry -> a -> observer" chain', async () => {
    const source = signal(1);

    const a = computed(() => source() * 10);

    const changes = await collectChanges(toObservable(a), async () => {
      source.set(2);

      await waitForMicrotask();

      source.set(3);
    });

    expect(changes).toEqual([10, 20, 30]);
  });

  it('should compute "entry -> a -> b -> observer" chain', async () => {
    const entry = signal(0);

    const a = computed(() => entry() + 1);
    const b = computed(() => a() + 1);

    expect(b()).toEqual(2);

    const changes = await collectChanges(toObservable(b), async () => {
      entry.set(1);
      expect(b()).toEqual(3);

      await 0;

      entry.set(2);
      expect(b()).toEqual(4);
    });

    expect(changes).toEqual([2, 3, 4]);
  });

  it('should compute a chain: s1 -> a; a + s2 -> b; b -> observer', async () => {
    const s1 = signal(0);
    const s2 = signal(0);

    const a = computed(() => s1() + 1);
    const b = computed(() => ({ a: a(), b: s2() }), {
      equal: (prev, next) => prev.b === next.b,
    });

    expect(b()).toEqual({ a: 1, b: 0 });

    const changes = await collectChanges(toObservable(b), () => {
      s1.set(1);
      // expect(b()).toEqual({ a: 2, b: 0 });
      expect(b()).toEqual({ a: 1, b: 0 });

      s1.set(2);
      // expect(b()).toEqual({ a: 3, b: 0 });
      expect(b()).toEqual({ a: 1, b: 0 });

      s1.set(3);
      // expect(b()).toEqual({ a: 4, b: 0 });
      expect(b()).toEqual({ a: 1, b: 0 });

      s2.set(2);
      expect(b()).toEqual({ a: 4, b: 2 });
    });

    expect(changes).toEqual([
      { a: 1, b: 0 },
      { a: 4, b: 2 },
    ]);
  });

  it('should compute "entry -> a -> b/c -> d -> observer" chain', async () => {
    const entry = signal(0);

    const a = computed(() => entry() + 1);
    const b = computed(() => a() + 1);
    const c = computed(() => a() + 1);
    const d = computed(() => b() + c() + 1);

    expect(d()).toEqual(5);

    const changes = await collectChanges(toObservable(d), async () => {
      entry.set(1);
      expect(d()).toEqual(7);

      await 0;

      entry.set(2);
      expect(d()).toEqual(9);
    });

    expect(changes).toEqual([5, 7, 9]);
  });

  it('should throw an error on a cycle', async () => {
    const entry = signal(0);

    const a = computed(() => entry() + 1);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const b = computed(() => a() + c() + 1);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line no-var
    var c = computed(() => b() + 1);

    const result = computed(() => c());

    expect(() => result()).toThrow(
      new Error('Detected cycle in computations.'),
    );

    const subject = new Subject();
    const changes = await collectChanges(subject.pipe(materialize()), () => {
      toObservable(result).subscribe(subject);
    });
    expect(changes).toEqual([
      {
        error: new Error('Detected cycle in computations.'),
        hasValue: false,
        kind: 'E',
        value: undefined,
      },
    ]);
  });

  it('should propagate "error" event from a source to observers', async () => {
    const bs = new BehaviorSubject<number>(1);
    const source = toSignal(bs);

    const query1 = computed(() => source() + 1);
    const query2 = computed(() => query1() * 2);

    const subject1 = new Subject();
    const subject2 = new Subject();
    const changes = await collectChanges(
      subject2.pipe(materialize()),
      async () => {
        toObservable(query1).subscribe(subject1);
        toObservable(query2).subscribe(subject2);

        await waitForMicrotask();

        bs.error('Test error 1');
        bs.error('Test error 1 second try');
      },
    );
    expect(changes).toEqual([
      // OK, что пропускаем начальное значение, так как эффекты отложены до след. микротаски
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
      toObservable(query2).subscribe(subject3);

      bs.error('Test error 4');
    });
    expect(changes3).toEqual([
      { error: 'Test error 1', hasValue: false, kind: 'E', value: undefined },
    ]);
  });

  // TODO: Refine the test. Is it neeeded?
  it('should propagate "complete" event from a source to observers', async () => {
    const bs = new BehaviorSubject<number>(1);
    const source = toSignal(bs);

    const query1 = computed(() => source() + 1);
    const query2 = computed(() => query1() * 2);

    const subject1 = new Subject();
    const subject2 = new Subject();
    const changes = await collectChanges(
      subject2.pipe(materialize()),
      async () => {
        toObservable(query1).subscribe(subject1);
        toObservable(query2).subscribe(subject2);

        await waitForMicrotask();

        bs.complete();
        bs.complete();
      },
    );
    expect(changes).toEqual([
      { error: undefined, hasValue: true, kind: 'N', value: 4 },

      // Completion of the Observable is meaningless to the signal. Signals don't have a concept of
      // "complete".
      // { error: undefined, hasValue: false, kind: 'C', value: undefined },
    ]);

    const changes2 = await collectChanges(
      subject2.pipe(materialize()),
      async () => {
        bs.complete();
        await waitForMicrotask();
      },
    );
    expect(changes2).toEqual([
      // Completion of the Observable is meaningless to the signal. Signals don't have a concept of
      // "complete".
      // { error: undefined, hasValue: false, kind: 'C', value: undefined },
    ]);

    const subject3 = new Subject();
    const changes3 = await collectChanges(
      subject3.pipe(materialize()),
      async () => {
        toObservable(query2).subscribe(subject3);

        bs.complete();

        await waitForMicrotask();
      },
    );
    expect(changes3).toEqual([
      // Completion of the Observable is meaningless to the signal. Signals don't have a concept of
      // "complete".
      // { error: undefined, hasValue: false, kind: 'C', value: undefined },
      { error: undefined, hasValue: true, kind: 'N', value: 4 },
    ]);
  });

  it('should throw an error on subscription to an incorrect dependency', async () => {
    const query1 = computed(() => {
      throw new Error('Some error');
    });

    const subject = new Subject();
    const changes = await collectChanges(subject.pipe(materialize()), () => {
      toObservable(query1).subscribe(subject);
    });
    expect(changes).toEqual([
      {
        error: expect.any(Error),
        hasValue: false,
        kind: 'E',
        value: undefined,
      },
    ]);
  });

  it('should notify an observer only once on subscribe', async () => {
    const store = signal<{ v1: string; v2: string; sum?: string }>({
      v1: 'a',
      v2: 'b',
      sum: undefined,
    });

    const v1 = computed(() => store().v1);
    const v2 = computed(() => store().v2);

    const sum = computed(() => v1() + v2());

    const onSumChanged = jest.fn();
    toObservable(sum).subscribe(onSumChanged);

    await waitForMicrotask();

    expect(onSumChanged).toHaveBeenCalledWith('ab');
    expect(onSumChanged).toHaveBeenCalledTimes(1);

    onSumChanged.mockClear();

    const storeChanges = await collectChanges(toObservable(store), () => {
      toObservable(sum).subscribe((sum) =>
        store.update((state) => ({ ...state, sum })),
      );
    });

    expect(storeChanges).toEqual([
      { sum: undefined, v1: 'a', v2: 'b' },
      { sum: 'ab', v1: 'a', v2: 'b' },
    ]);
    expect(onSumChanged).toHaveBeenCalledTimes(0);
  });

  // TODO: Входит в рекурсию
  it('should handle recursion during store updates: Value selector', async () => {
    const store = signal({ a: 0, result: { value: 0 } });

    const nextResult = computed(() => ({ value: track(() => store().a) }));

    const subscription = toObservable(nextResult, {
      onlyChanges: true,
    }).subscribe((result) => {
      store.update((state) => ({ ...state, result }));
    });

    const changes = await collectChanges(toObservable(store), async () => {
      expect(nextResult()).toEqual({ value: 0 });

      store.update((state) => ({ ...state, a: 1 }));

      expect(nextResult()).toEqual({ value: 1 });

      await waitForMicrotask();
    });

    subscription?.unsubscribe();

    expect(changes).toEqual([
      { a: 0, result: { value: 0 } },
      { a: 1, result: { value: 1 } },
    ]);
  });

  it('should handle recursion during store updates: Intermediate computed', async () => {
    const store = signal({ a: 0, result: { value: 0 } });

    const a = computed(() => store().a);
    const nextResult = computed(() => ({ value: a() }));

    const subscription = toObservable(nextResult, {
      onlyChanges: true,
    }).subscribe((result) => {
      store.update((state) => ({ ...state, result }));
    });

    const changes = await collectChanges(toObservable(store), async () => {
      await waitForMicrotask();

      store.update((state) => ({ ...state, a: 1 }));

      await waitForMicrotask();
    });

    subscription?.unsubscribe();

    expect(changes).toEqual([
      { a: 0, result: { value: 0 } },
      { a: 1, result: { value: 1 } },
    ]);
  });

  it('should use a custom comparator', async () => {
    const source = signal({ key: 1, val: 'a' });

    const query = computed(() => source(), {
      equal: (a, b) => a.key === b.key,
    });

    const changes = await collectChanges(toObservable(query), () => {
      source.set({ key: 1, val: 'a' });
      source.set({ key: 1, val: 'b' });
      source.set({ key: 2, val: 'c' });
    });

    expect(changes).toEqual([
      { key: 1, val: 'a' },
      { key: 2, val: 'c' },
    ]);
  });

  it('should use a getter without selector', async () => {
    const source = signal({ key: 1, val: 'a' });

    const query = computed(() => source());
    expect(query()).toEqual({ key: 1, val: 'a' });
  });

  // TODO: Not applicable
  // it('should return internal ComputationQuery', async () => {
  //   const query = computed(() => 1);
  //
  //   expect((query as any)._computed).toEqual(true);
  //   expect(query.get()).toBe(1);
  //   expect(await firstValueFrom(query.value$)).toBe(1);
  // });
});
