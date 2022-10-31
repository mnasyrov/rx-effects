import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { mapQuery, mergeQueries, Query } from './index';
import { createStore } from '../store';

describe('mapQuery()', () => {
  it('should return a new state query with applied mapper which transforms the selected value', async () => {
    const sourceValue$ = new BehaviorSubject<number>(0);
    const sourceQuery: Query<number> = {
      get: () => sourceValue$.getValue(),
      value$: sourceValue$,
    };

    const query = mapQuery(sourceQuery, (value) => value + 10);

    expect(query.get()).toBe(10);
    expect(await firstValueFrom(query.value$)).toBe(10);

    sourceValue$.next(1);
    expect(query.get()).toBe(11);
    expect(await firstValueFrom(query.value$)).toBe(11);
  });

  it('should not produce values for each source emission if distinct is false', () => {
    const sourceValue$ = new BehaviorSubject<number>(0);
    const sourceQuery: Query<number> = {
      get: () => sourceValue$.getValue(),
      value$: sourceValue$,
    };

    const query = mapQuery(sourceQuery, (value) => value, { distinct: false });
    const listener = jest.fn();
    query.value$.subscribe(listener);

    sourceValue$.next(1);
    sourceValue$.next(1);

    expect(listener).toBeCalledTimes(3);
    expect(listener).nthCalledWith(1, 0);
    expect(listener).nthCalledWith(2, 1);
    expect(listener).nthCalledWith(3, 1);
  });

  it('should produce distinct values by default', () => {
    const sourceValue$ = new BehaviorSubject<number>(0);
    const sourceQuery: Query<number> = {
      get: () => sourceValue$.getValue(),
      value$: sourceValue$,
    };

    const query = mapQuery(sourceQuery, (value) => value);
    const listener = jest.fn();
    query.value$.subscribe(listener);

    sourceValue$.next(1);
    sourceValue$.next(1);

    expect(listener).toBeCalledTimes(2);
    expect(listener).nthCalledWith(1, 0);
    expect(listener).nthCalledWith(2, 1);
  });

  it('should produce distinct values when distinct = true', () => {
    const sourceValue$ = new BehaviorSubject<number>(0);
    const sourceQuery: Query<number> = {
      get: () => sourceValue$.getValue(),
      value$: sourceValue$,
    };

    const query = mapQuery(sourceQuery, (value) => value, { distinct: true });
    const listener = jest.fn();
    query.value$.subscribe(listener);

    sourceValue$.next(1);
    sourceValue$.next(1);

    expect(listener).toBeCalledTimes(2);
    expect(listener).nthCalledWith(1, 0);
    expect(listener).nthCalledWith(2, 1);
  });

  it('should produce distinct values with the custom comparator', () => {
    type Value = { v: number };
    const sourceValue$ = new BehaviorSubject<Value>({ v: 0 });
    const sourceQuery: Query<Value> = {
      get: () => sourceValue$.getValue(),
      value$: sourceValue$,
    };

    const query = mapQuery(sourceQuery, (value) => value, {
      distinct: { comparator: (a, b) => a.v === b.v },
    });
    const listener = jest.fn();
    query.value$.subscribe(listener);

    sourceValue$.next({ v: 1 });
    sourceValue$.next({ v: 1 });
    sourceValue$.next({ v: 2 });

    expect(listener).toBeCalledTimes(3);
    expect(listener).nthCalledWith(1, { v: 0 });
    expect(listener).nthCalledWith(2, { v: 1 });
    expect(listener).nthCalledWith(3, { v: 2 });
  });

  it('should produce distinct values with the custom keySelector', () => {
    type Value = { v: number };
    const sourceValue$ = new BehaviorSubject<Value>({ v: 0 });
    const sourceQuery: Query<Value> = {
      get: () => sourceValue$.getValue(),
      value$: sourceValue$,
    };

    const query = mapQuery(sourceQuery, (value) => value, {
      distinct: { keySelector: (a) => a.v },
    });
    const listener = jest.fn();
    query.value$.subscribe(listener);

    sourceValue$.next({ v: 1 });
    sourceValue$.next({ v: 1 });
    sourceValue$.next({ v: 2 });

    expect(listener).toBeCalledTimes(3);
    expect(listener).nthCalledWith(1, { v: 0 });
    expect(listener).nthCalledWith(2, { v: 1 });
    expect(listener).nthCalledWith(3, { v: 2 });
  });

  it('should return the same calculated value if there is a subscription and the source was not changed', async () => {
    const source = createStore(1);
    const result = mapQuery(source, (value) => ({ value }));

    expect(result.get() === result.get()).toBe(false);

    let obj3;
    let obj4;
    const subscription1 = result.value$.subscribe((value) => (obj3 = value));
    const subscription2 = result.value$.subscribe((value) => (obj4 = value));

    expect(obj3 === obj4).toBe(true);

    const obj1 = result.get();
    const obj2 = result.get();
    expect(obj1 === obj2).toBe(true);

    expect(obj1 === obj3).toBe(true);

    subscription1.unsubscribe();
    expect(result.get() === obj1).toBe(true);

    subscription2.unsubscribe();
    expect(result.get() === obj1).toBe(false);
  });
});

describe('mergeQueries()', () => {
  it('should return a calculated value from source queries', () => {
    const store1 = createStore(2);
    const store2 = createStore('text');
    const query = mergeQueries([store1, store2], (a, b) => ({ a, b }));

    expect(query.get()).toEqual({ a: 2, b: 'text' });

    store1.set(3);
    expect(query.get()).toEqual({ a: 3, b: 'text' });

    store2.set('text2');
    expect(query.get()).toEqual({ a: 3, b: 'text2' });
  });

  it('should return an observable with the calculated value from source queries', async () => {
    const store1 = createStore(2);
    const store2 = createStore('text');
    const query = mergeQueries([store1, store2], (a, b) => ({ a, b }));

    expect(await firstValueFrom(query.value$)).toEqual({ a: 2, b: 'text' });

    store1.set(3);
    expect(await firstValueFrom(query.value$)).toEqual({ a: 3, b: 'text' });

    store2.set('text2');
    expect(await firstValueFrom(query.value$)).toEqual({ a: 3, b: 'text2' });
  });

  it('should infer types for values of the queries', () => {
    const store1 = createStore<number>(2);
    const store2 = createStore<{ value: number }>({ value: 3 });

    const query: Query<number> = mergeQueries(
      [store1, store2],
      (value, obj) => value + obj.value,
    );

    expect(query.get()).toEqual(5);
  });

  it('should produce values for each source emission if distinct is false', () => {
    const store1 = createStore(0);
    const store2 = createStore({ k: 0, value: 0 });

    const query = mergeQueries(
      [store1, store2],
      (a, b) => ({ a, b: b.value }),
      { distinct: false },
    );
    const listener = jest.fn();
    query.value$.subscribe(listener);

    store2.set({ k: 1, value: 0 });
    store2.set({ k: 2, value: 1 });

    expect(listener).toBeCalledTimes(3);
    expect(listener).nthCalledWith(1, { a: 0, b: 0 });
    expect(listener).nthCalledWith(2, { a: 0, b: 0 });
    expect(listener).nthCalledWith(3, { a: 0, b: 1 });
  });

  it('should produce distinct values for each source emission by default', () => {
    const store1 = createStore(0);
    const store2 = createStore({ k: 0, value: 0 });

    const query = mergeQueries([store1, store2], (a, b) => a + b.value);
    const listener = jest.fn();
    query.value$.subscribe(listener);

    store2.set({ k: 1, value: 0 });
    store2.set({ k: 2, value: 1 });

    expect(listener).toBeCalledTimes(2);
    expect(listener).nthCalledWith(1, 0);
    expect(listener).nthCalledWith(2, 1);
  });

  it('should produce distinct values with the custom comparator', () => {
    const store1 = createStore(0);
    const store2 = createStore({ k: 0, value: 0 });

    const query = mergeQueries(
      [store1, store2],
      (a, b) => ({ a, b: b.value }),
      { distinct: { comparator: (a, b) => a.a === b.a } },
    );
    const listener = jest.fn();
    query.value$.subscribe(listener);

    store2.set({ k: 1, value: 1 });
    store2.set({ k: 2, value: 2 });
    store1.set(1);

    expect(listener).toBeCalledTimes(2);
    expect(listener).nthCalledWith(1, { a: 0, b: 0 });
    expect(listener).nthCalledWith(2, { a: 1, b: 2 });
  });

  it('should produce distinct values with the custom keySelector', () => {
    const store1 = createStore(0);
    const store2 = createStore({ k: 0, value: 0 });

    const query = mergeQueries(
      [store1, store2],
      (a, b) => ({ a, b: b.value }),
      { distinct: { keySelector: (a) => a.a } },
    );
    const listener = jest.fn();
    query.value$.subscribe(listener);

    store2.set({ k: 1, value: 1 });
    store2.set({ k: 2, value: 2 });
    store1.set(1);

    expect(listener).toBeCalledTimes(2);
    expect(listener).nthCalledWith(1, { a: 0, b: 0 });
    expect(listener).nthCalledWith(2, { a: 1, b: 2 });
  });

  it('should return the same calculated value if there is a subscription and the source was not changed', async () => {
    const source1 = createStore(1);
    const source2 = createStore(2);
    const result = mergeQueries([source1, source2], (value1, value2) => ({
      value: value1 + value2,
    }));

    expect(result.get() === result.get()).toBe(false);

    let obj3;
    let obj4;
    const subscription1 = result.value$.subscribe((value) => (obj3 = value));
    const subscription2 = result.value$.subscribe((value) => (obj4 = value));

    expect(obj3 === obj4).toBe(true);

    const obj1 = result.get();
    const obj2 = result.get();
    expect(obj1 === obj2).toBe(true);

    expect(obj1 === obj3).toBe(true);

    subscription1.unsubscribe();
    expect(result.get() === obj1).toBe(true);

    subscription2.unsubscribe();
    expect(result.get() === obj1).toBe(false);
  });
});
