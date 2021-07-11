import { BehaviorSubject, firstValueFrom } from 'rxjs';

import { mapStateQuery, StateQuery } from './stateQuery';

describe('mapStateQuery()', () => {
  it('should returns a new state query with applied mapper which transforms the selected value', async () => {
    const sourceValue$ = new BehaviorSubject<number>(0);
    const sourceQuery: StateQuery<number> = {
      get: () => sourceValue$.getValue(),
      value$: sourceValue$,
    };

    const query = mapStateQuery(sourceQuery, (value) => value + 10);

    expect(query.get()).toBe(10);
    expect(await firstValueFrom(query.value$)).toBe(10);

    sourceValue$.next(1);
    expect(query.get()).toBe(11);
    expect(await firstValueFrom(query.value$)).toBe(11);
  });
});
