import {
  Controller,
  createAction,
  createScope,
  declareState,
  EffectState,
  Query,
} from 'rx-effects';
import { delay, filter, map, mapTo, of } from 'rxjs';

// The state
type CartState = { orders: Array<string> };

// Declaring the state. `declareState()` returns a few factories for the store.
const CART_STATE = declareState<CartState>(() => ({ orders: [] }));

// Create a factory of store updates. It is a convenient form to declare state mutation.
// Also, there is another way to declare state mutation functions which can be exported and tested separately.
const createCartStoreUpdates = CART_STATE.createStoreActions({
  addPizzaToCart: (name: string) => (state) => ({
    ...state,
    orders: [...state.orders, name],
  }),

  removePizzaFromCart: (name: string) => (state) => ({
    ...state,
    orders: state.orders.filter((order) => order !== name),
  }),
});

// Declaring the controller.
// It should provide methods for triggering the actions,
// and queries or observables for subscribing to data.
export type PizzaShopController = Controller<{
  ordersQuery: Query<Array<string>>;

  addPizza: (name: string) => void;
  removePizza: (name: string) => void;
  submitCart: () => void;
  submitState: EffectState<Array<string>>;
}>;

export function createPizzaShopController(): PizzaShopController {
  // Creates the scope to track subscriptions
  const scope = createScope();

  // Creates the state store
  const store = scope.createDeclaredStore(CART_STATE);
  const storeUpdates = createCartStoreUpdates(store);

  // Creates queries for the state data
  const ordersQuery = store.query((state) => state.orders);

  // Introduces actions
  const addPizza = createAction<string>();
  const removePizza = createAction<string>();
  const submitCart = createAction();

  // Handle simple actions
  scope.handle(addPizza, (order) => storeUpdates.addPizzaToCart(order));

  scope.handle(removePizza, (name) => storeUpdates.removePizzaFromCart(name));

  // Create a effect in a general way
  const submitEffect = scope.createEffect<Array<string>>((orders) => {
    // Sending an async request to a server
    return of(orders).pipe(delay(1000), mapTo(undefined));
  });

  // Effect can handle `Observable` and `Action`. It allows to filter action events
  // and transform data which is passed to effect's handler.
  submitEffect.handle(
    submitCart.event$.pipe(
      map(() => ordersQuery.get()),
      filter((orders) => !submitEffect.pending.get() && orders.length > 0),
    ),
  );

  // Effect's results can be used as actions
  scope.handle(submitEffect.done$, () => store.set(CART_STATE.initialState));

  return {
    ordersQuery,
    addPizza,
    removePizza,
    submitCart,
    submitState: submitEffect,
    destroy: () => scope.destroy(),
  };
}
