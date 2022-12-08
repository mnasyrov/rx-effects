import { debounceTime, firstValueFrom, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { createStore } from './store';
import { pipeStore } from './storeUtils';

describe('pipeStore', () => {
  it('should creates a transformed view of the source store', () => {
    const source = createStore(1);

    const result = pipeStore(
      source,
      map((value) => value * 10),
    );

    expect(result.get()).toBe(10);

    source.set(2);
    expect(result.get()).toBe(20);
  });

  it('should unsubscribe the view when the source store is destroyed', () => {
    const source = createStore(1);

    const result = pipeStore(
      source,
      map((value) => value * 10),
    );

    source.destroy();
    source.set(2);
    expect(result.get()).toBe(10);
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
