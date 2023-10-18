import { Observable, share, shareReplay, skip } from 'rxjs';
import { Signal } from '../common';
import { effect } from '../effect';
import { SIGNAL_RUNTIME } from '../runtime';

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
    const scheduler = options?.sync
      ? SIGNAL_RUNTIME.syncScheduler
      : SIGNAL_RUNTIME.asyncScheduler;

    const watcher = effect(
      () => {
        try {
          const value = source();
          scheduler.schedule({ run: () => subscriber.next(value) });
        } catch (error) {
          scheduler.schedule({ run: () => subscriber.error(error) });
        }
      },
      { sync: options?.sync },
    );

    return () => watcher.destroy();
  });

  if (options?.onlyChanges) {
    return observable.pipe(skip(1), share({ resetOnRefCountZero: true }));
  } else {
    return observable.pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }
}
