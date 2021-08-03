import {
  Controller,
  createAction,
  createEffectScope,
  declareState,
  EffectState,
  StateMutation,
  StateQuery,
} from 'rx-effects';
import { delay, filter, map, mapTo, of } from 'rxjs';

// The state
type CartState = { orders: Array<string> };

// State mutation can be exported and tested separately
const addPizzaToCart =
  (name: string): StateMutation<CartState> =>
  (state) => ({ ...state, orders: [...state.orders, name] });

const removePizzaFromCart =
  (name: string): StateMutation<CartState> =>
  (state) => ({
    ...state,
    orders: state.orders.filter((order) => order !== name),
  });

// Declaring the state. `declareState()` returns a few factories for the store.
const CART_STATE = declareState<CartState>(() => ({ orders: [] }));

// Declaring the controller.
// It should provide methods for triggering the actions,
// and queries or observables for subscribing to data.
export type PizzaShopController = Controller<{
  ordersQuery: StateQuery<Array<string>>;

  addPizza: (name: string) => void;
  removePizza: (name: string) => void;
  submitCart: () => void;
  submitState: EffectState<Array<string>>;
}>;

export function createPizzaShopController(): PizzaShopController {
  // Creates the state store
  const store = CART_STATE.createStore();

  // Creates queries for the state data
  const ordersQuery = store.query((state) => state.orders);

  // Introduces actions
  const addPizza = createAction<string>();
  const removePizza = createAction<string>();
  const submitCart = createAction();

  // Creates the scope for effects to track internal subscriptions
  const scope = createEffectScope();

  // Handle simple actions
  scope.handleAction(addPizza, (order) => store.update(addPizzaToCart(order)));

  scope.handleAction(removePizza, (name) =>
    store.update(removePizzaFromCart(name)),
  );

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
  scope.handleAction(submitEffect.done$, () =>
    store.set(CART_STATE.initialState),
  );

  return {
    ordersQuery,
    addPizza,
    removePizza,
    submitCart,
    submitState: submitEffect,
    destroy: () => scope.destroy(),
  };
}
