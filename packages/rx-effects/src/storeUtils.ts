import { MonoTypeOperatorFunction, Subscription } from 'rxjs';
import {
  createStore,
  InternalStoreOptions,
  StateUpdates,
  Store,
  StoreOptions,
  StoreQuery,
  StoreWithUpdates,
  withStoreUpdates,
} from './store';

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

/**
 * @deprecated Use `declareStore()`
 */
export function declareStoreWithUpdates<
  State,
  Updates extends StateUpdates<State>,
>(
  initialState: State,
  updates: Updates,
  baseOptions?: StoreOptions<State>,
): (
  state?: State,
  options?: StoreOptions<State>,
) => StoreWithUpdates<State, Updates> {
  return (state = initialState, options?: StoreOptions<State>) => {
    return withStoreUpdates<State, Updates>(
      createStore<State>(state, { ...baseOptions, ...options }),
      updates,
    );
  };
}
