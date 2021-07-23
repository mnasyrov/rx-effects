rx-effects

# rx-effects

## Table of contents

### Type aliases

- [Action](README.md#action)
- [Effect](README.md#effect)
- [EffectHandler](README.md#effecthandler)
- [EffectScope](README.md#effectscope)
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
- [createReduceStoreEffect](README.md#createreducestoreeffect)
- [createResetStoreEffect](README.md#createresetstoreeffect)
- [createStore](README.md#createstore)
- [declareState](README.md#declarestate)
- [mapStateQuery](README.md#mapstatequery)
- [pipeStateMutations](README.md#pipestatemutations)
- [withQuery](README.md#withquery)
- [withStore](README.md#withstore)

## Type aliases

### Action

Ƭ **Action**<`Event`\>: (`event`: `Event`) => `void` & `Event` extends `undefined` \| `void` ? (`event?`: `Event`) => `void` : (`event`: `Event`) => `void`

#### Type parameters

| Name    |
| :------ |
| `Event` |

#### Defined in

[action.ts:3](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/action.ts#L3)

---

### Effect

Ƭ **Effect**<`Event`, `Result`, `ErrorType`\>: `Object`

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `Event`     | `Event` |
| `Result`    | `void`  |
| `ErrorType` | `Error` |

#### Type declaration

| Name           | Type                                                                                                                                                                                                                          |
| :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `destroy`      | () => `void`                                                                                                                                                                                                                  |
| `done$`        | `Observable`<`Object`\>                                                                                                                                                                                                       |
| `error$`       | `Observable`<`Object`\>                                                                                                                                                                                                       |
| `final$`       | `Observable`<`Event`\>                                                                                                                                                                                                        |
| `handle`       | (`action`: [`Action`](README.md#action)<`Event`\>, `options?`: `undefined`) => `Subscription` & (`source$`: `Observable`<`Event`\>, `options?`: [`HandlerOptions`](README.md#handleroptions)<`ErrorType`\>) => `Subscription` |
| `pending`      | [`StateQuery`](README.md#statequery)<`boolean`\>                                                                                                                                                                              |
| `pendingCount` | [`StateQuery`](README.md#statequery)<`number`\>                                                                                                                                                                               |
| `result$`      | `Observable`<`Result`\>                                                                                                                                                                                                       |

#### Defined in

[effect.ts:12](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/effect.ts#L12)

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

[effect.ts:32](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/effect.ts#L32)

---

### EffectScope

Ƭ **EffectScope**: `Object`

#### Type declaration

| Name           | Type                                                                                                                                                                    |
| :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `add`          | (`teardown`: `TeardownLogic`) => `void`                                                                                                                                 |
| `createEffect` | <Event, Result, ErrorType\>(`handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>) => [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\> |
| `destroy`      | () => `void`                                                                                                                                                            |

#### Defined in

[effectScope.ts:4](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/effectScope.ts#L4)

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

[effect.ts:7](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/effect.ts#L7)

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

[stateDeclaration.ts:7](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/stateDeclaration.ts#L7)

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

[stateDeclaration.ts:3](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/stateDeclaration.ts#L3)

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

[stateMutation.ts:1](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/stateMutation.ts#L1)

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

[stateQuery.ts:4](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/stateQuery.ts#L4)

---

### StateReader

Ƭ **StateReader**<`State`\>: [`StateQuery`](README.md#statequery)<`State`\> & { `query`: <R\>(`selector`: (`state`: `State`) => `R`, `compare?`: (`v1`: `R`, `v2`: `R`) => `boolean`) => [`StateQuery`](README.md#statequery)<`R`\> ; `select`: <R\>(`selector`: (`state`: `State`) => `R`, `compare?`: (`v1`: `R`, `v2`: `R`) => `boolean`) => `Observable`<`R`\> }

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[store.ts:6](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/store.ts#L6)

---

### Store

Ƭ **Store**<`State`\>: [`StateReader`](README.md#statereader)<`State`\> & { `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\>) => `void` }

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[store.ts:18](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/store.ts#L18)

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

[action.ts:10](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/action.ts#L10)

---

### createEffect

▸ **createEffect**<`Event`, `Result`, `ErrorType`\>(`handler`, `scopeSubscriptions?`): [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `Event`     | `void`  |
| `Result`    | `void`  |
| `ErrorType` | `Error` |

#### Parameters

| Name                  | Type                                                           |
| :-------------------- | :------------------------------------------------------------- |
| `handler`             | [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\> |
| `scopeSubscriptions?` | `Subscription`                                                 |

#### Returns

[`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

#### Defined in

[effect.ts:36](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/effect.ts#L36)

---

### createEffectScope

▸ **createEffectScope**(): [`EffectScope`](README.md#effectscope)

#### Returns

[`EffectScope`](README.md#effectscope)

#### Defined in

[effectScope.ts:13](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/effectScope.ts#L13)

---

### createReduceStoreEffect

▸ **createReduceStoreEffect**<`Event`, `State`\>(`store`, `reducer`): [`Effect`](README.md#effect)<`Event`\>

#### Type parameters

| Name    |
| :------ |
| `Event` |
| `State` |

#### Parameters

| Name      | Type                                            |
| :-------- | :---------------------------------------------- |
| `store`   | [`Store`](README.md#store)<`State`\>            |
| `reducer` | (`state`: `State`, `event`: `Event`) => `State` |

#### Returns

[`Effect`](README.md#effect)<`Event`\>

#### Defined in

[stateEffects.ts:8](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/stateEffects.ts#L8)

---

### createResetStoreEffect

▸ **createResetStoreEffect**<`State`\>(`store`, `nextState`): [`Effect`](README.md#effect)<`void`\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Parameters

| Name        | Type                                 |
| :---------- | :----------------------------------- |
| `store`     | [`Store`](README.md#store)<`State`\> |
| `nextState` | `State`                              |

#### Returns

[`Effect`](README.md#effect)<`void`\>

#### Defined in

[stateEffects.ts:17](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/stateEffects.ts#L17)

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

[store.ts:23](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/store.ts#L23)

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

[stateDeclaration.ts:13](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/stateDeclaration.ts#L13)

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

[stateQuery.ts:9](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/stateQuery.ts#L9)

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

[stateMutation.ts:3](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/stateMutation.ts#L3)

---

### withQuery

▸ **withQuery**<`Event`, `Value`\>(`action`, `query`): `Observable`<[`Event`, `Value`]\>

#### Type parameters

| Name    |
| :------ |
| `Event` |
| `Value` |

#### Parameters

| Name     | Type                                                             |
| :------- | :--------------------------------------------------------------- |
| `action` | `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> |
| `query`  | [`StateQuery`](README.md#statequery)<`Value`\>                   |

#### Returns

`Observable`<[`Event`, `Value`]\>

#### Defined in

[stateEffects.ts:33](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/stateEffects.ts#L33)

---

### withStore

▸ **withStore**<`Event`, `State`\>(`action`, `store`): `Observable`<[`Event`, `State`]\>

#### Type parameters

| Name    |
| :------ |
| `Event` |
| `State` |

#### Parameters

| Name     | Type                                                             |
| :------- | :--------------------------------------------------------------- |
| `action` | `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> |
| `store`  | [`Store`](README.md#store)<`State`\>                             |

#### Returns

`Observable`<[`Event`, `State`]\>

#### Defined in

[stateEffects.ts:24](https://github.com/mnasyrov/rx-effects/blob/c58665a/packages/rx-effects/src/stateEffects.ts#L24)
