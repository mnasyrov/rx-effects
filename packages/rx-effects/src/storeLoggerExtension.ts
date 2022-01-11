import { StoreExtension } from './storeExtensions';

export function createStoreLoggerExtension(
  logger: typeof console.log = console.log,
): StoreExtension<unknown> {
  return (api) => ({
    onStoreEvent(event) {
      const { type, store } = event;

      const storeName = `${store.name ?? ''}#${store.id}`;

      switch (type) {
        case 'created':
        case 'destroyed': {
          logger(storeName, type);
          break;
        }

        case 'updated': {
          logger(storeName, type, {
            nextState: event.nextState,
            prevState: event.prevState,
          });
          break;
        }

        case 'mutation': {
          const mutationName =
            api.getStateMutationMetadata(event.mutation).name ?? 'anonymous';

          logger(storeName, type, mutationName, {
            nextState: event.nextState,
            prevState: event.prevState,
          });
        }
      }
    },
  });
}
