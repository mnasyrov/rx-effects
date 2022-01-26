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
- [StateDeclarationOptions](README.md#statedeclarationoptions)
- [StateFactory](README.md#statefactory)
- [StateMutation](README.md#statemutation)
- [StateMutationMetadata](README.md#statemutationmetadata)
- [StateMutations](README.md#statemutations)
- [StateQuery](README.md#statequery)
- [StateQueryOptions](README.md#statequeryoptions)
- [StateReader](README.md#statereader)
- [Store](README.md#store)
- [StoreAction](README.md#storeaction)
- [StoreActions](README.md#storeactions)
- [StoreActionsFactory](README.md#storeactionsfactory)
- [StoreEvent](README.md#storeevent)
- [StoreExtension](README.md#storeextension)
- [StoreOptions](README.md#storeoptions)

### Functions

- [OBJECT_COMPARATOR](README.md#object_comparator)
- [createAction](README.md#createaction)
- [createEffect](README.md#createeffect)
- [createScope](README.md#createscope)
- [createStore](README.md#createstore)
- [createStoreActions](README.md#createstoreactions)
- [createStoreLoggerExtension](README.md#createstoreloggerextension)
- [declareState](README.md#declarestate)
- [handleAction](README.md#handleaction)
- [mapQuery](README.md#mapquery)
- [mergeQueries](README.md#mergequeries)
- [pipeStateMutations](README.md#pipestatemutations)
- [registerStoreExtension](README.md#registerstoreextension)

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

[packages/rx-effects/src/action.ts:22](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/action.ts#L22)

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

| Name              | Type                  |
| :---------------- | :-------------------- |
| `ControllerProps` | extends `Object` = {} |

#### Defined in

[packages/rx-effects/src/controller.ts:16](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/controller.ts#L16)

---

### Effect

Ƭ **Effect**<`Event`, `Result`, `ErrorType`\>: [`EffectState`](README.md#effectstate)<`Event`, `Result`, `ErrorType`\> & { `destroy`: () => `void` ; `handle`: (`source`: [`Action`](README.md#action)<`Event`\> \| `Observable`<`Event`\>, `options?`: `Readonly`<{ `onSourceCompleted?`: () => `void` ; `onSourceFailed?`: (`error`: `ErrorType`) => `void` }\>) => `Subscription` }

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

[packages/rx-effects/src/effect.ts:56](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/effect.ts#L56)

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

**`result`** a result, Promise or Observable

##### Parameters

| Name    | Type    |
| :------ | :------ |
| `event` | `Event` |

##### Returns

`Result` \| `Promise`<`Result`\> \| `Observable`<`Result`\>

#### Defined in

[packages/rx-effects/src/effect.ts:12](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/effect.ts#L12)

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

| Name           | Type                                                       | Description                                                                                        |
| :------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `done$`        | `Observable`<{ `event`: `Event` ; `result`: `Result` }\>   | `done$` provides a source event and a result of successful execution of the handler                |
| `error$`       | `Observable`<{ `error`: `ErrorType` ; `event`: `Event` }\> | `done$` provides a source event and an error if the handler fails                                  |
| `final$`       | `Observable`<`Event`\>                                     | `final$` provides a source event after execution of the handler, for both success and error result |
| `pending`      | [`StateQuery`](README.md#statequery)<`boolean`\>           | Provides `true` if there is any execution of the handler in progress                               |
| `pendingCount` | [`StateQuery`](README.md#statequery)<`number`\>            | Provides a count of the handler in progress                                                        |
| `result$`      | `Observable`<`Result`\>                                    | `result$` provides a result of successful execution of the handler                                 |

#### Defined in

[packages/rx-effects/src/effect.ts:27](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/effect.ts#L27)

---

### HandlerOptions

Ƭ **HandlerOptions**<`ErrorType`\>: `Readonly`<{ `onSourceCompleted?`: () => `void` ; `onSourceFailed?`: (`error`: `ErrorType`) => `void` }\>

Options for handling an action or observable.

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `ErrorType` | `Error` |

#### Defined in

[packages/rx-effects/src/effect.ts:19](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/effect.ts#L19)

---

### Scope

Ƭ **Scope**: [`Controller`](README.md#controller)<{ `add`: (`teardown`: `TeardownLogic`) => `void` ; `createController`: <ControllerProps\>(`factory`: () => `Readonly`<{ `destroy`: () => `void` } & `ControllerProps`\>) => `Readonly`<{ `destroy`: () => `void` } & `ControllerProps`\> ; `createDeclaredStore`: <State\>(`stateDeclaration`: `Readonly`<{ `createState`: [`StateFactory`](README.md#statefactory)<`State`\> ; `initialState`: `State` ; `name?`: `string` ; `createStore`: (`initialState?`: `Partial`<`State`\>) => [`Store`](README.md#store)<`State`\> ; `createStoreActions`: <Mutations\>(`store`: [`Store`](README.md#store)<`State`\>, `mutations`: `Mutations`) => [`StoreActions`](README.md#storeactions)<`State`, `Mutations`\><Mutations\>(`mutations`: `Mutations`) => [`StoreActionsFactory`](README.md#storeactionsfactory)<`State`, `Mutations`\> }\>, `initialState?`: `Partial`<`State`\>) => [`Store`](README.md#store)<`State`\> ; `createEffect`: <Event, Result, ErrorType\>(`handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>) => [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\> ; `createStore`: <State\>(`initialState`: `State`, `options?`: `Readonly`<{ `internal?`: `boolean` ; `name?`: `string` ; `stateComparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` }\>) => [`Store`](README.md#store)<`State`\> ; `handleAction`: <Event, Result, ErrorType\>(`source`: `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\>, `handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: `Readonly`<{ `onSourceCompleted?`: () => `void` ; `onSourceFailed?`: (`error`: `ErrorType`) => `void` }\>) => [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\> }\>

A controller-like boundary for effects and business logic.

It collects all subscriptions which are made by child entities and provides
`destroy()` method to unsubscribe from them.

#### Defined in

[packages/rx-effects/src/scope.ts:15](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/scope.ts#L15)

---

### StateDeclaration

Ƭ **StateDeclaration**<`State`\>: `Readonly`<{ `createState`: [`StateFactory`](README.md#statefactory)<`State`\> ; `initialState`: `State` ; `name?`: `string` ; `createStore`: (`initialState?`: `Partial`<`State`\>) => [`Store`](README.md#store)<`State`\> ; `createStoreActions`: <Mutations\>(`store`: [`Store`](README.md#store)<`State`\>, `mutations`: `Mutations`) => [`StoreActions`](README.md#storeactions)<`State`, `Mutations`\><Mutations\>(`mutations`: `Mutations`) => [`StoreActionsFactory`](README.md#storeactionsfactory)<`State`, `Mutations`\> }\>

Declaration of a state.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/stateDeclaration.ts:18](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/stateDeclaration.ts#L18)

---

### StateDeclarationOptions

Ƭ **StateDeclarationOptions**<`State`\>: `Readonly`<{ `internal?`: `boolean` ; `name?`: `string` ; `stateComparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` }\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/stateDeclaration.ts:42](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/stateDeclaration.ts#L42)

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

[packages/rx-effects/src/stateDeclaration.ts:13](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/stateDeclaration.ts#L13)

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

[packages/rx-effects/src/stateMutation.ts:19](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/stateMutation.ts#L19)

---

### StateMutationMetadata

Ƭ **StateMutationMetadata**: `Readonly`<{ `name?`: `string` }\>

#### Defined in

[packages/rx-effects/src/storeMetadata.ts:7](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/storeMetadata.ts#L7)

---

### StateMutations

Ƭ **StateMutations**<`State`\>: `Readonly`<`Record`<`string`, (...`args`: `any`[]) => [`StateMutation`](README.md#statemutation)<`State`\>\>\>

A record of state mutations.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/stateMutation.ts:24](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/stateMutation.ts#L24)

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
| `value$` | `Observable`<`T`\> | `Observable` for value changes. |
| `get`    | () => `T`          | Returns the value of a state    |

#### Defined in

[packages/rx-effects/src/stateQuery.ts:9](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/stateQuery.ts#L9)

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

[packages/rx-effects/src/stateQuery.ts:24](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/stateQuery.ts#L24)

---

### StateReader

Ƭ **StateReader**<`State`\>: [`StateQuery`](README.md#statequery)<`State`\> & { `id`: `number` ; `name?`: `string` ; `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: [`StateQueryOptions`](README.md#statequeryoptions)<`R`, `K`\>) => [`StateQuery`](README.md#statequery)<`R`\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: [`StateQueryOptions`](README.md#statequeryoptions)<`R`, `K`\>) => `Observable`<`R`\> }

Read-only type of the state store.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/store.ts:14](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/store.ts#L14)

---

### Store

Ƭ **Store**<`State`\>: [`StateReader`](README.md#statereader)<`State`\> & [`Controller`](README.md#controller)<{ `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| readonly (`undefined` \| `null` \| `false` \| [`StateMutation`](README.md#statemutation)<`State`\>)[]) => `void` }\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/store.ts:49](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/store.ts#L49)

---

### StoreAction

Ƭ **StoreAction**<`Args`\>: (...`args`: `Args`) => `void`

#### Type parameters

| Name   | Type                |
| :----- | :------------------ |
| `Args` | extends `unknown`[] |

#### Type declaration

▸ (...`args`): `void`

Store's action for changing its state

##### Parameters

| Name      | Type   |
| :-------- | :----- |
| `...args` | `Args` |

##### Returns

`void`

#### Defined in

[packages/rx-effects/src/storeActions.ts:6](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/storeActions.ts#L6)

---

### StoreActions

Ƭ **StoreActions**<`State`, `Mutations`\>: { [K in keyof Mutations]: StoreAction<Parameters<Mutations[K]\>\> }

Record of store actions

#### Type parameters

| Name        | Type                                                           |
| :---------- | :------------------------------------------------------------- |
| `State`     | `State`                                                        |
| `Mutations` | extends [`StateMutations`](README.md#statemutations)<`State`\> |

#### Defined in

[packages/rx-effects/src/storeActions.ts:9](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/storeActions.ts#L9)

---

### StoreActionsFactory

Ƭ **StoreActionsFactory**<`State`, `Mutations`\>: (`store`: [`Store`](README.md#store)<`State`\>) => [`StoreActions`](README.md#storeactions)<`State`, `Mutations`\>

#### Type parameters

| Name        | Type                                                           |
| :---------- | :------------------------------------------------------------- |
| `State`     | `State`                                                        |
| `Mutations` | extends [`StateMutations`](README.md#statemutations)<`State`\> |

#### Type declaration

▸ (`store`): [`StoreActions`](README.md#storeactions)<`State`, `Mutations`\>

##### Parameters

| Name    | Type                                 |
| :------ | :----------------------------------- |
| `store` | [`Store`](README.md#store)<`State`\> |

##### Returns

[`StoreActions`](README.md#storeactions)<`State`, `Mutations`\>

#### Defined in

[packages/rx-effects/src/storeActions.ts:13](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/storeActions.ts#L13)

---

### StoreEvent

Ƭ **StoreEvent**<`State`\>: { `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"created"` } \| { `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"destroyed"` } \| { `mutation`: [`StateMutation`](README.md#statemutation)<`State`\> ; `nextState`: `State` ; `prevState`: `State` ; `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"mutation"` } \| { `nextState`: `State` ; `prevState`: `State` ; `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"updated"` }

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/storeEvents.ts:5](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/storeEvents.ts#L5)

---

### StoreExtension

Ƭ **StoreExtension**<`State`\>: (`api`: `StoreExtensionApi`) => { `onStoreEvent?`: (`event`: [`StoreEvent`](README.md#storeevent)<`State`\>) => `void` }

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Type declaration

▸ (`api`): `Object`

##### Parameters

| Name  | Type                |
| :---- | :------------------ |
| `api` | `StoreExtensionApi` |

##### Returns

`Object`

| Name            | Type                                                                |
| :-------------- | :------------------------------------------------------------------ |
| `onStoreEvent?` | (`event`: [`StoreEvent`](README.md#storeevent)<`State`\>) => `void` |

#### Defined in

[packages/rx-effects/src/storeExtensions.ts:9](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/storeExtensions.ts#L9)

---

### StoreOptions

Ƭ **StoreOptions**<`State`\>: `Readonly`<{ `internal?`: `boolean` ; `name?`: `string` ; `stateComparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` }\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/store.ts:66](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/store.ts#L66)

## Functions

### OBJECT_COMPARATOR

▸ `Const` **OBJECT_COMPARATOR**(`objA`, `objB`): `boolean`

Makes shallow comparison of two objects.

#### Parameters

| Name   | Type                           |
| :----- | :----------------------------- |
| `objA` | `Record`<`string`, `unknown`\> |
| `objB` | `Record`<`string`, `unknown`\> |

#### Returns

`boolean`

#### Defined in

[packages/rx-effects/src/utils.ts:8](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/utils.ts#L8)

---

### createAction

▸ **createAction**<`Event`\>(): [`Action`](README.md#action)<`Event`\>

#### Type parameters

| Name    | Type   |
| :------ | :----- |
| `Event` | `void` |

#### Returns

[`Action`](README.md#action)<`Event`\>

#### Defined in

[packages/rx-effects/src/action.ts:29](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/action.ts#L29)

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

[packages/rx-effects/src/effect.ts:83](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/effect.ts#L83)

---

### createScope

▸ **createScope**(): [`Scope`](README.md#scope)

Creates `Scope` instance.

#### Returns

[`Scope`](README.md#scope)

#### Defined in

[packages/rx-effects/src/scope.ts:70](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/scope.ts#L70)

---

### createStore

▸ **createStore**<`State`\>(`initialState`, `options?`): [`Store`](README.md#store)<`State`\>

Creates the state store.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Parameters

| Name           | Type                                                                                                                                        | Description              |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------- |
| `initialState` | `State`                                                                                                                                     | Initial state            |
| `options?`     | `Readonly`<{ `internal?`: `boolean` ; `name?`: `string` ; `stateComparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` }\> | Parameters for the store |

#### Returns

[`Store`](README.md#store)<`State`\>

#### Defined in

[packages/rx-effects/src/store.ts:82](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/store.ts#L82)

---

### createStoreActions

▸ **createStoreActions**<`State`, `Mutations`\>(`store`, `mutations`): [`StoreActions`](README.md#storeactions)<`State`, `Mutations`\>

Creates store actions for the store by state mutations

#### Type parameters

| Name        | Type                                                                                                                   |
| :---------- | :--------------------------------------------------------------------------------------------------------------------- |
| `State`     | `State`                                                                                                                |
| `Mutations` | extends `Readonly`<`Record`<`string`, (...`args`: `any`[]) => [`StateMutation`](README.md#statemutation)<`State`\>\>\> |

#### Parameters

| Name        | Type                                 |
| :---------- | :----------------------------------- |
| `store`     | [`Store`](README.md#store)<`State`\> |
| `mutations` | `Mutations`                          |

#### Returns

[`StoreActions`](README.md#storeactions)<`State`, `Mutations`\>

#### Defined in

[packages/rx-effects/src/storeActions.ts:19](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/storeActions.ts#L19)

▸ **createStoreActions**<`State`, `Mutations`\>(`mutations`): [`StoreActionsFactory`](README.md#storeactionsfactory)<`State`, `Mutations`\>

Creates a factory of store actions by state mutations

#### Type parameters

| Name        | Type                                                                                                                   |
| :---------- | :--------------------------------------------------------------------------------------------------------------------- |
| `State`     | `State`                                                                                                                |
| `Mutations` | extends `Readonly`<`Record`<`string`, (...`args`: `any`[]) => [`StateMutation`](README.md#statemutation)<`State`\>\>\> |

#### Parameters

| Name        | Type        |
| :---------- | :---------- |
| `mutations` | `Mutations` |

#### Returns

[`StoreActionsFactory`](README.md#storeactionsfactory)<`State`, `Mutations`\>

#### Defined in

[packages/rx-effects/src/storeActions.ts:25](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/storeActions.ts#L25)

---

### createStoreLoggerExtension

▸ **createStoreLoggerExtension**(`logger`): [`StoreExtension`](README.md#storeextension)<`unknown`\>

#### Parameters

| Name     | Type                                                        |
| :------- | :---------------------------------------------------------- |
| `logger` | (`message?`: `any`, ...`optionalParams`: `any`[]) => `void` |

#### Returns

[`StoreExtension`](README.md#storeextension)<`unknown`\>

#### Defined in

[packages/rx-effects/src/storeLoggerExtension.ts:3](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/storeLoggerExtension.ts#L3)

---

### declareState

▸ **declareState**<`State`\>(`stateOrFactory`, `options?`): [`StateDeclaration`](README.md#statedeclaration)<`State`\>

Declares the state.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Parameters

| Name             | Type                                                                                                                                        | Description                                         |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------- |
| `stateOrFactory` | `State` \| [`StateFactory`](README.md#statefactory)<`State`\>                                                                               | an initial state or a factory for the initial state |
| `options?`       | `Readonly`<{ `internal?`: `boolean` ; `name?`: `string` ; `stateComparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` }\> | Parameters for declaring a state                    |

#### Returns

[`StateDeclaration`](README.md#statedeclaration)<`State`\>

#### Defined in

[packages/rx-effects/src/stateDeclaration.ts:58](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/stateDeclaration.ts#L58)

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

| Name       | Type                                                                                                      |
| :--------- | :-------------------------------------------------------------------------------------------------------- |
| `source`   | `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\>                                          |
| `handler`  | [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>                                            |
| `options?` | `Readonly`<{ `onSourceCompleted?`: () => `void` ; `onSourceFailed?`: (`error`: `ErrorType`) => `void` }\> |

#### Returns

[`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

#### Defined in

[packages/rx-effects/src/handleAction.ts:8](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/handleAction.ts#L8)

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

[packages/rx-effects/src/stateQuery.ts:41](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/stateQuery.ts#L41)

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
| `queries`  | [...{ [K in string \| number \| symbol]: StateQuery<Values[K]\> }[]]       | source queries                          |
| `merger`   | (...`values`: `Values`) => `Result`                                        | value merger                            |
| `options?` | [`StateQueryOptions`](README.md#statequeryoptions)<`Result`, `ResultKey`\> | options for processing the result value |

#### Returns

[`StateQuery`](README.md#statequery)<`Result`\>

#### Defined in

[packages/rx-effects/src/stateQuery.ts:66](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/stateQuery.ts#L66)

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

| Name        | Type                                                            |
| :---------- | :-------------------------------------------------------------- |
| `mutations` | readonly [`StateMutation`](README.md#statemutation)<`State`\>[] |

#### Returns

[`StateMutation`](README.md#statemutation)<`State`\>

#### Defined in

[packages/rx-effects/src/stateMutation.ts:33](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/stateMutation.ts#L33)

---

### registerStoreExtension

▸ **registerStoreExtension**(`extension`): `Subscription`

#### Parameters

| Name        | Type                                                     |
| :---------- | :------------------------------------------------------- |
| `extension` | [`StoreExtension`](README.md#storeextension)<`unknown`\> |

#### Returns

`Subscription`

#### Defined in

[packages/rx-effects/src/storeExtensions.ts:13](https://github.com/mnasyrov/rx-effects/blob/e497377/packages/rx-effects/src/storeExtensions.ts#L13)
