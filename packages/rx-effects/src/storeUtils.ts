import { MonoTypeOperatorFunction } from 'rxjs';
import { createStore, InternalStoreOptions, Store, StoreQuery } from './store';

/**
 * Creates a deferred or transformed view of the store.
 */
export function pipeStore<T>(
  store: Store<T>,
  operator: MonoTypeOperatorFunction<T>,
): StoreQuery<T> {
  const clone = createStore<T>(store.get(), {
    internal: true,
    onDestroy,
  } as InternalStoreOptions<T>);

  const subscription = store.value$.pipe(operator).subscribe((state) => {
    clone.set(state);
  });

  function onDestroy() {
    subscription.unsubscribe();
    clone.destroy();
  }

  return clone;
}
