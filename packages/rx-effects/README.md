# RxEffects

<img alt="rocket" src="https://raw.githubusercontent.com/mnasyrov/rx-effects/main/rocket.svg" width="120" />

Reactive state and effect management with RxJS.

[![npm](https://img.shields.io/npm/v/rx-effects.svg)](https://www.npmjs.com/package/rx-effects)
[![downloads](https://img.shields.io/npm/dt/rx-effects.svg)](https://www.npmjs.com/package/rx-effects)
[![types](https://img.shields.io/npm/types/rx-effects.svg)](https://www.npmjs.com/package/rx-effects)
[![licence](https://img.shields.io/github/license/mnasyrov/rx-effects.svg)](https://github.com/mnasyrov/rx-effects/blob/master/LICENSE)
[![Coverage Status](https://coveralls.io/repos/github/mnasyrov/rx-effects/badge.svg?branch=main)](https://coveralls.io/github/mnasyrov/rx-effects?branch=main)

## Documentation

- [Main docs](https://github.com/mnasyrov/rx-effects#readme)
- [API docs](docs/README.md)

## Installation

```
npm install rx-effects --save
```

## Concepts

The main idea is to use the classic MVC pattern with event-based models (state stores) and reactive controllers (actions
and effects). The view subscribes to model changes (state queries) of the controller and requests the controller to do
some actions.

<img alt="concept-diagram" src="https://raw.githubusercontent.com/mnasyrov/rx-effects/main/docs/concept-diagram.svg" width="400" />

Main elements:

- `State` – a data model.
- `Query` – a getter and subscriber for data of the state.
- `StateMutation` – a pure function which changes the state.
- `Store` – a state storage, it provides methods to update and subscribe the state.
- `Action` – an event emitter.
- `Effect` – a business logic which handles the action and makes state changes and side effects.
- `Controller` – a controller type for effects and business logic
- `Scope` – a controller-like boundary for effects and business logic

## State and Store

### Define State

A state can be a primitive value or an object, and it is described as a type.

```ts
type CartState = { orders: Array<string> };
```

### State Mutations

After that, it is recommended to declare a set of `StateMutation` functions which can be used to update the state. These
functions should be pure and return a new state or the previous one. For providing an argument use currying functions.

Actually, `StateMutation` function can change the state in place, but it is responsible for a developer to track state
changes by providing custom `stateCompare` function to a store.

```ts
const addPizzaToCart =
  (name: string): StateMutation<CartState> =>
  (state) => ({ ...state, orders: [...state.orders, name] });

const removePizzaFromCart =
  (name: string): StateMutation<CartState> =>
  (state) => ({
    ...state,
    orders: state.orders.filter((order) => order !== name),
  });
```

### Creation of Store

A store is created by `createStore()` function, which takes an initial state:

```ts
const INITIAL_STATE: CartState = { orders: [] };
const cartStore: Store<CartState> = createStore(INITIAL_STATE);
```

### Updating Store

The store can be updated by `set()` and `update()` methods:

- `set()` applies the provided `State` value to the store.
- `update()` creates the new state by the provided `StateMutation` and applies it to the store.

```ts
function resetCart() {
  cartStore.set(INITIAL_STATE);
}

function addPizza(name: string) {
  cartStore.update(addPizzaToCart(name));
}
```

`Store.update()` can apply an array of mutations while skipping empty mutation:

```ts
function addPizza(name: string) {
  cartStore.update([
    addPizzaToCart(name),
    name === 'Pepperoni' && addPizzaToCart('Bonus Pizza'),
  ]);
}
```

There is `pipeStateMutations()` helper, which can merge state updates into the single mutation:

```ts
import { pipeStateMutations } from './stateMutation';

const addPizzaToCartWithBonus = (name: string): StateMutation<CartState> =>
  pipeStateMutations([addPizzaToCart(name), addPizzaToCart('Bonus Pizza')]);

function addPizza(name: string) {
  cartStore.update(addPizzaToCartWithBonus(name));
}
```

### Getting State

The store implements `Query` type for providing the state:

- `get()` returns the current state.
- `value$` is an observable for the current state and future changes.

It is allowed to get the current state at any time. However, you should be aware how it is used during async functions,
because the state can be changed after awaiting a promise:

```ts
// Not recommended
async function submitForm() {
  await validate(formStore.get());
  await postData(formStore.get()); // `formStore` can return another data here
}

// Recommended
async function submitForm() {
  const data = formStore.get();
  await validate(data);
  await postData(data);
}
```

### State Queries

The store has `select()` and `query()` methods:

- `select()` returns `Observable` for the part of the state.
- `value$` returns `Query` for the part of the state.

Both of the methods takes `selector()` and `valueComparator()` arguments:

- `selector()` takes a state and produce a value based on the state.
- `valueComparator()` is optional and allows change an equality check for the produced value.

```ts
const orders$: Observable<Array<string>> = cartStore.select(
  (state) => state.orders,
);

const ordersQuery: Query<Array<string>> = cartStore.query(
  (state) => state.orders,
);
```

Utility functions:

- `mapQuery()` takes a query and a value mapper and returns a new query which projects the mapped value.
  ```ts
  const store = createStore<{ values: Array<string> }>();
  const valuesQuery = store.query((state) => state.values);
  const top5values = mapQuery(valuesQuery, (values) => values.slice(0, 5));
  ```
- `mergeQueries()` takes queries and a value merger and returns a new query which projects the derived value of queries.
  ```ts
  const store1 = createStore<number>(2);
  const store2 = createStore<number>(3);
  const sumValueQuery = mergeQueries(
    [store1, store2],
    (value1, value2) => value1 + value2,
  );
  ```

### Destroying Store

The store implements `Controller` type and has `destroy()` method.

`destory()` completes internal `Observable` sources and all derived observables, which are created by `select()` and `query()` methods.

After calling `destroy()` the store stops sending updates for state changes.

### Usage of libraries for immutable state

Types and factories for states and store are compatible with external libraries for immutable values like Immer.js or Immutable.js. All state changes are encapsulated by `StateMutation` functions so using the API remains the same. The one thing which should be considered is providing the right state comparators to the `Store`.

#### Immer.js

Integration of [Immer.js](https://github.com/immerjs/immer) is straightforward: it is enough to use `produce()` function inside `StateMutation` functions:

Example:

```ts
import { produce } from 'immer';
import { StateMutation } from 'rx-effects';

export type CartState = { orders: Array<string> };

export const CART_STATE = declareState<CartState>({ orders: [] });

export const addPizzaToCart = (name: string): StateMutation<CartState> =>
  produce((state) => {
    state.orders.push(name);
  });

export const removePizzaFromCart = (name: string): StateMutation<CartState> =>
  produce((state) => {
    state.orders = state.orders.filter((order) => order !== name);
  });
```

#### Immutable.js

Integration of [Immutable.js](https://github.com/immutable-js/immutable-js):

- It is recommended to use `Record` and `RecordOf` for object-list states.
- Use `Immutable.is()` function as a comparator for Immutable's state and values.

Example:

```ts
import { is, List, Record, RecordOf } from 'immutable';
import { declareState, StateMutation } from 'rx-effects';

export type CartState = RecordOf<{ orders: Immutable.List<string> }>;

export const CART_STATE = declareState<CartState>(
  Record({ orders: List() }),
  is, // State comparator of Immutable.js
);

export const addPizzaToCart =
  (name: string): StateMutation<CartState> =>
  (state) =>
    state.set('orders', state.orders.push(name));

export const removePizzaFromCart =
  (name: string): StateMutation<CartState> =>
  (state) =>
    state.set(
      'orders',
      state.orders.filter((order) => order !== name),
    );
```

## Actions and Effects

### Action

`// TODO`

### Effect

`// TODO`

### Controller

`// TODO`

### Scope

`// TODO`

---

&copy; 2021 [Mikhail Nasyrov](https://github.com/mnasyrov), [MIT license](./LICENSE)
