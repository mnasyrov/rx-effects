rx-effects

# rx-effects

## Table of contents

### Type aliases

- [Action](README.md#action)
- [Effect](README.md#effect)
- [EffectHandler](README.md#effecthandler)
- [EffectScope](README.md#effectscope)
- [StateDeclaration](README.md#statedeclaration)
- [StateFactory](README.md#statefactory)
- [StateMutation](README.md#statemutation)
- [StateQuery](README.md#statequery)
- [StateReader](README.md#statereader)
- [StateStore](README.md#statestore)

### Functions

- [createAction](README.md#createaction)
- [createEffect](README.md#createeffect)
- [createEffectScope](README.md#createeffectscope)
- [createResetStoreEffect](README.md#createresetstoreeffect)
- [createStateStore](README.md#createstatestore)
- [createUpdateStoreEffect](README.md#createupdatestoreeffect)
- [declareState](README.md#declarestate)
- [mapStateQuery](README.md#mapstatequery)
- [pipeStateMutations](README.md#pipestatemutations)
- [withQuery](README.md#withquery)
- [withStore](README.md#withstore)

## Type aliases

### Action

Ƭ **Action**<`Event`\>: `Object`

#### Type parameters

| Name |
| :------ |
| `Event` |

#### Call signature

▸ (): `void`

##### Returns

`void`

▸ (`event`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Event` |

##### Returns

`void`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `event$` | `Observable`<`Event`\> |

#### Defined in

[action.ts:3](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/action.ts#L3)

___

### Effect

Ƭ **Effect**<`Event`, `Result`, `ErrorType`\>: `Readonly`<`Object`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Event` | `Event` |
| `Result` | `void` |
| `ErrorType` | `Error` |

#### Defined in

[effect.ts:14](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/effect.ts#L14)

___

### EffectHandler

Ƭ **EffectHandler**<`Event`, `Result`\>: (`event`: `Event`) => `Result` \| `Promise`<`Result`\> \| `Observable`<`Result`\>

#### Type parameters

| Name |
| :------ |
| `Event` |
| `Result` |

#### Type declaration

▸ (`event`): `Result` \| `Promise`<`Result`\> \| `Observable`<`Result`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Event` |

##### Returns

`Result` \| `Promise`<`Result`\> \| `Observable`<`Result`\>

#### Defined in

[effect.ts:27](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/effect.ts#L27)

___

### EffectScope

Ƭ **EffectScope**: `Readonly`<`Object`\>

#### Defined in

[effectScope.ts:4](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/effectScope.ts#L4)

___

### StateDeclaration

Ƭ **StateDeclaration**<`State`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `State` | extends `Record`<`string`, `unknown`\> |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `createState` | [`StateFactory`](README.md#statefactory)<`State`\> |
| `createStore` | (`initialState?`: `State`) => [`StateStore`](README.md#statestore)<`State`\> |
| `initialState` | `State` |

#### Defined in

[stateDeclaration.ts:7](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/stateDeclaration.ts#L7)

___

### StateFactory

Ƭ **StateFactory**<`State`\>: (`values?`: `Partial`<`State`\>) => `State`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `State` | extends `Record`<`string`, `unknown`\> |

#### Type declaration

▸ (`values?`): `State`

##### Parameters

| Name | Type |
| :------ | :------ |
| `values?` | `Partial`<`State`\> |

##### Returns

`State`

#### Defined in

[stateDeclaration.ts:3](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/stateDeclaration.ts#L3)

___

### StateMutation

Ƭ **StateMutation**<`State`\>: (`state`: `State`) => `State`

#### Type parameters

| Name |
| :------ |
| `State` |

#### Type declaration

▸ (`state`): `State`

##### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `State` |

##### Returns

`State`

#### Defined in

[stateMutation.ts:1](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/stateMutation.ts#L1)

___

### StateQuery

Ƭ **StateQuery**<`T`\>: `Readonly`<`Object`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[stateQuery.ts:4](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/stateQuery.ts#L4)

___

### StateReader

Ƭ **StateReader**<`State`\>: `Readonly`<[`StateQuery`](README.md#statequery)<`State`\> & { `query`: <R\>(`selector`: (`state`: `State`) => `R`, `compare?`: (`v1`: `R`, `v2`: `R`) => `boolean`) => [`StateQuery`](README.md#statequery)<`R`\> ; `select`: <R\>(`selector`: (`state`: `State`) => `R`, `compare?`: (`v1`: `R`, `v2`: `R`) => `boolean`) => `Observable`<`R`\>  }\>

#### Type parameters

| Name |
| :------ |
| `State` |

#### Defined in

[stateStore.ts:6](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/stateStore.ts#L6)

___

### StateStore

Ƭ **StateStore**<`State`\>: `Readonly`<[`StateReader`](README.md#statereader)<`State`\> & { `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\>) => `void`  }\>

#### Type parameters

| Name |
| :------ |
| `State` |

#### Defined in

[stateStore.ts:19](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/stateStore.ts#L19)

## Functions

### createAction

▸ **createAction**<`Event`\>(): [`Action`](README.md#action)<`Event`\>

#### Type parameters

| Name |
| :------ |
| `Event` |

#### Returns

[`Action`](README.md#action)<`Event`\>

#### Defined in

[action.ts:11](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/action.ts#L11)

___

### createEffect

▸ **createEffect**<`Event`, `Result`, `ErrorType`\>(`handler`, `scopeSubscriptions?`): [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Event` | `Event` |
| `Result` | `void` |
| `ErrorType` | `Error` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\> |
| `scopeSubscriptions?` | `Subscription` |

#### Returns

[`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

#### Defined in

[effect.ts:31](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/effect.ts#L31)

___

### createEffectScope

▸ **createEffectScope**(): [`EffectScope`](README.md#effectscope)

#### Returns

[`EffectScope`](README.md#effectscope)

#### Defined in

[effectScope.ts:13](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/effectScope.ts#L13)

___

### createResetStoreEffect

▸ **createResetStoreEffect**<`State`\>(`store`, `nextState`): [`Effect`](README.md#effect)<`unknown`\>

#### Type parameters

| Name |
| :------ |
| `State` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `store` | [`StateStore`](README.md#statestore)<`State`\> |
| `nextState` | `State` |

#### Returns

[`Effect`](README.md#effect)<`unknown`\>

#### Defined in

[stateUtils.ts:17](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/stateUtils.ts#L17)

___

### createStateStore

▸ **createStateStore**<`State`\>(`initialState`, `stateCompare?`): [`StateStore`](README.md#statestore)<`State`\>

#### Type parameters

| Name |
| :------ |
| `State` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `initialState` | `State` |
| `stateCompare` | (`s1`: `State`, `s2`: `State`) => `boolean` |

#### Returns

[`StateStore`](README.md#statestore)<`State`\>

#### Defined in

[stateStore.ts:26](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/stateStore.ts#L26)

___

### createUpdateStoreEffect

▸ **createUpdateStoreEffect**<`Event`, `State`\>(`store`, `reducer`): [`Effect`](README.md#effect)<`Event`\>

#### Type parameters

| Name |
| :------ |
| `Event` |
| `State` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `store` | [`StateStore`](README.md#statestore)<`State`\> |
| `reducer` | (`state`: `State`, `event`: `Event`) => `State` |

#### Returns

[`Effect`](README.md#effect)<`Event`\>

#### Defined in

[stateUtils.ts:8](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/stateUtils.ts#L8)

___

### declareState

▸ **declareState**<`State`\>(`stateFactory`, `stateCompare?`): [`StateDeclaration`](README.md#statedeclaration)<`State`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `State` | extends `Record`<`string`, `unknown`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `stateFactory` | [`StateFactory`](README.md#statefactory)<`State`\> |
| `stateCompare?` | (`s1`: `State`, `s2`: `State`) => `boolean` |

#### Returns

[`StateDeclaration`](README.md#statedeclaration)<`State`\>

#### Defined in

[stateDeclaration.ts:13](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/stateDeclaration.ts#L13)

___

### mapStateQuery

▸ **mapStateQuery**<`T`, `R`\>(`query`, `mapper`): [`StateQuery`](README.md#statequery)<`R`\>

#### Type parameters

| Name |
| :------ |
| `T` |
| `R` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`StateQuery`](README.md#statequery)<`T`\> |
| `mapper` | (`value`: `T`) => `R` |

#### Returns

[`StateQuery`](README.md#statequery)<`R`\>

#### Defined in

[stateQuery.ts:9](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/stateQuery.ts#L9)

___

### pipeStateMutations

▸ **pipeStateMutations**<`State`\>(`mutations`): [`StateMutation`](README.md#statemutation)<`State`\>

#### Type parameters

| Name |
| :------ |
| `State` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `mutations` | [`StateMutation`](README.md#statemutation)<`State`\>[] |

#### Returns

[`StateMutation`](README.md#statemutation)<`State`\>

#### Defined in

[stateMutation.ts:3](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/stateMutation.ts#L3)

___

### withQuery

▸ **withQuery**<`Event`, `Value`\>(`action`, `query`): `Observable`<[`Event`, `Value`]\>

#### Type parameters

| Name |
| :------ |
| `Event` |
| `Value` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `action` | `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> |
| `query` | [`StateQuery`](README.md#statequery)<`Value`\> |

#### Returns

`Observable`<[`Event`, `Value`]\>

#### Defined in

[stateUtils.ts:33](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/stateUtils.ts#L33)

___

### withStore

▸ **withStore**<`Event`, `State`\>(`action`, `store`): `Observable`<[`Event`, `State`]\>

#### Type parameters

| Name |
| :------ |
| `Event` |
| `State` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `action` | `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> |
| `store` | [`StateStore`](README.md#statestore)<`State`\> |

#### Returns

`Observable`<[`Event`, `State`]\>

#### Defined in

[stateUtils.ts:24](https://github.com/mnasyrov/rx-effects/blob/6dcd67c/packages/rx-effects/src/stateUtils.ts#L24)
