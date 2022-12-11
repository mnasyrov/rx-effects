import { MonoTypeOperatorFunction, Subscription } from 'rxjs';
import { createStore, InternalStoreOptions, Store, StoreQuery } from './store';

/**
 * Creates a deferred or transformed view of the store.
 */
export function pipeStore<T>(
  store: Store<T>,
  operator: MonoTypeOperatorFunction<T>,
): StoreQuery<T> {
  let subscription: Subscription | undefined;

  const clone = createStore<T>(store.get(), {
    internal: true,
    onDestroy: () => {
      if (subscription) {
        subscription.unsubscribe();
        subscription = undefined;
      }
    },
  } as InternalStoreOptions<T>);

  subscription = store.value$.pipe(operator).subscribe({
    next: (state) => {
      clone.set(state);
    },
    complete: () => {
      clone.destroy();
    },
  });

  return clone;
}
