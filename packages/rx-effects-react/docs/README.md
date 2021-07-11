@rx-effects/react

# @rx-effects/react

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

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name           | Type             |
| :------------- | :--------------- |
| `initialValue` | () => `T` \| `T` |

#### Returns

`T`

#### Defined in

[useConst.ts:5](https://github.com/mnasyrov/rx-effects/blob/666d5b8/packages/rx-effects-react/src/useConst.ts#L5)

---

### useObservable

▸ **useObservable**<`T`\>(`source$`, `initialValue`, `compare?`): `T`

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name           | Type                                |
| :------------- | :---------------------------------- |
| `source$`      | `Observable`<`T`\>                  |
| `initialValue` | `T`                                 |
| `compare?`     | (`v1`: `T`, `v2`: `T`) => `boolean` |

#### Returns

`T`

#### Defined in

[useObservable.ts:4](https://github.com/mnasyrov/rx-effects/blob/666d5b8/packages/rx-effects-react/src/useObservable.ts#L4)

---

### useObserver

▸ **useObserver**<`T`\>(`source$`, `observerOrNext`): `Subscription`

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name             | Type                                                     |
| :--------------- | :------------------------------------------------------- |
| `source$`        | `Observable`<`T`\>                                       |
| `observerOrNext` | `Partial`<`Observer`<`T`\>\> \| (`value`: `T`) => `void` |

#### Returns

`Subscription`

#### Defined in

[useObserver.ts:5](https://github.com/mnasyrov/rx-effects/blob/666d5b8/packages/rx-effects-react/src/useObserver.ts#L5)

---

### useSelector

▸ **useSelector**<`S`, `R`\>(`state$`, `initialState`, `selector`, `compare?`): `R`

#### Type parameters

| Name |
| :--- |
| `S`  |
| `R`  |

#### Parameters

| Name           | Type                                |
| :------------- | :---------------------------------- |
| `state$`       | `Observable`<`S`\>                  |
| `initialState` | `S`                                 |
| `selector`     | (`state`: `S`) => `R`               |
| `compare`      | (`v1`: `R`, `v2`: `R`) => `boolean` |

#### Returns

`R`

#### Defined in

[useSelector.ts:4](https://github.com/mnasyrov/rx-effects/blob/666d5b8/packages/rx-effects-react/src/useSelector.ts#L4)

---

### useStateQuery

▸ **useStateQuery**<`T`\>(`query`): `T`

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name    | Type               |
| :------ | :----------------- |
| `query` | `StateQuery`<`T`\> |

#### Returns

`T`

#### Defined in

[useStateQuery.ts:4](https://github.com/mnasyrov/rx-effects/blob/666d5b8/packages/rx-effects-react/src/useStateQuery.ts#L4)
