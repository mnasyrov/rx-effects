rx-effects

# rx-effects

## Table of contents

### Type aliases

- [Action](README.md#action)
- [Effect](README.md#effect)
- [EffectHandler](README.md#effecthandler)
- [EffectScope](README.md#effectscope)
- [EffectState](README.md#effectstate)
- [HandlerOptions](README.md#handleroptions)
- [StateDeclaration](README.md#statedeclaration)
- [StateFactory](README.md#statefactory)
- [StateMutation](README.md#statemutation)
- [StateQuery](README.md#statequery)
- [StateReader](README.md#statereader)
- [Store](README.md#store)

### Functions

- [createAction](README.md#createaction)
- [createEffect](README.md#createeffect)
- [createEffectScope](README.md#createeffectscope)
- [createStore](README.md#createstore)
- [declareState](README.md#declarestate)
- [handleAction](README.md#handleaction)
- [mapStateQuery](README.md#mapstatequery)
- [pipeStateMutations](README.md#pipestatemutations)

## Type aliases

### Action

Ƭ **Action**<`Event`\>: (`event`: `Event`) => `void` & `Event` extends `undefined` \| `void` ? (`event?`: `Event`) => `void` : (`event`: `Event`) => `void`

#### Type parameters

| Name    |
| :------ |
| `Event` |

#### Defined in

[action.ts:3](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/action.ts#L3)

---

### Effect

Ƭ **Effect**<`Event`, `Result`, `ErrorType`\>: [`EffectState`](README.md#effectstate)<`Event`, `Result`, `ErrorType`\> & { `destroy`: () => `void` ; `handle`: (`source`: [`Action`](README.md#action)<`Event`\> \| `Observable`<`Event`\>, `options?`: [`HandlerOptions`](README.md#handleroptions)<`ErrorType`\>) => `Subscription` }

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `Event`     | `Event` |
| `Result`    | `void`  |
| `ErrorType` | `Error` |

#### Defined in

[effect.ts:25](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/effect.ts#L25)

---

### EffectHandler

Ƭ **EffectHandler**<`Event`, `Result`\>: (`event`: `Event`) => `Result` \| `Promise`<`Result`\> \| `Observable`<`Result`\>

#### Type parameters

| Name     |
| :------- |
| `Event`  |
| `Result` |

#### Type declaration

▸ (`event`): `Result` \| `Promise`<`Result`\> \| `Observable`<`Result`\>

##### Parameters

| Name    | Type    |
| :------ | :------ |
| `event` | `Event` |

##### Returns

`Result` \| `Promise`<`Result`\> \| `Observable`<`Result`\>

#### Defined in

[effect.ts:7](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/effect.ts#L7)

---

### EffectScope

Ƭ **EffectScope**: `Object`

#### Type declaration

| Name           | Type                                                                                                                                                                                                                                                                                                                        |
| :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `add`          | (`teardown`: `TeardownLogic`) => `void`                                                                                                                                                                                                                                                                                     |
| `createEffect` | <Event, Result, ErrorType\>(`handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>) => [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>                                                                                                                                                     |
| `destroy`      | () => `void`                                                                                                                                                                                                                                                                                                                |
| `handleAction` | <Event, Result, ErrorType\>(`source`: `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\>, `handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: [`HandlerOptions`](README.md#handleroptions)<`ErrorType`\>) => [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\> |

#### Defined in

[effectScope.ts:6](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/effectScope.ts#L6)

---

### EffectState

Ƭ **EffectState**<`Event`, `Result`, `ErrorType`\>: `Object`

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `Event`     | `Event` |
| `Result`    | `void`  |
| `ErrorType` | `Error` |

#### Type declaration

| Name           | Type                                             |
| :------------- | :----------------------------------------------- |
| `done$`        | `Observable`<`Object`\>                          |
| `error$`       | `Observable`<`Object`\>                          |
| `final$`       | `Observable`<`Event`\>                           |
| `pending`      | [`StateQuery`](README.md#statequery)<`boolean`\> |
| `pendingCount` | [`StateQuery`](README.md#statequery)<`number`\>  |
| `result$`      | `Observable`<`Result`\>                          |

#### Defined in

[effect.ts:16](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/effect.ts#L16)

---

### HandlerOptions

Ƭ **HandlerOptions**<`ErrorType`\>: `Object`

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `ErrorType` | `Error` |

#### Type declaration

| Name                 | Type                             |
| :------------------- | :------------------------------- |
| `onSourceCompleted?` | () => `void`                     |
| `onSourceFailed?`    | (`error`: `ErrorType`) => `void` |

#### Defined in

[effect.ts:11](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/effect.ts#L11)

---

### StateDeclaration

Ƭ **StateDeclaration**<`State`\>: `Object`

#### Type parameters

| Name    | Type                                   |
| :------ | :------------------------------------- |
| `State` | extends `Record`<`string`, `unknown`\> |

#### Type declaration

| Name           | Type                                                               |
| :------------- | :----------------------------------------------------------------- |
| `createState`  | [`StateFactory`](README.md#statefactory)<`State`\>                 |
| `createStore`  | (`initialState?`: `State`) => [`Store`](README.md#store)<`State`\> |
| `initialState` | `State`                                                            |

#### Defined in

[stateDeclaration.ts:7](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/stateDeclaration.ts#L7)

---

### StateFactory

Ƭ **StateFactory**<`State`\>: (`values?`: `Partial`<`State`\>) => `State`

#### Type parameters

| Name    | Type                                   |
| :------ | :------------------------------------- |
| `State` | extends `Record`<`string`, `unknown`\> |

#### Type declaration

▸ (`values?`): `State`

##### Parameters

| Name      | Type                |
| :-------- | :------------------ |
| `values?` | `Partial`<`State`\> |

##### Returns

`State`

#### Defined in

[stateDeclaration.ts:3](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/stateDeclaration.ts#L3)

---

### StateMutation

Ƭ **StateMutation**<`State`\>: (`state`: `State`) => `State`

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Type declaration

▸ (`state`): `State`

##### Parameters

| Name    | Type    |
| :------ | :------ |
| `state` | `State` |

##### Returns

`State`

#### Defined in

[stateMutation.ts:1](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/stateMutation.ts#L1)

---

### StateQuery

Ƭ **StateQuery**<`T`\>: `Object`

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Type declaration

| Name     | Type               |
| :------- | :----------------- |
| `get`    | () => `T`          |
| `value$` | `Observable`<`T`\> |

#### Defined in

[stateQuery.ts:4](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/stateQuery.ts#L4)

---

### StateReader

Ƭ **StateReader**<`State`\>: [`StateQuery`](README.md#statequery)<`State`\> & { `query`: <R\>(`selector`: (`state`: `State`) => `R`, `compare?`: (`v1`: `R`, `v2`: `R`) => `boolean`) => [`StateQuery`](README.md#statequery)<`R`\> ; `select`: <R\>(`selector`: (`state`: `State`) => `R`, `compare?`: (`v1`: `R`, `v2`: `R`) => `boolean`) => `Observable`<`R`\> }

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[store.ts:6](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/store.ts#L6)

---

### Store

Ƭ **Store**<`State`\>: [`StateReader`](README.md#statereader)<`State`\> & { `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\>) => `void` }

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[store.ts:18](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/store.ts#L18)

## Functions

### createAction

▸ **createAction**<`Event`\>(): [`Action`](README.md#action)<`Event`\>

#### Type parameters

| Name    | Type   |
| :------ | :----- |
| `Event` | `void` |

#### Returns

[`Action`](README.md#action)<`Event`\>

#### Defined in

[action.ts:10](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/action.ts#L10)

---

### createEffect

▸ **createEffect**<`Event`, `Result`, `ErrorType`\>(`handler`): [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `Event`     | `void`  |
| `Result`    | `void`  |
| `ErrorType` | `Error` |

#### Parameters

| Name      | Type                                                           |
| :-------- | :------------------------------------------------------------- |
| `handler` | [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\> |

#### Returns

[`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

#### Defined in

[effect.ts:38](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/effect.ts#L38)

---

### createEffectScope

▸ **createEffectScope**(): [`EffectScope`](README.md#effectscope)

#### Returns

[`EffectScope`](README.md#effectscope)

#### Defined in

[effectScope.ts:21](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/effectScope.ts#L21)

---

### createStore

▸ **createStore**<`State`\>(`initialState`, `stateCompare?`): [`Store`](README.md#store)<`State`\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Parameters

| Name           | Type                                        |
| :------------- | :------------------------------------------ |
| `initialState` | `State`                                     |
| `stateCompare` | (`s1`: `State`, `s2`: `State`) => `boolean` |

#### Returns

[`Store`](README.md#store)<`State`\>

#### Defined in

[store.ts:23](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/store.ts#L23)

---

### declareState

▸ **declareState**<`State`\>(`stateFactory`, `stateCompare?`): [`StateDeclaration`](README.md#statedeclaration)<`State`\>

#### Type parameters

| Name    | Type                                   |
| :------ | :------------------------------------- |
| `State` | extends `Record`<`string`, `unknown`\> |

#### Parameters

| Name            | Type                                               |
| :-------------- | :------------------------------------------------- |
| `stateFactory`  | [`StateFactory`](README.md#statefactory)<`State`\> |
| `stateCompare?` | (`s1`: `State`, `s2`: `State`) => `boolean`        |

#### Returns

[`StateDeclaration`](README.md#statedeclaration)<`State`\>

#### Defined in

[stateDeclaration.ts:13](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/stateDeclaration.ts#L13)

---

### handleAction

▸ **handleAction**<`Event`, `Result`, `ErrorType`\>(`source`, `handler`, `options?`): [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `Event`     | `Event` |
| `Result`    | `void`  |
| `ErrorType` | `Error` |

#### Parameters

| Name       | Type                                                             |
| :--------- | :--------------------------------------------------------------- |
| `source`   | `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> |
| `handler`  | [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>   |
| `options?` | [`HandlerOptions`](README.md#handleroptions)<`ErrorType`\>       |

#### Returns

[`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

#### Defined in

[handleAction.ts:5](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/handleAction.ts#L5)

---

### mapStateQuery

▸ **mapStateQuery**<`T`, `R`\>(`query`, `mapper`): [`StateQuery`](README.md#statequery)<`R`\>

#### Type parameters

| Name |
| :--- |
| `T`  |
| `R`  |

#### Parameters

| Name     | Type                                       |
| :------- | :----------------------------------------- |
| `query`  | [`StateQuery`](README.md#statequery)<`T`\> |
| `mapper` | (`value`: `T`) => `R`                      |

#### Returns

[`StateQuery`](README.md#statequery)<`R`\>

#### Defined in

[stateQuery.ts:9](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/stateQuery.ts#L9)

---

### pipeStateMutations

▸ **pipeStateMutations**<`State`\>(`mutations`): [`StateMutation`](README.md#statemutation)<`State`\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Parameters

| Name        | Type                                                   |
| :---------- | :----------------------------------------------------- |
| `mutations` | [`StateMutation`](README.md#statemutation)<`State`\>[] |

#### Returns

[`StateMutation`](README.md#statemutation)<`State`\>

#### Defined in

[stateMutation.ts:3](https://github.com/mnasyrov/rx-effects/blob/22056a0/packages/rx-effects/src/stateMutation.ts#L3)
