import { Subscription } from 'rxjs';
import { STORE_EVENT_BUS, StoreEvent } from './storeEvents';
import { getStateMutationMetadata, isInternalStore } from './storeMetadata';

export type StoreExtensionApi = Readonly<{
  getStateMutationMetadata: typeof getStateMutationMetadata;
}>;

export type StoreExtension<State> = (api: StoreExtensionApi) => {
  onStoreEvent?: (event: StoreEvent<State>) => void;
};

export function registerStoreExtension(
  extension: StoreExtension<unknown>,
): Subscription {
  const api: StoreExtensionApi = {
    getStateMutationMetadata,
  };

  const middleware = extension(api);

  return STORE_EVENT_BUS.subscribe((event) => {
    if (middleware.onStoreEvent && !isInternalStore(event.store)) {
      middleware.onStoreEvent(event);
    }
  });
}
