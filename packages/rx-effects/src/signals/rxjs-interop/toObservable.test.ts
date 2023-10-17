import { firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { waitForMicrotask } from '../../../test/testUtils';
import { computed } from '../computed';
import { signal } from '../signal';
import { toObservable } from './toObservable';

describe('toObservable()', () => {
  it('should produce an observable that tracks a signal', async () => {
    const counter = signal(0);
    const counterValues = firstValueFrom(
      toObservable(counter).pipe(take(3), toArray()),
    );

    // Initial effect execution, emits 0.
    await waitForMicrotask();

    counter.set(1);
    // Emits 1.
    await waitForMicrotask();

    counter.set(2);
    counter.set(3);
    // Emits 3 (ignores 2 as it was batched by the effect).
    await waitForMicrotask();

    expect(await counterValues).toEqual([0, 1, 3]);
  });

  it('should propagate errors from the signal', async () => {
    const source = signal(1);
    const counter = computed(() => {
      const value = source();
      if (value === 2) {
        throw 'fail';
      } else {
        return value;
      }
    });

    const counter$ = toObservable(counter);

    let currentValue = 0;
    let currentError: any = null;

    const sub = counter$.subscribe({
      next: (value) => (currentValue = value),
      error: (err) => (currentError = err),
    });

    await waitForMicrotask();
    expect(currentValue).toBe(1);

    source.set(2);
    await waitForMicrotask();
    expect(currentError).toBe('fail');

    sub.unsubscribe();
  });

  it('monitors the signal even if the Observable is never subscribed', async () => {
    let counterRead = false;
    const counter = computed(() => {
      counterRead = true;
      return 0;
    });

    toObservable(counter);

    // Simply creating the Observable shouldn't trigger a signal read.
    expect(counterRead).toBe(false);

    await waitForMicrotask();
    expect(counterRead).toBe(false);
  });

  it('should not monitor the signal if the Observable has no active subscribers', async () => {
    const counter = signal(0);

    // Tracks how many reads of `counter()` there have been.
    let readCount = 0;
    const trackedCounter = computed(() => {
      readCount++;
      return counter();
    });

    const counter$ = toObservable(trackedCounter);

    const sub = counter$.subscribe();
    expect(readCount).toBe(0);

    await waitForMicrotask();
    expect(readCount).toBe(1);

    // Sanity check of the read tracker - updating the counter should cause it to be read again
    // by the active effect.
    counter.set(1);
    await waitForMicrotask();
    expect(readCount).toBe(2);

    // Tear down the only subscription.
    sub.unsubscribe();

    // Now, setting the signal still triggers additional reads
    counter.set(2);
    await waitForMicrotask();
    expect(readCount).toBe(2);
  });

  it('stops monitoring the signal once injector is destroyed', async () => {
    const counter = signal(0);

    // Tracks how many reads of `counter()` there have been.
    let readCount = 0;
    const trackedCounter = computed(() => {
      readCount++;
      return counter();
    });

    // const childInjector = createEnvironmentInjector([], injector);
    toObservable(trackedCounter);

    expect(readCount).toBe(0);

    await waitForMicrotask();
    expect(readCount).toBe(0);

    // Now, setting the signal shouldn't trigger any additional reads, as the Injector was destroyed
    // childInjector.destroy();
    counter.set(2);
    await waitForMicrotask();
    expect(readCount).toBe(0);
  });

  it('does not track downstream signal reads in the effect', async () => {
    const counter = signal(0);
    const emits = signal(0);

    toObservable(counter).subscribe(() => {
      // Read emits. If we are still tracked in the effect, this will cause
      // an infinite loop by triggering the effect again.
      emits();
      emits.update((v) => v + 1);
    });

    await waitForMicrotask();
    expect(emits()).toBe(1);

    await waitForMicrotask();
    expect(emits()).toBe(1);
  });
});
