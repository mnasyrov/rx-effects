import { BehaviorSubject, firstValueFrom } from 'rxjs';

import { mapQuery, mergeQueries, StateQuery } from './stateQuery';
import { createStore } from './store';

describe('mapQuery()', () => {
  it('should return a new state query with applied mapper which transforms the selected value', async () => {
    const sourceValue$ = new BehaviorSubject<number>(0);
    const sourceQuery: StateQuery<number> = {
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
});

describe('mergeQueries()', () => {
  it('should return a calculated value from source queries', () => {
    const store1 = createStore(2);
    const store2 = createStore('text');
    const query = mergeQueries([store1, store2], ([a, b]) => ({ a, b }));

    expect(query.get()).toEqual({ a: 2, b: 'text' });

    store1.set(3);
    expect(query.get()).toEqual({ a: 3, b: 'text' });

    store2.set('text2');
    expect(query.get()).toEqual({ a: 3, b: 'text2' });
  });

  it('should return an observable with the calculated value from source queries', async () => {
    const store1 = createStore(2);
    const store2 = createStore('text');
    const query = mergeQueries([store1, store2], ([a, b]) => ({ a, b }));

    expect(await firstValueFrom(query.value$)).toEqual({ a: 2, b: 'text' });

    store1.set(3);
    expect(await firstValueFrom(query.value$)).toEqual({ a: 3, b: 'text' });

    store2.set('text2');
    expect(await firstValueFrom(query.value$)).toEqual({ a: 3, b: 'text2' });
  });
});
