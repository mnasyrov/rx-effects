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
- [StateQueryOptions](README.md#statequeryoptions)
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

**`example`**

```ts
// Create the action
const submitForm = createAction<{ login: string; password: string }>();

// Call the action
submitForm({ login: 'foo', password: 'bar' });

// Handle action's events
submitForm.even$.subscribe((formData) => {
  // Process the formData
});
```

#### Type parameters

| Name    |
| :------ |
| `Event` |

#### Defined in

[action.ts:22](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/action.ts#L22)

---

### Controller

Ƭ **Controller**<`ControllerProps`\>: `Readonly`<{ `destroy`: () => `void` } & `ControllerProps`\>

Effects and business logic controller.

Implementation of the controller must provide `destroy()` method. It should
be used for closing subscriptions and disposing resources.

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

[controller.ts:17](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/controller.ts#L17)

---

### Effect

Ƭ **Effect**<`Event`, `Result`, `ErrorType`\>: [`EffectState`](README.md#effectstate)<`Event`, `Result`, `ErrorType`\> & { `destroy`: () => `void` ; `handle`: (`source`: [`Action`](README.md#action)<`Event`\> \| `Observable`<`Event`\>, `options?`: [`HandlerOptions`](README.md#handleroptions)<`ErrorType`\>) => `Subscription` }

Effect encapsulates a handler for Action or Observable.

It provides the state of execution results, which can be used to construct
a graph of business logic.

Effect collects all internal subscriptions, and provides `destroy()` methods
unsubscribe from them and deactivate the effect.

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `Event`     | `Event` |
| `Result`    | `void`  |
| `ErrorType` | `Error` |

#### Defined in

[effect.ts:56](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/effect.ts#L56)

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

Handler for an event. It can be asynchronous.

##### Parameters

| Name    | Type    |
| :------ | :------ |
| `event` | `Event` |

##### Returns

`Result` \| `Promise`<`Result`\> \| `Observable`<`Result`\>

#### Defined in

[effect.ts:12](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/effect.ts#L12)

---

### EffectState

Ƭ **EffectState**<`Event`, `Result`, `ErrorType`\>: `Object`

Details about performing the effect.

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `Event`     | `Event` |
| `Result`    | `void`  |
| `ErrorType` | `Error` |

#### Type declaration

| Name           | Type                                             | Description                                                                                        |
| :------------- | :----------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `done$`        | `Observable`<`Object`\>                          | `done$` provides a source event and a result of successful execution of the handler                |
| `error$`       | `Observable`<`Object`\>                          | `done$` provides a source event and an error if the handler fails                                  |
| `final$`       | `Observable`<`Event`\>                           | `final$` provides a source event after execution of the handler, for both success and error result |
| `pending`      | [`StateQuery`](README.md#statequery)<`boolean`\> | Provides `true` if there is any execution of the handler in progress                               |
| `pendingCount` | [`StateQuery`](README.md#statequery)<`number`\>  | Provides a count of the handler in progress                                                        |
| `result$`      | `Observable`<`Result`\>                          | `result$` provides a result of successful execution of the handler                                 |

#### Defined in

[effect.ts:27](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/effect.ts#L27)

---

### HandlerOptions

Ƭ **HandlerOptions**<`ErrorType`\>: `Readonly`<`Object`\>

Options for handling an action or observable.

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `ErrorType` | `Error` |

#### Defined in

[effect.ts:19](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/effect.ts#L19)

---

### Scope

Ƭ **Scope**: [`Controller`](README.md#controller)<`Object`\>

A controller-like boundary for effects and business logic.

It collects all subscriptions which are made by child entities and provides
`destroy()` method to unsubscribe from them.

#### Defined in

[scope.ts:16](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/scope.ts#L16)

---

### StateDeclaration

Ƭ **StateDeclaration**<`State`\>: `Readonly`<`Object`\>

Declaration of a state.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[stateDeclaration.ts:12](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/stateDeclaration.ts#L12)

---

### StateFactory

Ƭ **StateFactory**<`State`\>: (`values?`: `Partial`<`State`\>) => `State`

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Type declaration

▸ (`values?`): `State`

Factory which creates a state. It can take optional values to modify the
state.

##### Parameters

| Name      | Type                |
| :-------- | :------------------ |
| `values?` | `Partial`<`State`\> |

##### Returns

`State`

#### Defined in

[stateDeclaration.ts:7](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/stateDeclaration.ts#L7)

---

### StateMutation

Ƭ **StateMutation**<`State`\>: (`state`: `State`) => `State`

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Type declaration

▸ (`state`): `State`

This function mutates the state.

It is recommended to return a new state or the previous one.

Actually, the function can change the state in place, but it is responsible
for a developer to provide `stateCompare` function to the store which handles
the changes.

For making changes use a currying function to provide arguments:

```ts
const addPizzaToCart =
  (name: string): StateMutation<Array<string>> =>
  (state) =>
    [...state, name];
```

##### Parameters

| Name    | Type    | Description      |
| :------ | :------ | :--------------- |
| `state` | `State` | a previous state |

##### Returns

`State`

a next state

#### Defined in

[stateMutation.ts:19](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/stateMutation.ts#L19)

---

### StateQuery

Ƭ **StateQuery**<`T`\>: `Object`

Provider for a value of a state.

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Type declaration

| Name     | Type               | Description                     |
| :------- | :----------------- | :------------------------------ |
| `get`    | () => `T`          | -                               |
| `value$` | `Observable`<`T`\> | `Observable` for value changes. |

#### Defined in

[stateQuery.ts:8](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/stateQuery.ts#L8)

---

### StateQueryOptions

Ƭ **StateQueryOptions**<`T`, `K`\>: `Object`

Options for processing the query result

**`property`** distinct Enables distinct results

**`property`** distinct.comparator Custom comparator for values. Strict equality `===` is used by default.

**`property`** distinct.keySelector Getter for keys of values to compare. Values itself are used for comparing by default.

#### Type parameters

| Name |
| :--- |
| `T`  |
| `K`  |

#### Type declaration

| Name        | Type                                                                                                                   |
| :---------- | :--------------------------------------------------------------------------------------------------------------------- |
| `distinct?` | `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } |

#### Defined in

[stateQuery.ts:23](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/stateQuery.ts#L23)

---

### StateReader

Ƭ **StateReader**<`State`\>: [`StateQuery`](README.md#statequery)<`State`\> & { `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: [`StateQueryOptions`](README.md#statequeryoptions)<`R`, `K`\>) => [`StateQuery`](README.md#statequery)<`R`\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: [`StateQueryOptions`](README.md#statequeryoptions)<`R`, `K`\>) => `Observable`<`R`\> }

Read-only type of the state store.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[store.ts:10](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/store.ts#L10)

---

### Store

Ƭ **Store**<`State`\>: [`StateReader`](README.md#statereader)<`State`\> & [`Controller`](README.md#controller)<`Object`\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[store.ts:42](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/store.ts#L42)

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

[action.ts:29](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/action.ts#L29)

---

### createEffect

▸ **createEffect**<`Event`, `Result`, `ErrorType`\>(`handler`): [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

Creates `Effect` from the provided handler.

**`example`**

```ts
const sumEffect = createEffect<{ a: number; b: number }, number>((event) => {
  return a + b;
});
```

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

[effect.ts:83](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/effect.ts#L83)

---

### createScope

▸ **createScope**(): [`Scope`](README.md#scope)

Creates `Scope` instance.

#### Returns

[`Scope`](README.md#scope)

#### Defined in

[scope.ts:68](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/scope.ts#L68)

---

### createStore

▸ **createStore**<`State`\>(`initialState`, `stateComparator?`): [`Store`](README.md#store)<`State`\>

Creates the state store.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Parameters

| Name              | Type                                                      | Description                                                   |
| :---------------- | :-------------------------------------------------------- | :------------------------------------------------------------ |
| `initialState`    | `State`                                                   | an initial state                                              |
| `stateComparator` | (`prevState`: `State`, `nextState`: `State`) => `boolean` | a comparator for detecting changes between old and new states |

#### Returns

[`Store`](README.md#store)<`State`\>

#### Defined in

[store.ts:58](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/store.ts#L58)

---

### declareState

▸ **declareState**<`State`\>(`stateOrFactory`, `stateCompare?`): [`StateDeclaration`](README.md#statedeclaration)<`State`\>

Declares the state.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Parameters

| Name             | Type                                                          | Description                                                   |
| :--------------- | :------------------------------------------------------------ | :------------------------------------------------------------ |
| `stateOrFactory` | `State` \| [`StateFactory`](README.md#statefactory)<`State`\> | an initial state or a factory for the initial state           |
| `stateCompare?`  | (`prevState`: `State`, `nextState`: `State`) => `boolean`     | a comparator for detecting changes between old and new states |

#### Returns

[`StateDeclaration`](README.md#statedeclaration)<`State`\>

#### Defined in

[stateDeclaration.ts:29](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/stateDeclaration.ts#L29)

---

### handleAction

▸ **handleAction**<`Event`, `Result`, `ErrorType`\>(`source`, `handler`, `options?`): [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

This helper creates `Effect` from `handler` and subscribes it to `source`.

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

[handleAction.ts:8](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/handleAction.ts#L8)

---

### mapQuery

▸ **mapQuery**<`T`, `R`, `K`\>(`query`, `mapper`, `options?`): [`StateQuery`](README.md#statequery)<`R`\>

Returns a new `StateQuery` which maps a source value by the provided mapping
function.

#### Type parameters

| Name | Type |
| :--- | :--- |
| `T`  | `T`  |
| `R`  | `R`  |
| `K`  | `R`  |

#### Parameters

| Name       | Type                                                          | Description                             |
| :--------- | :------------------------------------------------------------ | :-------------------------------------- |
| `query`    | [`StateQuery`](README.md#statequery)<`T`\>                    | source query                            |
| `mapper`   | (`value`: `T`) => `R`                                         | value mapper                            |
| `options?` | [`StateQueryOptions`](README.md#statequeryoptions)<`R`, `K`\> | options for processing the result value |

#### Returns

[`StateQuery`](README.md#statequery)<`R`\>

#### Defined in

[stateQuery.ts:40](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/stateQuery.ts#L40)

---

### mergeQueries

▸ **mergeQueries**<`Values`, `Result`, `ResultKey`\>(`queries`, `merger`, `options?`): [`StateQuery`](README.md#statequery)<`Result`\>

Returns a new `StateQuery` which takes the latest values from source queries
and merges them into a single value.

#### Type parameters

| Name        | Type                |
| :---------- | :------------------ |
| `Values`    | extends `unknown`[] |
| `Result`    | `Result`            |
| `ResultKey` | `Result`            |

#### Parameters

| Name       | Type                                                                       | Description                             |
| :--------- | :------------------------------------------------------------------------- | :-------------------------------------- |
| `queries`  | [...{ [K in keyof Values]: StateQuery<Values[K]\>}]                        | source queries                          |
| `merger`   | (...`values`: `Values`) => `Result`                                        | value merger                            |
| `options?` | [`StateQueryOptions`](README.md#statequeryoptions)<`Result`, `ResultKey`\> | options for processing the result value |

#### Returns

[`StateQuery`](README.md#statequery)<`Result`\>

#### Defined in

[stateQuery.ts:63](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/stateQuery.ts#L63)

---

### pipeStateMutations

▸ **pipeStateMutations**<`State`\>(`mutations`): [`StateMutation`](README.md#statemutation)<`State`\>

Returns a mutation which applies all provided mutations for a state.

You can use this helper to apply multiple changes at the same time.

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

[stateMutation.ts:26](https://github.com/mnasyrov/rx-effects/blob/17721af/packages/rx-effects/src/stateMutation.ts#L26)
