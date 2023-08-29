/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Observable, share, shareReplay, skip } from 'rxjs';
import { Signal, untracked } from '../index';
import { effect } from '../reactivity/effect';

// TODO: Кажется необязательным. Можно убрать.
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
