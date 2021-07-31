import {
  createAction,
  createEffectScope,
  declareState,
  EffectState,
  StateMutation,
  StateQuery,
} from 'rx-effects';
import { delay, filter, map, mapTo, of } from 'rxjs';

type CartState = { orders: Array<string> };

const addPizzaToCart =
  (name: string): StateMutation<CartState> =>
  (state) => ({ ...state, orders: [...state.orders, name] });

const removePizzaFromCart =
  (name: string): StateMutation<CartState> =>
  (state) => ({
    ...state,
    orders: state.orders.filter((order) => order !== name),
  });

const CART_STATE = declareState<CartState>(() => ({ orders: [] }));

export type PizzaShopController = {
  ordersQuery: StateQuery<Array<string>>;

  addPizza: (name: string) => void;
  removePizza: (name: string) => void;
  submitCart: () => void;
  submitState: EffectState<Array<string>>;

  destroyController: () => void;
};

export function createPizzaShopController(): PizzaShopController {
  const store = CART_STATE.createStore();

  const addPizza = createAction<string>();
  const removePizza = createAction<string>();
  const submitCart = createAction();

  const scope = createEffectScope();

  scope.handleAction(addPizza, (order) => store.update(addPizzaToCart(order)));

  scope.handleAction(removePizza, (name) =>
    store.update(removePizzaFromCart(name)),
  );

  const submitEffect = scope.createEffect<Array<string>>((orders) => {
    // Sending an async request to a server
    return of(orders).pipe(delay(1000), mapTo(undefined));
  });

  submitEffect.handle(
    submitCart.event$.pipe(
      map(() => store.get().orders),
      filter((orders) => !submitEffect.pending.get() && orders.length > 0),
    ),
  );

  scope.handleAction(submitEffect.done$, () =>
    store.set(CART_STATE.initialState),
  );

  return {
    ordersQuery: store.query((state) => state.orders),
    addPizza,
    removePizza,
    submitCart,
    submitState: submitEffect,
    destroyController: () => scope.destroy(),
  };
}
