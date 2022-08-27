rx-effects-react

# rx-effects-react

## Table of contents

### Functions

- [useConst](README.md#useconst)
- [useController](README.md#usecontroller)
- [useObservable](README.md#useobservable)
- [useObserver](README.md#useobserver)
- [useQuery](README.md#usequery)
- [useSelector](README.md#useselector)
- [useStateQuery](README.md#usestatequery)

## Functions

### useConst

▸ **useConst**<`T`\>(`initialValue`): `T`

Keeps the value as a constant between renders of a component.

If the factory is provided, it is called only once.

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name           | Type             | Description                        |
| :------------- | :--------------- | :--------------------------------- |
| `initialValue` | `T` \| () => `T` | a value or a factory for the value |

#### Returns

`T`

#### Defined in

[rx-effects-react/src/useConst.ts:12](https://github.com/mnasyrov/rx-effects/blob/bfe3371/packages/rx-effects-react/src/useConst.ts#L12)

---

### useController

▸ **useController**<`T`\>(`factory`, `dependencies?`): `T`

Creates an ad-hoc controller by the factory and destroys it on unmounting a
component.

The factory is not part of the dependencies by default. It should be
included explicitly when it is needed.

#### Type parameters

| Name | Type                                                                          |
| :--- | :---------------------------------------------------------------------------- |
| `T`  | extends `Readonly`<{ `destroy`: () => `void` } & `Record`<`string`, `any`\>\> |

#### Parameters

| Name           | Type        | Default value        | Description                                            |
| :------------- | :---------- | :------------------- | :----------------------------------------------------- |
| `factory`      | () => `T`   | `undefined`          | a controller factory                                   |
| `dependencies` | `unknown`[] | `EMPTY_DEPENDENCIES` | array of hook dependencies to recreate the controller. |

#### Returns

`T`

#### Defined in

[rx-effects-react/src/useController.ts:18](https://github.com/mnasyrov/rx-effects/blob/bfe3371/packages/rx-effects-react/src/useController.ts#L18)

---

### useObservable

▸ **useObservable**<`T`\>(`source$`, `initialValue`, `compare?`): `T`

Returns a value provided by `source$`.

The hook returns the initial value and subscribes on the `source$`. After
that, the hook returns values which are provided by the source.

**`example`**

```ts
const value = useObservable<string>(source$, undefined);
```

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name           | Type                                | Description                                  |
| :------------- | :---------------------------------- | :------------------------------------------- |
| `source$`      | `Observable`<`T`\>                  | an observable for values                     |
| `initialValue` | `T`                                 | th first value which is returned by the hook |
| `compare?`     | (`v1`: `T`, `v2`: `T`) => `boolean` | -                                            |

#### Returns

`T`

#### Defined in

[rx-effects-react/src/useObservable.ts:19](https://github.com/mnasyrov/rx-effects/blob/bfe3371/packages/rx-effects-react/src/useObservable.ts#L19)

---

### useObserver

▸ **useObserver**<`T`\>(`source$`, `observerOrNext`): `Subscription`

Subscribes the provided observer or `next` handler on `source$` observable.

This hook allows to do fine handling of the source observable.

**`example`**

```ts
const observer = useCallback((nextValue) => {
  logger.log(nextValue);
}, []);
useObserver(source$, observer);
```

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name             | Type                                                     | Description                  |
| :--------------- | :------------------------------------------------------- | :--------------------------- |
| `source$`        | `Observable`<`T`\>                                       | an observable                |
| `observerOrNext` | `Partial`<`Observer`<`T`\>\> \| (`value`: `T`) => `void` | `Observer` or `next` handler |

#### Returns

`Subscription`

#### Defined in

[rx-effects-react/src/useObserver.ts:21](https://github.com/mnasyrov/rx-effects/blob/bfe3371/packages/rx-effects-react/src/useObserver.ts#L21)

---

### useQuery

▸ **useQuery**<`T`\>(`query`): `T`

Returns a value which is provided by the query.

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name    | Type                                                             | Description           |
| :------ | :--------------------------------------------------------------- | :-------------------- |
| `query` | `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> | – a query for a value |

#### Returns

`T`

#### Defined in

[rx-effects-react/src/useQuery.ts:9](https://github.com/mnasyrov/rx-effects/blob/bfe3371/packages/rx-effects-react/src/useQuery.ts#L9)

---

### useSelector

▸ **useSelector**<`S`, `R`\>(`source$`, `initialValue`, `selector`, `comparator?`): `R`

Returns a value provided by `source$`.

The hook returns the initial value and subscribes on the `source$`. After
that, the hook returns values which are provided by the source.

**`example`**

```ts
const value = useSelector<{ data: Record<string, string> }>(
  source$,
  undefined,
  (state) => state.data,
  (data1, data2) => data1.key === data2.key,
);
```

#### Type parameters

| Name |
| :--- |
| `S`  |
| `R`  |

#### Parameters

| Name           | Type                                | Default value        | Description                                                                |
| :------------- | :---------------------------------- | :------------------- | :------------------------------------------------------------------------- |
| `source$`      | `Observable`<`S`\>                  | `undefined`          | an observable for values                                                   |
| `initialValue` | `S`                                 | `undefined`          | th first value which is returned by the hook                               |
| `selector`     | (`state`: `S`) => `R`               | `undefined`          | a transform function for getting a derived value based on the source value |
| `comparator`   | (`v1`: `R`, `v2`: `R`) => `boolean` | `DEFAULT_COMPARATOR` | a comparator for previous and next values                                  |

#### Returns

`R`

#### Defined in

[rx-effects-react/src/useSelector.ts:27](https://github.com/mnasyrov/rx-effects/blob/bfe3371/packages/rx-effects-react/src/useSelector.ts#L27)

---

### useStateQuery

▸ **useStateQuery**<`T`\>(`query`): `T`

Returns a value which is provided by the query.

**`deprecated`** Use `useQuery()`.

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name    | Type                                                             | Description           |
| :------ | :--------------------------------------------------------------- | :-------------------- |
| `query` | `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> | – a query for a value |

#### Returns

`T`

#### Defined in

[rx-effects-react/src/useQuery.ts:30](https://github.com/mnasyrov/rx-effects/blob/bfe3371/packages/rx-effects-react/src/useQuery.ts#L30)
