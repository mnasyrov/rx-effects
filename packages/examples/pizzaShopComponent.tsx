import React, { FC, useEffect } from 'react';
import { useConst, useObservable, useStateQuery } from 'rx-effects-react';
import { createPizzaShopController } from './pizzaShop';

export const PizzaShop: FC = () => {
  const controller = useConst(() => createPizzaShopController());
  useEffect(() => controller.destroyController, [controller]);

  const { ordersQuery, addPizza, removePizza, submitCart, submitState } =
    controller;

  const orders = useStateQuery(ordersQuery);
  const isPending = useStateQuery(submitState.pending);
  const submitError = useObservable(submitState.error$, undefined);

  return (
    <>
      <h1>Pizza Shop</h1>

      <h2>Menu</h2>
      <ul>
        <li>
          Pepperoni
          <button disabled={isPending} onClick={() => addPizza('Pepperoni')}>
            Add
          </button>
        </li>

        <li>
          Margherita
          <button disabled={isPending} onClick={() => addPizza('Margherita')}>
            Add
          </button>
        </li>
      </ul>

      <h2>Cart</h2>
      <ul>
        {orders.map((name) => (
          <li>
            {name}
            <button disabled={isPending} onClick={() => removePizza(name)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <button disabled={isPending || orders.length === 0} onClick={submitCart}>
        Submit
      </button>

      {submitError && <div>Failed to submit the cart</div>}
    </>
  );
};
