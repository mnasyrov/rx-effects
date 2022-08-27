# RxEffects: rx-effects-react

<img alt="rocket" src="https://raw.githubusercontent.com/mnasyrov/rx-effects/main/rocket.svg" width="120" />

Reactive state and effect management with RxJS. Tooling for React.js.

[![npm](https://img.shields.io/npm/v/rx-effects-react.svg)](https://www.npmjs.com/package/rx-effects-react)
[![downloads](https://img.shields.io/npm/dt/rx-effects-react.svg)](https://www.npmjs.com/package/rx-effects-react)
[![types](https://img.shields.io/npm/types/rx-effects-react.svg)](https://www.npmjs.com/package/rx-effects-react)
[![licence](https://img.shields.io/github/license/mnasyrov/rx-effects.svg)](https://github.com/mnasyrov/rx-effects/blob/master/LICENSE)
[![Coverage Status](https://coveralls.io/repos/github/mnasyrov/rx-effects/badge.svg?branch=main)](https://coveralls.io/github/mnasyrov/rx-effects?branch=main)

## Documentation

- [Main docs](https://github.com/mnasyrov/rx-effects#readme)
- [API docs](docs/README.md)

## Installation

```
npm install rx-effects rx-effects-react --save
```

## Usage

The package provides utility hooks to bind the core [RxEffects][rx-effects/docs]
to React components and hooks:

- [`useConst`](docs/README.md#useconst) – keeps the value as a constant between renders.
- [`useController`](docs/README.md#usecontroller) – creates an ad-hoc controller by the factory and destroys it on unmounting.
- [`useObservable`](docs/README.md#useobservable) – returns a value provided by `source$` observable.
- [`useObserver`](docs/README.md#useobserver) – subscribes the provided observer or `next` handler on `source$` observable.
- [`useSelector`](docs/README.md#useselector) – returns a value provided by `source$` observable.
- [`useQuery`](docs/README.md#usequery) – returns a value which is provided by the query.

Example:

```tsx
// pizzaShopComponent.tsx

import React, { FC, useEffect } from 'react';
import { useConst, useObservable, useQuery } from 'rx-effects-react';
import { createPizzaShopController } from './pizzaShop';

export const PizzaShopComponent: FC = () => {
  // Creates the controller and destroy it on unmounting the component
  const controller = useConst(() => createPizzaShopController());
  useEffect(() => controller.destroy, [controller]);

  // The same creation can be achieved by using `useController()` helper:
  // const controller = useController(createPizzaShopController);

  // Using the controller
  const { ordersQuery, addPizza, removePizza, submitCart, submitState } =
    controller;

  // Subscribing to state data and the effect stata
  const orders = useQuery(ordersQuery);
  const isPending = useQuery(submitState.pending);
  const submitError = useObservable(submitState.error$, undefined);

  // Actual rendering should be here.
  return null;
};
```

---

[rx-effects/docs]: https://github.com/mnasyrov/rx-effects/blob/main/packages/rx-effects/README.md

&copy; 2021 [Mikhail Nasyrov](https://github.com/mnasyrov), [MIT license](./LICENSE)
