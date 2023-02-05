import { debounceTime, filter, firstValueFrom, materialize, timer } from 'rxjs';
import { bufferWhen, map } from 'rxjs/operators';
import { pipeStore } from './pipeStore';
import { createStore } from './store';

describe('pipeStore()', () => {
  it('should creates a transformed view of the source store', async () => {
    const source = createStore(1);

    const result = pipeStore(
      source,
      map((value) => value * 10),
    );

    expect(result.get()).toBe(10);

    source.set(2);
    await 0;

    expect(result.get()).toBe(20);
  });

  it('should unsubscribe the view when the source store is destroyed', async () => {
    const source = createStore(1);

    const result = pipeStore(
      source,
      map((value) => value * 10),
    );

    const notifications$ = result.value$.pipe(materialize());

    const notificationsPromise = firstValueFrom(
      notifications$.pipe(
        bufferWhen(() => notifications$.pipe(filter((e) => e.kind === 'C'))),
      ),
    );

    source.destroy();
    source.set(2);
    expect(result.get()).toBe(10);

    expect(await notificationsPromise).toEqual([
      {
        hasValue: true,
        kind: 'N',
        value: 10,
      },
    ]);
  });

  it('should creates a debounced view of the source store', async () => {
    const source = createStore(1);

    const result = pipeStore(source, (state$) =>
      state$.pipe(
        debounceTime(10),
        map((value) => value * 10),
      ),
    );

    expect(result.get()).toBe(1);

    await firstValueFrom(timer(20));
    expect(result.get()).toBe(10);

    source.set(2);
    expect(result.get()).toBe(10);

    await firstValueFrom(timer(20));
    expect(result.get()).toBe(20);
  });
});
