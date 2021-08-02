# RxEffects

<img alt="rocket" src="rocket.svg" width="120" />

Reactive state and effect management with RxJS.

[![npm](https://img.shields.io/npm/v/rx-effects.svg)](https://www.npmjs.com/package/rx-effects)
[![downloads](https://img.shields.io/npm/dt/rx-effects.svg)](https://www.npmjs.com/package/rx-effects)
[![types](https://img.shields.io/npm/types/rx-effects.svg)](https://www.npmjs.com/package/rx-effects)
[![licence](https://img.shields.io/github/license/mnasyrov/rx-effects.svg)](https://github.com/mnasyrov/rx-effects/blob/master/LICENSE)
[![Coverage Status](https://coveralls.io/repos/github/mnasyrov/rx-effects/badge.svg)](https://coveralls.io/github/mnasyrov/rx-effects)

## Table of Contents

<!-- toc -->

- [Overview](#overview)
- [Features](#features)
- [Packages](#packages)
- [Installation](#installation)
- [Usage Example](#usage-example)

<!-- tocstop -->

## Overview

The library provides a way to declare actions and effects, states and stores. The core package is framework-agnostic which can be used independently in libraries, backend and frontend apps, including micro-frontends architecture.

The library is inspired by [MVC](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller), [RxJS](https://github.com/ReactiveX/rxjs), [Akita](https://github.com/datorama/akita) and [Effector](https://github.com/effector/effector).

## Features

- Framework-agnostic
- Functional API
- Reactive state and store
- Declarative actions and effects
- Effect container
- Typescript typings

## Packages

Please find the full documentation by the links below.

- [**rx-effects**][rx-effects/docs] – The core, state and effect management: [Documentation][rx-effects/docs], [API][rx-effects/api]
- [**rx-effects-react**][rx-effects-react/docs] – Tooling for React.js: [Documentation][rx-effects-react/docs], [API][rx-effects-react/api]

## Installation

```
npm install rx-effects rx-effects-react --save
```

## Usage

### Concepts

`// TODO`

### Example

Below is an implementation of the pizza shop, which allows order pizza from the menu and to submit the cart. The controller orchestrate the state store and side effects. The component renders the state and reacts on user events.

```ts
// pizzaShop.ts

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
```

```tsx
// pizzaShopComponent.tsx

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
```

---

[rx-effects/docs]: packages/rx-effects/README.md
[rx-effects/api]: packages/rx-effects/docs/README.md
[rx-effects-react/docs]: packages/rx-effects-react/README.md
[rx-effects-react/api]: packages/rx-effects-react/docs/README.md

&copy; 2021 [Mikhail Nasyrov](https://github.com/mnasyrov), [MIT license](./LICENSE)
