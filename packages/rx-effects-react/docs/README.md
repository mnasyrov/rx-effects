rx-effects-react

# rx-effects-react

## Table of contents

### Functions

- [useConst](README.md#useconst)
- [useObservable](README.md#useobservable)
- [useObserver](README.md#useobserver)
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
| `initialValue` | () => `T` \| `T` | a value or a factory for the value |

#### Returns

`T`

#### Defined in

[useConst.ts:12](https://github.com/mnasyrov/rx-effects/blob/f3195d1/packages/rx-effects-react/src/useConst.ts#L12)

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

[useObservable.ts:19](https://github.com/mnasyrov/rx-effects/blob/f3195d1/packages/rx-effects-react/src/useObservable.ts#L19)

---

### useObserver

▸ **useObserver**<`T`\>(`source$`, `observerOrNext`): `Subscription`

Subscribes the provided observer or `next` handler on the source.

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

[useObserver.ts:21](https://github.com/mnasyrov/rx-effects/blob/f3195d1/packages/rx-effects-react/src/useObserver.ts#L21)

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

| Name           | Type                                | Description                                                                |
| :------------- | :---------------------------------- | :------------------------------------------------------------------------- |
| `source$`      | `Observable`<`S`\>                  | an observable for values                                                   |
| `initialValue` | `S`                                 | th first value which is returned by the hook                               |
| `selector`     | (`state`: `S`) => `R`               | a transform function for getting a derived value based on the source value |
| `comparator`   | (`v1`: `R`, `v2`: `R`) => `boolean` | a comparator for previous and next values                                  |

#### Returns

`R`

#### Defined in

[useSelector.ts:26](https://github.com/mnasyrov/rx-effects/blob/f3195d1/packages/rx-effects-react/src/useSelector.ts#L26)

---

### useStateQuery

▸ **useStateQuery**<`T`\>(`query`): `T`

Provides the current and future values which are provided by the query.

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name    | Type               | Description           |
| :------ | :----------------- | :-------------------- |
| `query` | `StateQuery`<`T`\> | – a query for a value |

#### Returns

`T`

#### Defined in

[useStateQuery.ts:9](https://github.com/mnasyrov/rx-effects/blob/f3195d1/packages/rx-effects-react/src/useStateQuery.ts#L9)
