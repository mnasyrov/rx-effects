import { Observable, share, shareReplay, skip } from 'rxjs';
import { Signal } from '../common';
import { effect } from '../effect';
import { untracked } from '../graph';

export type ToObservableOptions = {
  sync?: boolean;
  onlyChanges?: boolean;
};

/**
 * Exposes the value of an `Signal` as an RxJS `Observable`.
 *
 * The signal's value will be propagated into the `Observable`'s subscribers using an `effect`.
 */
export function toObservable<T>(
  source: Signal<T>,
  options?: ToObservableOptions,
): Observable<T> {
  const observable = new Observable<T>((subscriber) => {
    const watcher = effect(
      () => {
        let value: T;
        try {
          value = source();
        } catch (err) {
          untracked(() => subscriber.error(err));
          return;
        }
        untracked(() => subscriber.next(value));
      },
      { sync: options?.sync },
    );

    return () => watcher.destroy();
  });

  if (options?.onlyChanges) {
    return observable.pipe(skip(1), share());
  } else {
    return observable.pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }
}
