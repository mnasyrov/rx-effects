rx-effects

# rx-effects

## Table of contents

### Type aliases

- [Action](README.md#action)
- [Controller](README.md#controller)
- [Effect](README.md#effect)
- [EffectHandler](README.md#effecthandler)
- [EffectState](README.md#effectstate)
- [HandlerOptions](README.md#handleroptions)
- [Scope](README.md#scope)
- [StateDeclaration](README.md#statedeclaration)
- [StateFactory](README.md#statefactory)
- [StateMutation](README.md#statemutation)
- [StateQuery](README.md#statequery)
- [StateReader](README.md#statereader)
- [Store](README.md#store)

### Functions

- [createAction](README.md#createaction)
- [createEffect](README.md#createeffect)
- [createScope](README.md#createscope)
- [createStore](README.md#createstore)
- [declareState](README.md#declarestate)
- [handleAction](README.md#handleaction)
- [mapQuery](README.md#mapquery)
- [mergeQueries](README.md#mergequeries)
- [pipeStateMutations](README.md#pipestatemutations)

## Type aliases

### Action

Ƭ **Action**<`Event`\>: (`event`: `Event`) => `void` & `Event` extends `undefined` \| `void` ? (`event?`: `Event`) => `void` : (`event`: `Event`) => `void`

Action is an event emitter

**`field`** event$ - Observable for emitted events.

#### Type parameters

| Name    |
| :------ |
| `Event` |

#### Defined in

[action.ts:8](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/action.ts#L8)

---

### Controller

Ƭ **Controller**<`ControllerProps`\>: `Readonly`<{ `destroy`: () => `void` } & `ControllerProps`\>

Business logic controller

**`example`**

```ts
type LoggerController = Controller<{
  log: (message: string) => void;
}>;
```

#### Type parameters

| Name              | Type               |
| :---------------- | :----------------- |
| `ControllerProps` | extends `Object`{} |

#### Defined in

[controller.ts:14](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/controller.ts#L14)

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

[effect.ts:25](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/effect.ts#L25)

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

[effect.ts:7](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/effect.ts#L7)

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

[effect.ts:16](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/effect.ts#L16)

---

### HandlerOptions

Ƭ **HandlerOptions**<`ErrorType`\>: `Readonly`<`Object`\>

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `ErrorType` | `Error` |

#### Defined in

[effect.ts:11](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/effect.ts#L11)

---

### Scope

Ƭ **Scope**: [`Controller`](README.md#controller)<`Object`\>

#### Defined in

[scope.ts:9](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/scope.ts#L9)

---

### StateDeclaration

Ƭ **StateDeclaration**<`State`\>: `Readonly`<`Object`\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[stateDeclaration.ts:5](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/stateDeclaration.ts#L5)

---

### StateFactory

Ƭ **StateFactory**<`State`\>: (`values?`: `Partial`<`State`\>) => `State`

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Type declaration

▸ (`values?`): `State`

##### Parameters

| Name      | Type                |
| :-------- | :------------------ |
| `values?` | `Partial`<`State`\> |

##### Returns

`State`

#### Defined in

[stateDeclaration.ts:3](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/stateDeclaration.ts#L3)

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

[stateMutation.ts:1](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/stateMutation.ts#L1)

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

[stateQuery.ts:4](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/stateQuery.ts#L4)

---

### StateReader

Ƭ **StateReader**<`State`\>: [`StateQuery`](README.md#statequery)<`State`\> & { `query`: <R\>(`selector`: (`state`: `State`) => `R`, `compare?`: (`v1`: `R`, `v2`: `R`) => `boolean`) => [`StateQuery`](README.md#statequery)<`R`\> ; `select`: <R\>(`selector`: (`state`: `State`) => `R`, `compare?`: (`v1`: `R`, `v2`: `R`) => `boolean`) => `Observable`<`R`\> }

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[store.ts:7](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/store.ts#L7)

---

### Store

Ƭ **Store**<`State`\>: [`StateReader`](README.md#statereader)<`State`\> & [`Controller`](README.md#controller)<`Object`\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[store.ts:19](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/store.ts#L19)

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

[action.ts:15](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/action.ts#L15)

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

[effect.ts:38](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/effect.ts#L38)

---

### createScope

▸ **createScope**(): [`Scope`](README.md#scope)

#### Returns

[`Scope`](README.md#scope)

#### Defined in

[scope.ts:37](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/scope.ts#L37)

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

[store.ts:25](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/store.ts#L25)

---

### declareState

▸ **declareState**<`State`\>(`stateOrFactory`, `stateCompare?`): [`StateDeclaration`](README.md#statedeclaration)<`State`\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Parameters

| Name             | Type                                                          |
| :--------------- | :------------------------------------------------------------ |
| `stateOrFactory` | `State` \| [`StateFactory`](README.md#statefactory)<`State`\> |
| `stateCompare?`  | (`s1`: `State`, `s2`: `State`) => `boolean`                   |

#### Returns

[`StateDeclaration`](README.md#statedeclaration)<`State`\>

#### Defined in

[stateDeclaration.ts:11](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/stateDeclaration.ts#L11)

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

[handleAction.ts:5](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/handleAction.ts#L5)

---

### mapQuery

▸ **mapQuery**<`T`, `R`\>(`query`, `mapper`): [`StateQuery`](README.md#statequery)<`R`\>

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

[stateQuery.ts:9](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/stateQuery.ts#L9)

---

### mergeQueries

▸ **mergeQueries**<`Queries`, `Values`, `Result`\>(`queries`, `merger`): [`StateQuery`](README.md#statequery)<`Result`\>

#### Type parameters

| Name      | Type                                                                                        |
| :-------- | :------------------------------------------------------------------------------------------ |
| `Queries` | extends [`StateQuery`](README.md#statequery)<`unknown`\>[]                                  |
| `Values`  | extends { [K in string \| number \| symbol]: Queries[K] extends StateQuery<V\> ? V : never} |
| `Result`  | `Result`                                                                                    |

#### Parameters

| Name      | Type                             |
| :-------- | :------------------------------- |
| `queries` | `Queries`                        |
| `merger`  | (`values`: `Values`) => `Result` |

#### Returns

[`StateQuery`](README.md#statequery)<`Result`\>

#### Defined in

[stateQuery.ts:19](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/stateQuery.ts#L19)

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

[stateMutation.ts:3](https://github.com/mnasyrov/rx-effects/blob/21d97be/packages/rx-effects/src/stateMutation.ts#L3)
