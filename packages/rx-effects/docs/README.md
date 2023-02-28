rx-effects

# rx-effects

## Table of contents

### Type Aliases

- [Action](README.md#action)
- [Computation](README.md#computation)
- [ComputationOptions](README.md#computationoptions)
- [ComputationResolver](README.md#computationresolver)
- [Controller](README.md#controller)
- [ControllerFactory](README.md#controllerfactory)
- [DeclaredStoreFactory](README.md#declaredstorefactory)
- [Effect](README.md#effect)
- [EffectController](README.md#effectcontroller)
- [EffectError](README.md#effecterror)
- [EffectErrorOrigin](README.md#effecterrororigin)
- [EffectEventProject](README.md#effecteventproject)
- [EffectHandler](README.md#effecthandler)
- [EffectNotification](README.md#effectnotification)
- [EffectOptions](README.md#effectoptions)
- [EffectPipeline](README.md#effectpipeline)
- [EffectResult](README.md#effectresult)
- [EffectState](README.md#effectstate)
- [ExternalScope](README.md#externalscope)
- [InferredService](README.md#inferredservice)
- [InternalStoreOptions](README.md#internalstoreoptions)
- [Query](README.md#query)
- [Scope](README.md#scope)
- [StateMutation](README.md#statemutation)
- [StateMutationMetadata](README.md#statemutationmetadata)
- [StateUpdates](README.md#stateupdates)
- [Store](README.md#store)
- [StoreDeclaration](README.md#storedeclaration)
- [StoreEvent](README.md#storeevent)
- [StoreExtension](README.md#storeextension)
- [StoreOptions](README.md#storeoptions)
- [StoreQuery](README.md#storequery)
- [StoreUpdate](README.md#storeupdate)
- [StoreUpdateFunction](README.md#storeupdatefunction)
- [StoreUpdates](README.md#storeupdates)
- [StoreWithUpdates](README.md#storewithupdates)
- [ViewControllerFactory](README.md#viewcontrollerfactory)

### Variables

- [GLOBAL_EFFECT_UNHANDLED_ERROR$](README.md#global_effect_unhandled_error$)

### Functions

- [OBJECT_COMPARATOR](README.md#object_comparator)
- [compute](README.md#compute)
- [createAction](README.md#createaction)
- [createController](README.md#createcontroller)
- [createEffect](README.md#createeffect)
- [createEffectController](README.md#createeffectcontroller)
- [createScope](README.md#createscope)
- [createStore](README.md#createstore)
- [createStoreLoggerExtension](README.md#createstoreloggerextension)
- [createStoreUpdates](README.md#createstoreupdates)
- [declareController](README.md#declarecontroller)
- [declareStateUpdates](README.md#declarestateupdates)
- [declareStore](README.md#declarestore)
- [declareViewController](README.md#declareviewcontroller)
- [mapQuery](README.md#mapquery)
- [mergeQueries](README.md#mergequeries)
- [pipeStateMutations](README.md#pipestatemutations)
- [pipeStore](README.md#pipestore)
- [queryBehaviourSubject](README.md#querybehavioursubject)
- [registerStoreExtension](README.md#registerstoreextension)
- [withStoreUpdates](README.md#withstoreupdates)

## Type Aliases

### Action

Ƭ **Action**<`Event`\>: (`event`: `Event`) => `void` & [`Event`] extends [`undefined` \| `void`] ? (`event?`: `Event`) => `void` : (`event`: `Event`) => `void`

Action is an event emitter

**`Param`**

Optional transformation or handler for an event

**`Field`**

event$ - Observable for emitted events.

**`Example`**

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

[packages/rx-effects/src/action.ts:24](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/action.ts#L24)

---

### Computation

Ƭ **Computation**<`T`\>: (`resolver`: [`ComputationResolver`](README.md#computationresolver)) => `T`

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Type declaration

▸ (`resolver`): `T`

This function calculates a value from external sources or resolved sources by a provided "resolver".

##### Parameters

| Name       | Type                                                   |
| :--------- | :----------------------------------------------------- |
| `resolver` | [`ComputationResolver`](README.md#computationresolver) |

##### Returns

`T`

#### Defined in

[packages/rx-effects/src/compute.ts:20](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/compute.ts#L20)

---

### ComputationOptions

Ƭ **ComputationOptions**<`T`\>: `Object`

Options for "compute()" function

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Type declaration

| Name            | Type                                     | Description                                         |
| :-------------- | :--------------------------------------- | :-------------------------------------------------- |
| `comparator?`   | `Comparator`<`T`\>                       | A custom comparator to differ complex values        |
| `dependencies?` | [`Query`](README.md#query)<`unknown`\>[] | Explicitly dependencies for refreshing calculations |

#### Defined in

[packages/rx-effects/src/compute.ts:25](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/compute.ts#L25)

---

### ComputationResolver

Ƭ **ComputationResolver**: <T\>(`query`: `Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\>) => `T`<T, R\>(`query`: `Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\>, `selector`: (`value`: `T`) => `R`) => `R`

#### Type declaration

▸ <`T`\>(`query`): `T`

This function returns a current value of a provided Query and registers it as a dependency for computation.

##### Type parameters

| Name |
| :--- |
| `T`  |

##### Parameters

| Name    | Type                                                             |
| :------ | :--------------------------------------------------------------- |
| `query` | `Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\> |

##### Returns

`T`

▸ <`T`, `R`\>(`query`, `selector`): `R`

This function returns a current value of a provided Query and registers it as a dependency for computation.

##### Type parameters

| Name |
| :--- |
| `T`  |
| `R`  |

##### Parameters

| Name       | Type                                                             |
| :--------- | :--------------------------------------------------------------- |
| `query`    | `Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\> |
| `selector` | (`value`: `T`) => `R`                                            |

##### Returns

`R`

#### Defined in

[packages/rx-effects/src/compute.ts:12](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/compute.ts#L12)

---

### Controller

Ƭ **Controller**<`ControllerProps`\>: `Readonly`<`ControllerProps` & { `destroy`: () => `void` }\>

Effects and business logic controller.

Implementation of the controller must provide `destroy()` method. It should
be used for closing subscriptions and disposing resources.

**`Example`**

```ts
type LoggerController = Controller<{
  log: (message: string) => void;
}>;
```

#### Type parameters

| Name              | Type                              |
| :---------------- | :-------------------------------- |
| `ControllerProps` | extends `AnyObject` = `AnyObject` |

#### Defined in

[packages/rx-effects/src/controller.ts:18](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/controller.ts#L18)

---

### ControllerFactory

Ƭ **ControllerFactory**<`Service`\>: (`container`: `Container`) => [`Controller`](README.md#controller)<`Service`\>

#### Type parameters

| Name      | Type                |
| :-------- | :------------------ |
| `Service` | extends `AnyObject` |

#### Type declaration

▸ (`container`): [`Controller`](README.md#controller)<`Service`\>

##### Parameters

| Name        | Type        |
| :---------- | :---------- |
| `container` | `Container` |

##### Returns

[`Controller`](README.md#controller)<`Service`\>

#### Defined in

[packages/rx-effects/src/mvc.ts:24](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/mvc.ts#L24)

---

### DeclaredStoreFactory

Ƭ **DeclaredStoreFactory**<`State`, `Updates`\>: `Object`

#### Type parameters

| Name      | Type                                                       |
| :-------- | :--------------------------------------------------------- |
| `State`   | `State`                                                    |
| `Updates` | extends [`StateUpdates`](README.md#stateupdates)<`State`\> |

#### Call signature

▸ (`initialState?`, `options?`): `Readonly`<`Readonly`<`Readonly`<`Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\> & { `query`: `StoreQueryFn`<`State`\> }\> & { `id`: `number` ; `name?`: `string` ; `notify`: () => `void` ; `set`: (`state`: `State`) => `void` ; `update`: [`StoreUpdateFunction`](README.md#storeupdatefunction)<`State`\> } & { `destroy`: () => `void` }\> & { `updates`: [`StoreUpdates`](README.md#storeupdates)<`State`, `Updates`\> }\>

##### Parameters

| Name            | Type                                                                                                                                       |
| :-------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `initialState?` | `FactoryStateArg`<`State`\>                                                                                                                |
| `options?`      | `Readonly`<{ `comparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` ; `name?`: `string` ; `onDestroy?`: () => `void` }\> |

##### Returns

`Readonly`<`Readonly`<`Readonly`<`Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\> & { `query`: `StoreQueryFn`<`State`\> }\> & { `id`: `number` ; `name?`: `string` ; `notify`: () => `void` ; `set`: (`state`: `State`) => `void` ; `update`: [`StoreUpdateFunction`](README.md#storeupdatefunction)<`State`\> } & { `destroy`: () => `void` }\> & { `updates`: [`StoreUpdates`](README.md#storeupdates)<`State`, `Updates`\> }\>

#### Type declaration

| Name      | Type      |
| :-------- | :-------- |
| `updates` | `Updates` |

#### Defined in

[packages/rx-effects/src/declareStore.ts:24](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/declareStore.ts#L24)

---

### Effect

Ƭ **Effect**<`Event`, `Result`, `ErrorType`\>: [`Controller`](README.md#controller)<[`EffectState`](README.md#effectstate)<`Event`, `Result`, `ErrorType`\> & { `handle`: (`source`: [`Action`](README.md#action)<`Event`\> \| `Observable`<`Event`\> \| [`Query`](README.md#query)<`Event`\>) => `Subscription` }\>

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

[packages/rx-effects/src/effect.ts:56](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/effect.ts#L56)

---

### EffectController

Ƭ **EffectController**<`Event`, `Result`, `ErrorType`\>: [`Controller`](README.md#controller)<{ `complete`: () => `void` ; `error`: (`error`: [`EffectError`](README.md#effecterror)<`Event`, `ErrorType`\>) => `void` ; `next`: (`result`: [`EffectResult`](README.md#effectresult)<`Event`, `Result`\>) => `void` ; `start`: () => `void` ; `state`: [`EffectState`](README.md#effectstate)<`Event`, `Result`, `ErrorType`\> }\>

#### Type parameters

| Name        | Type     |
| :---------- | :------- |
| `Event`     | `Event`  |
| `Result`    | `Result` |
| `ErrorType` | `Error`  |

#### Defined in

[packages/rx-effects/src/effectController.ts:28](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/effectController.ts#L28)

---

### EffectError

Ƭ **EffectError**<`Event`, `ErrorType`\>: `Readonly`<{ `error`: `any` ; `event?`: `undefined` ; `origin`: `"source"` } \| { `error`: `ErrorType` ; `event`: `Event` ; `origin`: `"handler"` }\>

#### Type parameters

| Name        |
| :---------- |
| `Event`     |
| `ErrorType` |

#### Defined in

[packages/rx-effects/src/effectState.ts:11](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/effectState.ts#L11)

---

### EffectErrorOrigin

Ƭ **EffectErrorOrigin**: `"source"` \| `"handler"`

#### Defined in

[packages/rx-effects/src/effectState.ts:9](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/effectState.ts#L9)

---

### EffectEventProject

Ƭ **EffectEventProject**<`Event`, `Result`\>: (`event`: `Event`) => `Observable`<`Result`\>

#### Type parameters

| Name     |
| :------- |
| `Event`  |
| `Result` |

#### Type declaration

▸ (`event`): `Observable`<`Result`\>

##### Parameters

| Name    | Type    |
| :------ | :------ |
| `event` | `Event` |

##### Returns

`Observable`<`Result`\>

#### Defined in

[packages/rx-effects/src/effect.ts:27](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/effect.ts#L27)

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

**`Result`**

a result, Promise or Observable

##### Parameters

| Name    | Type    |
| :------ | :------ |
| `event` | `Event` |

##### Returns

`Result` \| `Promise`<`Result`\> \| `Observable`<`Result`\>

#### Defined in

[packages/rx-effects/src/effect.ts:23](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/effect.ts#L23)

---

### EffectNotification

Ƭ **EffectNotification**<`Event`, `Result`, `ErrorType`\>: `Readonly`<{ `type`: `"result"` } & [`EffectResult`](README.md#effectresult)<`Event`, `Result`\> \| { `type`: `"error"` } & [`EffectError`](README.md#effecterror)<`Event`, `ErrorType`\>\>

#### Type parameters

| Name        |
| :---------- |
| `Event`     |
| `Result`    |
| `ErrorType` |

#### Defined in

[packages/rx-effects/src/effectState.ts:24](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/effectState.ts#L24)

---

### EffectOptions

Ƭ **EffectOptions**<`Event`, `Result`\>: `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\>

#### Type parameters

| Name     |
| :------- |
| `Event`  |
| `Result` |

#### Defined in

[packages/rx-effects/src/effect.ts:38](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/effect.ts#L38)

---

### EffectPipeline

Ƭ **EffectPipeline**<`Event`, `Result`\>: (`eventProject`: [`EffectEventProject`](README.md#effecteventproject)<`Event`, `Result`\>) => `OperatorFunction`<`Event`, `Result`\>

#### Type parameters

| Name     |
| :------- |
| `Event`  |
| `Result` |

#### Type declaration

▸ (`eventProject`): `OperatorFunction`<`Event`, `Result`\>

##### Parameters

| Name           | Type                                                                     |
| :------------- | :----------------------------------------------------------------------- |
| `eventProject` | [`EffectEventProject`](README.md#effecteventproject)<`Event`, `Result`\> |

##### Returns

`OperatorFunction`<`Event`, `Result`\>

#### Defined in

[packages/rx-effects/src/effect.ts:31](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/effect.ts#L31)

---

### EffectResult

Ƭ **EffectResult**<`Event`, `Value`\>: `Readonly`<{ `event`: `Event` ; `result`: `Value` }\>

#### Type parameters

| Name    |
| :------ |
| `Event` |
| `Value` |

#### Defined in

[packages/rx-effects/src/effectState.ts:4](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/effectState.ts#L4)

---

### EffectState

Ƭ **EffectState**<`Event`, `Result`, `ErrorType`\>: `Readonly`<{ `done$`: `Observable`<[`EffectResult`](README.md#effectresult)<`Event`, `Result`\>\> ; `error$`: `Observable`<[`EffectError`](README.md#effecterror)<`Event`, `ErrorType`\>\> ; `final$`: `Observable`<[`EffectNotification`](README.md#effectnotification)<`Event`, `Result`, `ErrorType`\>\> ; `pending`: [`Query`](README.md#query)<`boolean`\> ; `pendingCount`: [`Query`](README.md#query)<`number`\> ; `result$`: `Observable`<`Result`\> }\>

Details about performing the effect.

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `Event`     | `Event` |
| `Result`    | `void`  |
| `ErrorType` | `Error` |

#### Defined in

[packages/rx-effects/src/effectState.ts:32](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/effectState.ts#L32)

---

### ExternalScope

Ƭ **ExternalScope**: `Omit`<[`Scope`](README.md#scope), `"destroy"`\>

`ExternalScope` and `Scope` types allow to distinct which third-party code can invoke `destroy()` method.

#### Defined in

[packages/rx-effects/src/scope.ts:76](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/scope.ts#L76)

---

### InferredService

Ƭ **InferredService**<`Factory`\>: `Factory` extends [`ViewControllerFactory`](README.md#viewcontrollerfactory)<infer Service, infer Params\> ? `Service` : `never`

#### Type parameters

| Name      |
| :-------- |
| `Factory` |

#### Defined in

[packages/rx-effects/src/mvc.ts:54](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/mvc.ts#L54)

---

### InternalStoreOptions

Ƭ **InternalStoreOptions**<`State`\>: `Readonly`<[`StoreOptions`](README.md#storeoptions)<`State`\> & { `internal?`: `boolean` }\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/store.ts:174](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L174)

---

### Query

Ƭ **Query**<`T`\>: `Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\>

Provider for a value of a state.

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Defined in

[packages/rx-effects/src/query.ts:6](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/query.ts#L6)

---

### Scope

Ƭ **Scope**: [`Controller`](README.md#controller)<{ `add`: (`teardown`: `TeardownLogic`) => `void` ; `createController`: <ControllerProps\>(`factory`: () => [`Controller`](README.md#controller)<`ControllerProps`\>) => [`Controller`](README.md#controller)<`ControllerProps`\> ; `createEffect`: <Event, Result, ErrorType\>(`handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: [`EffectOptions`](README.md#effectoptions)<`Event`, `Result`\>) => [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\> ; `handle`: <Event, Result, ErrorType\>(`source`: `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> \| [`Query`](README.md#query)<`Event`\>, `handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: [`EffectOptions`](README.md#effectoptions)<`Event`, `Result`\>) => [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\> ; `onDestroy`: (`teardown`: () => `void`) => `void` ; `subscribe`: <T\>(`source`: `Observable`<`T`\>) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `next`: (`value`: `T`) => `void`) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `observer`: `Partial`<`Observer`<`T`\>\>) => `Subscription` ; `createStore`: <State\>(`initialState`: `State`, `options?`: `Readonly`<{ `comparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` ; `name?`: `string` ; `onDestroy?`: () => `void` }\>) => `Readonly`<`Readonly`<`Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\> & { `query`: `StoreQueryFn`<`State`\> }\> & { `id`: `number` ; `name?`: `string` ; `notify`: () => `void` ; `set`: (`state`: `State`) => `void` ; `update`: [`StoreUpdateFunction`](README.md#storeupdatefunction)<`State`\> } & { `destroy`: () => `void` }\> }\>

A controller-like boundary for effects and business logic.

`Scope` collects all subscriptions which are made by child entities and provides
`destroy()` method to unsubscribe from them.

#### Defined in

[packages/rx-effects/src/scope.ts:15](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/scope.ts#L15)

---

### StateMutation

Ƭ **StateMutation**<`State`\>: (`state`: `State`) => `State`

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Type declaration

▸ (`state`): `State`

A function to update a state.

It is recommended to return a new state or the previous one.

Actually, the function can change the state in place, but it is responsible
for a developer to provide `comparator` function to the store which handles
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

[packages/rx-effects/src/store.ts:29](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L29)

---

### StateMutationMetadata

Ƭ **StateMutationMetadata**: `Readonly`<{ `name?`: `string` }\>

#### Defined in

[packages/rx-effects/src/storeMetadata.ts:6](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/storeMetadata.ts#L6)

---

### StateUpdates

Ƭ **StateUpdates**<`State`\>: `Readonly`<`Record`<`string`, (...`args`: `any`[]) => [`StateMutation`](README.md#statemutation)<`State`\>\>\>

A record of factories which create state mutations.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/store.ts:34](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L34)

---

### Store

Ƭ **Store**<`State`\>: [`Controller`](README.md#controller)<[`StoreQuery`](README.md#storequery)<`State`\> & { `id`: `number` ; `name?`: `string` ; `notify`: () => `void` ; `set`: (`state`: `State`) => `void` ; `update`: [`StoreUpdateFunction`](README.md#storeupdatefunction)<`State`\> }\>

Store of a state

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/store.ts:137](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L137)

---

### StoreDeclaration

Ƭ **StoreDeclaration**<`State`, `Updates`\>: `Readonly`<{ `initialState`: `State` ; `options?`: [`StoreOptions`](README.md#storeoptions)<`State`\> ; `updates`: `Updates` }\>

#### Type parameters

| Name      | Type                                                                                                            |
| :-------- | :-------------------------------------------------------------------------------------------------------------- |
| `State`   | `State`                                                                                                         |
| `Updates` | extends [`StateUpdates`](README.md#stateupdates)<`State`\> = [`StateUpdates`](README.md#stateupdates)<`State`\> |

#### Defined in

[packages/rx-effects/src/declareStore.ts:11](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/declareStore.ts#L11)

---

### StoreEvent

Ƭ **StoreEvent**<`State`\>: { `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"created"` } \| { `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"destroyed"` } \| { `mutation`: [`StateMutation`](README.md#statemutation)<`State`\> ; `nextState`: `State` ; `prevState`: `State` ; `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"mutation"` } \| { `nextState`: `State` ; `prevState`: `State` ; `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"updated"` }

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/storeEvents.ts:4](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/storeEvents.ts#L4)

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

[packages/rx-effects/src/storeExtensions.ts:9](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/storeExtensions.ts#L9)

---

### StoreOptions

Ƭ **StoreOptions**<`State`\>: `Readonly`<{ `comparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` ; `name?`: `string` ; `onDestroy?`: () => `void` }\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/store.ts:163](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L163)

---

### StoreQuery

Ƭ **StoreQuery**<`State`\>: `Readonly`<[`Query`](README.md#query)<`State`\> & { `query`: `StoreQueryFn`<`State`\> }\>

Read-only interface of a store.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/store.ts:93](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L93)

---

### StoreUpdate

Ƭ **StoreUpdate**<`Args`\>: (...`args`: `Args`) => `void`

#### Type parameters

| Name   | Type                |
| :----- | :------------------ |
| `Args` | extends `unknown`[] |

#### Type declaration

▸ (`...args`): `void`

Function which changes a state of the store

##### Parameters

| Name      | Type   |
| :-------- | :----- |
| `...args` | `Args` |

##### Returns

`void`

#### Defined in

[packages/rx-effects/src/store.ts:124](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L124)

---

### StoreUpdateFunction

Ƭ **StoreUpdateFunction**<`State`\>: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| `ReadonlyArray`<[`StateMutation`](README.md#statemutation)<`State`\> \| `undefined` \| `null` \| `false`\>) => `void`

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Type declaration

▸ (`mutation`): `void`

Updates the state by provided mutations

##### Parameters

| Name       | Type                                                                                                                                                               |
| :--------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mutation` | [`StateMutation`](README.md#statemutation)<`State`\> \| `ReadonlyArray`<[`StateMutation`](README.md#statemutation)<`State`\> \| `undefined` \| `null` \| `false`\> |

##### Returns

`void`

#### Defined in

[packages/rx-effects/src/store.ts:117](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L117)

---

### StoreUpdates

Ƭ **StoreUpdates**<`State`, `Updates`\>: `Readonly`<{ [K in keyof Updates]: StoreUpdate<Parameters<Updates[K]\>\> }\>

Record of store update functions

#### Type parameters

| Name      | Type                                                       |
| :-------- | :--------------------------------------------------------- |
| `State`   | `State`                                                    |
| `Updates` | extends [`StateUpdates`](README.md#stateupdates)<`State`\> |

#### Defined in

[packages/rx-effects/src/store.ts:127](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L127)

---

### StoreWithUpdates

Ƭ **StoreWithUpdates**<`State`, `Updates`\>: `Readonly`<[`Store`](README.md#store)<`State`\> & { `updates`: [`StoreUpdates`](README.md#storeupdates)<`State`, `Updates`\> }\>

Store of a state with updating functions

#### Type parameters

| Name      | Type                                                       |
| :-------- | :--------------------------------------------------------- |
| `State`   | `State`                                                    |
| `Updates` | extends [`StateUpdates`](README.md#stateupdates)<`State`\> |

#### Defined in

[packages/rx-effects/src/store.ts:154](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L154)

---

### ViewControllerFactory

Ƭ **ViewControllerFactory**<`Service`, `Params`\>: (`container`: `Container`, ...`params`: `Params`) => [`Controller`](README.md#controller)<`Service`\>

#### Type parameters

| Name      | Type                                             |
| :-------- | :----------------------------------------------- |
| `Service` | extends `AnyObject`                              |
| `Params`  | extends [`Query`](README.md#query)<`unknown`\>[] |

#### Type declaration

▸ (`container`, `...params`): [`Controller`](README.md#controller)<`Service`\>

##### Parameters

| Name        | Type        |
| :---------- | :---------- |
| `container` | `Container` |
| `...params` | `Params`    |

##### Returns

[`Controller`](README.md#controller)<`Service`\>

#### Defined in

[packages/rx-effects/src/mvc.ts:49](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/mvc.ts#L49)

## Variables

### GLOBAL_EFFECT_UNHANDLED_ERROR$

• `Const` **GLOBAL_EFFECT_UNHANDLED_ERROR$**: `Observable`<[`EffectError`](README.md#effecterror)<`unknown`, `unknown`\>\>

#### Defined in

[packages/rx-effects/src/effectController.ts:15](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/effectController.ts#L15)

## Functions

### OBJECT_COMPARATOR

▸ **OBJECT_COMPARATOR**(`objA`, `objB`): `boolean`

Makes shallow comparison of two objects.

#### Parameters

| Name   | Type                           |
| :----- | :----------------------------- |
| `objA` | `Record`<`string`, `unknown`\> |
| `objB` | `Record`<`string`, `unknown`\> |

#### Returns

`boolean`

#### Defined in

[packages/rx-effects/src/utils.ts:15](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/utils.ts#L15)

---

### compute

▸ **compute**<`T`\>(`computation`, `dependencies?`): `Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\>

Creates a computable query which calculates its values by provided "computation" function and dependencies.

Rules of "Computation" function:

- it must have no side effects
- it recalculates only when specified dependencies are updated
- its "formula" may have other sources of values, however they don't trigger updates

"Computation" function provides a resolver for using a dependency withing a calculation expression.

Dependency can be declared explicitly as an array by the second argument. It has the following advantages:

- Faster dependency subscription
- Ability to specify extra queries or observables as dependencies

A custom value comparator can be specified by "options" object as the second argument.
It helps to decide if a new value differs from a previous one in complex cases.

**`Example`**

```ts
const greeting = createStore('Hello');
const username = createStore('World');

// Dependency are implicitly resolved
const message = compute((get) => get(greeting) + ' ' + get(username) + '!');

// Dependency declared explicitly
const messageUppercase = compute(() => message.get().toUpperCase(), [message]);

expect(message.get()).toBe('Hello World!');
expect(messageUppercase.get()).toBe('HELLO WORLD!');
```

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name            | Type                                                                           |
| :-------------- | :----------------------------------------------------------------------------- |
| `computation`   | [`Computation`](README.md#computation)<`T`\>                                   |
| `dependencies?` | `Readonly`<{ `get`: () => `unknown` ; `value$`: `Observable`<`unknown`\> }\>[] |

#### Returns

`Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\>

#### Defined in

[packages/rx-effects/src/compute.ts:66](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/compute.ts#L66)

▸ **compute**<`T`\>(`computation`, `options?`): `Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\>

Creates a computable query which calculates its values by provided "computation" function and dependencies.

Rules of "Computation" function:

- it must have no side effects
- it recalculates only when specified dependencies are updated
- its "formula" may have other sources of values, however they don't trigger updates

"Computation" function provides a resolver for using a dependency withing a calculation expression.

Dependency can be declared explicitly as an array by the second argument. It has the following advantages:

- Faster dependency subscription
- Ability to specify extra queries or observables as dependencies

A custom value comparator can be specified by "options" object as the second argument.
It helps to decide if a new value differs from a previous one in complex cases.

**`Example`**

```ts
const greeting = createStore('Hello');
const username = createStore('World');

// Dependency are implicitly resolved
const message = compute((get) => get(greeting) + ' ' + get(username) + '!');

// Dependency declared explicitly
const messageUppercase = compute(() => message.get().toUpperCase(), [message]);

expect(message.get()).toBe('Hello World!');
expect(messageUppercase.get()).toBe('HELLO WORLD!');
```

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name          | Type                                                       |
| :------------ | :--------------------------------------------------------- |
| `computation` | [`Computation`](README.md#computation)<`T`\>               |
| `options?`    | [`ComputationOptions`](README.md#computationoptions)<`T`\> |

#### Returns

`Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\>

#### Defined in

[packages/rx-effects/src/compute.ts:67](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/compute.ts#L67)

---

### createAction

▸ **createAction**<`Event`\>(`operator?`): [`Action`](README.md#action)<`Event`\>

#### Type parameters

| Name    | Type   |
| :------ | :----- |
| `Event` | `void` |

#### Parameters

| Name        | Type                                 |
| :---------- | :----------------------------------- |
| `operator?` | `MonoTypeOperatorFunction`<`Event`\> |

#### Returns

[`Action`](README.md#action)<`Event`\>

#### Defined in

[packages/rx-effects/src/action.ts:31](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/action.ts#L31)

---

### createController

▸ **createController**<`Service`\>(`factory`): [`Controller`](README.md#controller)<`Service`\>

#### Type parameters

| Name      | Type                |
| :-------- | :------------------ |
| `Service` | extends `AnyObject` |

#### Parameters

| Name      | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| :-------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `factory` | (`scope`: `Readonly`<{ `add`: (`teardown`: `TeardownLogic`) => `void` ; `createController`: <ControllerProps\>(`factory`: () => `Readonly`<`ControllerProps` & { `destroy`: () => `void` }\>) => `Readonly`<`ControllerProps` & { `destroy`: () => `void` }\> ; `createEffect`: <Event, Result, ErrorType\>(`handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\>) => `Readonly`<`Readonly`<{ `done$`: `Observable`<`Readonly`<{ `event`: `Event` ; `result`: `Result` }\>\> ; `error$`: `Observable`<[`EffectError`](README.md#effecterror)<`Event`, `ErrorType`\>\> ; `final$`: `Observable`<[`EffectNotification`](README.md#effectnotification)<`Event`, `Result`, `ErrorType`\>\> ; `pending`: `Readonly`<{ `get`: () => `boolean` ; `value$`: `Observable`<`boolean`\> }\> ; `pendingCount`: `Readonly`<{ `get`: () => `number` ; `value$`: `Observable`<`number`\> }\> ; `result$`: `Observable`<`Result`\> }\> & { `handle`: (`source`: [`Action`](README.md#action)<`Event`\> \| `Observable`<`Event`\> \| `Readonly`<{ `get`: () => `Event` ; `value$`: `Observable`<`Event`\> }\>) => `Subscription` } & { `destroy`: () => `void` }\> ; `handle`: <Event, Result, ErrorType\>(`source`: `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> \| `Readonly`<{ `get`: () => `Event` ; `value$`: `Observable`<`Event`\> }\>, `handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\>) => `Readonly`<`Readonly`<{ `done$`: `Observable`<`Readonly`<{ `event`: `Event` ; `result`: `Result` }\>\> ; `error$`: `Observable`<[`EffectError`](README.md#effecterror)<`Event`, `ErrorType`\>\> ; `final$`: `Observable`<[`EffectNotification`](README.md#effectnotification)<`Event`, `Result`, `ErrorType`\>\> ; `pending`: `Readonly`<{ `get`: () => `boolean` ; `value$`: `Observable`<`boolean`\> }\> ; `pendingCount`: `Readonly`<{ `get`: () => `number` ; `value$`: `Observable`<`number`\> }\> ; `result$`: `Observable`<`Result`\> }\> & { `handle`: (`source`: `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> \| `Readonly`<{ `get`: () => `Event` ; `value$`: `Observable`<`Event`\> }\>) => `Subscription` } & { `destroy`: () => `void` }\> ; `onDestroy`: (`teardown`: () => `void`) => `void` ; `subscribe`: <T\>(`source`: `Observable`<`T`\>) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `next`: (`value`: `T`) => `void`) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `observer`: `Partial`<`Observer`<`T`\>\>) => `Subscription` ; `createStore`: <State\>(`initialState`: `State`, `options?`: `Readonly`<{ `comparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` ; `name?`: `string` ; `onDestroy?`: () => `void` }\>) => `Readonly`<`Readonly`<`Readonly`<{ `get`: () => `State` ; `value$`: `Observable`<`State`\> }\> & { `query`: `StoreQueryFn`<`State`\> }\> & { `id`: `number` ; `name?`: `string` ; `notify`: () => `void` ; `set`: (`state`: `State`) => `void` ; `update`: [`StoreUpdateFunction`](README.md#storeupdatefunction)<`State`\> } & { `destroy`: () => `void` }\> } & { `destroy`: () => `void` }\>) => `Service` & { `destroy?`: () => `void` } |

#### Returns

[`Controller`](README.md#controller)<`Service`\>

#### Defined in

[packages/rx-effects/src/mvc.ts:7](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/mvc.ts#L7)

---

### createEffect

▸ **createEffect**<`Event`, `Result`, `ErrorType`\>(`handler`, `options?`): [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

Creates `Effect` from the provided handler.

**`Example`**

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

| Name       | Type                                                                                           |
| :--------- | :--------------------------------------------------------------------------------------------- |
| `handler`  | [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>                                 |
| `options?` | `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\> |

#### Returns

[`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

#### Defined in

[packages/rx-effects/src/effect.ts:74](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/effect.ts#L74)

---

### createEffectController

▸ **createEffectController**<`Event`, `Result`, `ErrorType`\>(): [`EffectController`](README.md#effectcontroller)<`Event`, `Result`, `ErrorType`\>

#### Type parameters

| Name        | Type     |
| :---------- | :------- |
| `Event`     | `Event`  |
| `Result`    | `Result` |
| `ErrorType` | `Error`  |

#### Returns

[`EffectController`](README.md#effectcontroller)<`Event`, `Result`, `ErrorType`\>

#### Defined in

[packages/rx-effects/src/effectController.ts:40](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/effectController.ts#L40)

---

### createScope

▸ **createScope**(): [`Scope`](README.md#scope)

Creates `Scope` instance.

#### Returns

[`Scope`](README.md#scope)

#### Defined in

[packages/rx-effects/src/scope.ts:81](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/scope.ts#L81)

---

### createStore

▸ **createStore**<`State`\>(`initialState`, `options?`): [`Store`](README.md#store)<`State`\>

Creates the state store.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Parameters

| Name           | Type                                                                                                                                       | Description              |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :----------------------- |
| `initialState` | `State`                                                                                                                                    | Initial state            |
| `options?`     | `Readonly`<{ `comparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` ; `name?`: `string` ; `onDestroy?`: () => `void` }\> | Parameters for the store |

#### Returns

[`Store`](README.md#store)<`State`\>

#### Defined in

[packages/rx-effects/src/store.ts:186](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L186)

---

### createStoreLoggerExtension

▸ **createStoreLoggerExtension**(`logger`): [`StoreExtension`](README.md#storeextension)<`unknown`\>

#### Parameters

| Name     | Type                                                                                      |
| :------- | :---------------------------------------------------------------------------------------- |
| `logger` | (...`data`: `any`[]) => `void`(`message?`: `any`, ...`optionalParams`: `any`[]) => `void` |

#### Returns

[`StoreExtension`](README.md#storeextension)<`unknown`\>

#### Defined in

[packages/rx-effects/src/storeLoggerExtension.ts:3](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/storeLoggerExtension.ts#L3)

---

### createStoreUpdates

▸ **createStoreUpdates**<`State`, `Updates`\>(`storeUpdate`, `stateUpdates`): [`StoreUpdates`](README.md#storeupdates)<`State`, `Updates`\>

Creates StateUpdates for updating the store by provided state mutations

#### Type parameters

| Name      | Type                                                                                                                   |
| :-------- | :--------------------------------------------------------------------------------------------------------------------- |
| `State`   | `State`                                                                                                                |
| `Updates` | extends `Readonly`<`Record`<`string`, (...`args`: `any`[]) => [`StateMutation`](README.md#statemutation)<`State`\>\>\> |

#### Parameters

| Name           | Type                                                             |
| :------------- | :--------------------------------------------------------------- |
| `storeUpdate`  | [`StoreUpdateFunction`](README.md#storeupdatefunction)<`State`\> |
| `stateUpdates` | `Updates`                                                        |

#### Returns

[`StoreUpdates`](README.md#storeupdates)<`State`, `Updates`\>

#### Defined in

[packages/rx-effects/src/store.ts:316](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L316)

---

### declareController

▸ **declareController**<`Dependencies`, `Service`\>(`tokens`, `factory`): [`ControllerFactory`](README.md#controllerfactory)<`Service`\>

#### Type parameters

| Name           | Type                      |
| :------------- | :------------------------ |
| `Dependencies` | extends `DependencyProps` |
| `Service`      | extends `AnyObject`       |

#### Parameters

| Name      | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| :-------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tokens`  | `TokenProps`<`Dependencies`\>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `factory` | (`deps`: `Dependencies`, `scope`: `Readonly`<{ `add`: (`teardown`: `TeardownLogic`) => `void` ; `createController`: <ControllerProps\>(`factory`: () => `Readonly`<`ControllerProps` & { `destroy`: () => `void` }\>) => `Readonly`<`ControllerProps` & { `destroy`: () => `void` }\> ; `createEffect`: <Event, Result, ErrorType\>(`handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\>) => `Readonly`<`Readonly`<{ `done$`: `Observable`<`Readonly`<{ `event`: `Event` ; `result`: `Result` }\>\> ; `error$`: `Observable`<[`EffectError`](README.md#effecterror)<`Event`, `ErrorType`\>\> ; `final$`: `Observable`<[`EffectNotification`](README.md#effectnotification)<`Event`, `Result`, `ErrorType`\>\> ; `pending`: `Readonly`<{ `get`: () => `boolean` ; `value$`: `Observable`<`boolean`\> }\> ; `pendingCount`: `Readonly`<{ `get`: () => `number` ; `value$`: `Observable`<`number`\> }\> ; `result$`: `Observable`<`Result`\> }\> & { `handle`: (`source`: [`Action`](README.md#action)<`Event`\> \| `Observable`<`Event`\> \| `Readonly`<{ `get`: () => `Event` ; `value$`: `Observable`<`Event`\> }\>) => `Subscription` } & { `destroy`: () => `void` }\> ; `handle`: <Event, Result, ErrorType\>(`source`: `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> \| `Readonly`<{ `get`: () => `Event` ; `value$`: `Observable`<`Event`\> }\>, `handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\>) => `Readonly`<`Readonly`<{ `done$`: `Observable`<`Readonly`<{ `event`: `Event` ; `result`: `Result` }\>\> ; `error$`: `Observable`<[`EffectError`](README.md#effecterror)<`Event`, `ErrorType`\>\> ; `final$`: `Observable`<[`EffectNotification`](README.md#effectnotification)<`Event`, `Result`, `ErrorType`\>\> ; `pending`: `Readonly`<{ `get`: () => `boolean` ; `value$`: `Observable`<`boolean`\> }\> ; `pendingCount`: `Readonly`<{ `get`: () => `number` ; `value$`: `Observable`<`number`\> }\> ; `result$`: `Observable`<`Result`\> }\> & { `handle`: (`source`: `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> \| `Readonly`<{ `get`: () => `Event` ; `value$`: `Observable`<`Event`\> }\>) => `Subscription` } & { `destroy`: () => `void` }\> ; `onDestroy`: (`teardown`: () => `void`) => `void` ; `subscribe`: <T\>(`source`: `Observable`<`T`\>) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `next`: (`value`: `T`) => `void`) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `observer`: `Partial`<`Observer`<`T`\>\>) => `Subscription` ; `createStore`: <State\>(`initialState`: `State`, `options?`: `Readonly`<{ `comparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` ; `name?`: `string` ; `onDestroy?`: () => `void` }\>) => `Readonly`<`Readonly`<`Readonly`<{ `get`: () => `State` ; `value$`: `Observable`<`State`\> }\> & { `query`: `StoreQueryFn`<`State`\> }\> & { `id`: `number` ; `name?`: `string` ; `notify`: () => `void` ; `set`: (`state`: `State`) => `void` ; `update`: [`StoreUpdateFunction`](README.md#storeupdatefunction)<`State`\> } & { `destroy`: () => `void` }\> } & { `destroy`: () => `void` }\>) => `Service` |

#### Returns

[`ControllerFactory`](README.md#controllerfactory)<`Service`\>

#### Defined in

[packages/rx-effects/src/mvc.ts:36](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/mvc.ts#L36)

---

### declareStateUpdates

▸ **declareStateUpdates**<`State`\>(): <Updates\>(`updates`: `Updates`) => `Updates`

Declare a record of factories for creating state mutations.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Returns

`fn`

▸ <`Updates`\>(`updates`): `Updates`

##### Type parameters

| Name      | Type                                                                                                            |
| :-------- | :-------------------------------------------------------------------------------------------------------------- |
| `Updates` | extends [`StateUpdates`](README.md#stateupdates)<`State`\> = [`StateUpdates`](README.md#stateupdates)<`State`\> |

##### Parameters

| Name      | Type      |
| :-------- | :-------- |
| `updates` | `Updates` |

##### Returns

`Updates`

#### Defined in

[packages/rx-effects/src/store.ts:41](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L41)

▸ **declareStateUpdates**<`State`, `Updates`\>(`stateExample`, `updates`): `Updates`

Declare a record of factories for creating state mutations.

#### Type parameters

| Name      | Type                                                                                                                                                                                                                                    |
| :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `State`   | `State`                                                                                                                                                                                                                                 |
| `Updates` | extends `Readonly`<`Record`<`string`, (...`args`: `any`[]) => [`StateMutation`](README.md#statemutation)<`State`\>\>\> = `Readonly`<`Record`<`string`, (...`args`: `any`[]) => [`StateMutation`](README.md#statemutation)<`State`\>\>\> |

#### Parameters

| Name           | Type      |
| :------------- | :-------- |
| `stateExample` | `State`   |
| `updates`      | `Updates` |

#### Returns

`Updates`

#### Defined in

[packages/rx-effects/src/store.ts:50](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L50)

---

### declareStore

▸ **declareStore**<`State`, `Updates`\>(`declaration`): [`DeclaredStoreFactory`](README.md#declaredstorefactory)<`State`, `Updates`\>

declare the base interface for create store

**`Example`**

```ts
type State = {
 id: string;
 name: string;
 isAdmin: boolean
};
const initialState: State = {
 id: '',
 name: '',
 isAdmin: false
};
const createUserStore = declareStore({
 initialState,
 updates: {
   setId: (id: string) => (state) => {
     return {
       ...state,
       id: id,
     };
   },
   setName: (name: string) => (state) => {
     return {
       ...state,
       name: name,
     };
   },
   update: (id: string name: string) => (state) => {
     return {
       ...state,
       id: id,
       name: name,
     };
   },
   setIsAdmin: () => (state) => {
     return {
       ...state,
       isAdmin: true,
     };
   },
 },
});

const userStore1 = createUserStore({ id: '1', name: 'User 1', isAdmin: false });

const userStore2 = createUserStore({ id: '2', name: 'User 2', isAdmin: true });

// OR

const users = [
 createUserStore({id: 1, name: 'User 1'}),
 createUserStore({id: 2, name: 'User 2'}),
]

userStore1.updates.setName('User from store 1');

assets.isEqual(userStore1.get().name, 'User from store 1')

assets.isEqual(userStore2.get().name, 'User 2')

// type of createUserStore
type UserStore = ReturnType<typeof createUserStore>;
```

#### Type parameters

| Name      | Type                                                                                                                                                                                                                                    |
| :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `State`   | `State`                                                                                                                                                                                                                                 |
| `Updates` | extends `Readonly`<`Record`<`string`, (...`args`: `any`[]) => [`StateMutation`](README.md#statemutation)<`State`\>\>\> = `Readonly`<`Record`<`string`, (...`args`: `any`[]) => [`StateMutation`](README.md#statemutation)<`State`\>\>\> |

#### Parameters

| Name          | Type                                                                                                                                                                                                                     |
| :------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `declaration` | `Readonly`<{ `initialState`: `State` ; `options?`: `Readonly`<{ `comparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` ; `name?`: `string` ; `onDestroy?`: () => `void` }\> ; `updates`: `Updates` }\> |

#### Returns

[`DeclaredStoreFactory`](README.md#declaredstorefactory)<`State`, `Updates`\>

#### Defined in

[packages/rx-effects/src/declareStore.ts:99](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/declareStore.ts#L99)

---

### declareViewController

▸ **declareViewController**<`Service`, `Params`\>(`factory`): [`ViewControllerFactory`](README.md#viewcontrollerfactory)<`Service`, `Params`\>

#### Type parameters

| Name      | Type                                                                                   |
| :-------- | :------------------------------------------------------------------------------------- |
| `Service` | extends `AnyObject`                                                                    |
| `Params`  | extends `Readonly`<{ `get`: () => `unknown` ; `value$`: `Observable`<`unknown`\> }\>[] |

#### Parameters

| Name      | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| :-------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `factory` | (`scope`: `Readonly`<{ `add`: (`teardown`: `TeardownLogic`) => `void` ; `createController`: <ControllerProps\>(`factory`: () => `Readonly`<`ControllerProps` & { `destroy`: () => `void` }\>) => `Readonly`<`ControllerProps` & { `destroy`: () => `void` }\> ; `createEffect`: <Event, Result, ErrorType\>(`handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\>) => `Readonly`<`Readonly`<{ `done$`: `Observable`<`Readonly`<{ `event`: `Event` ; `result`: `Result` }\>\> ; `error$`: `Observable`<[`EffectError`](README.md#effecterror)<`Event`, `ErrorType`\>\> ; `final$`: `Observable`<[`EffectNotification`](README.md#effectnotification)<`Event`, `Result`, `ErrorType`\>\> ; `pending`: `Readonly`<{ `get`: () => `boolean` ; `value$`: `Observable`<`boolean`\> }\> ; `pendingCount`: `Readonly`<{ `get`: () => `number` ; `value$`: `Observable`<`number`\> }\> ; `result$`: `Observable`<`Result`\> }\> & { `handle`: (`source`: [`Action`](README.md#action)<`Event`\> \| `Observable`<`Event`\> \| `Readonly`<{ `get`: () => `Event` ; `value$`: `Observable`<`Event`\> }\>) => `Subscription` } & { `destroy`: () => `void` }\> ; `handle`: <Event, Result, ErrorType\>(`source`: `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> \| `Readonly`<{ `get`: () => `Event` ; `value$`: `Observable`<`Event`\> }\>, `handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\>) => `Readonly`<`Readonly`<{ `done$`: `Observable`<`Readonly`<{ `event`: `Event` ; `result`: `Result` }\>\> ; `error$`: `Observable`<[`EffectError`](README.md#effecterror)<`Event`, `ErrorType`\>\> ; `final$`: `Observable`<[`EffectNotification`](README.md#effectnotification)<`Event`, `Result`, `ErrorType`\>\> ; `pending`: `Readonly`<{ `get`: () => `boolean` ; `value$`: `Observable`<`boolean`\> }\> ; `pendingCount`: `Readonly`<{ `get`: () => `number` ; `value$`: `Observable`<`number`\> }\> ; `result$`: `Observable`<`Result`\> }\> & { `handle`: (`source`: `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> \| `Readonly`<{ `get`: () => `Event` ; `value$`: `Observable`<`Event`\> }\>) => `Subscription` } & { `destroy`: () => `void` }\> ; `onDestroy`: (`teardown`: () => `void`) => `void` ; `subscribe`: <T\>(`source`: `Observable`<`T`\>) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `next`: (`value`: `T`) => `void`) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `observer`: `Partial`<`Observer`<`T`\>\>) => `Subscription` ; `createStore`: <State\>(`initialState`: `State`, `options?`: `Readonly`<{ `comparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` ; `name?`: `string` ; `onDestroy?`: () => `void` }\>) => `Readonly`<`Readonly`<`Readonly`<{ `get`: () => `State` ; `value$`: `Observable`<`State`\> }\> & { `query`: `StoreQueryFn`<`State`\> }\> & { `id`: `number` ; `name?`: `string` ; `notify`: () => `void` ; `set`: (`state`: `State`) => `void` ; `update`: [`StoreUpdateFunction`](README.md#storeupdatefunction)<`State`\> } & { `destroy`: () => `void` }\> } & { `destroy`: () => `void` }\>, ...`params`: `Params`) => `Service` |

#### Returns

[`ViewControllerFactory`](README.md#viewcontrollerfactory)<`Service`, `Params`\>

#### Defined in

[packages/rx-effects/src/mvc.ts:62](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/mvc.ts#L62)

▸ **declareViewController**<`Dependencies`, `Service`, `Params`\>(`tokens`, `factory`): [`ViewControllerFactory`](README.md#viewcontrollerfactory)<`Service`, `Params`\>

#### Type parameters

| Name           | Type                                                                                   |
| :------------- | :------------------------------------------------------------------------------------- |
| `Dependencies` | extends `DependencyProps`                                                              |
| `Service`      | extends `AnyObject`                                                                    |
| `Params`       | extends `Readonly`<{ `get`: () => `unknown` ; `value$`: `Observable`<`unknown`\> }\>[] |

#### Parameters

| Name      | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tokens`  | `TokenProps`<`Dependencies`\>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `factory` | (`deps`: `Dependencies`, `scope`: `Readonly`<{ `add`: (`teardown`: `TeardownLogic`) => `void` ; `createController`: <ControllerProps\>(`factory`: () => `Readonly`<`ControllerProps` & { `destroy`: () => `void` }\>) => `Readonly`<`ControllerProps` & { `destroy`: () => `void` }\> ; `createEffect`: <Event, Result, ErrorType\>(`handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\>) => `Readonly`<`Readonly`<{ `done$`: `Observable`<`Readonly`<{ `event`: `Event` ; `result`: `Result` }\>\> ; `error$`: `Observable`<[`EffectError`](README.md#effecterror)<`Event`, `ErrorType`\>\> ; `final$`: `Observable`<[`EffectNotification`](README.md#effectnotification)<`Event`, `Result`, `ErrorType`\>\> ; `pending`: `Readonly`<{ `get`: () => `boolean` ; `value$`: `Observable`<`boolean`\> }\> ; `pendingCount`: `Readonly`<{ `get`: () => `number` ; `value$`: `Observable`<`number`\> }\> ; `result$`: `Observable`<`Result`\> }\> & { `handle`: (`source`: [`Action`](README.md#action)<`Event`\> \| `Observable`<`Event`\> \| `Readonly`<{ `get`: () => `Event` ; `value$`: `Observable`<`Event`\> }\>) => `Subscription` } & { `destroy`: () => `void` }\> ; `handle`: <Event, Result, ErrorType\>(`source`: `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> \| `Readonly`<{ `get`: () => `Event` ; `value$`: `Observable`<`Event`\> }\>, `handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\>) => `Readonly`<`Readonly`<{ `done$`: `Observable`<`Readonly`<{ `event`: `Event` ; `result`: `Result` }\>\> ; `error$`: `Observable`<[`EffectError`](README.md#effecterror)<`Event`, `ErrorType`\>\> ; `final$`: `Observable`<[`EffectNotification`](README.md#effectnotification)<`Event`, `Result`, `ErrorType`\>\> ; `pending`: `Readonly`<{ `get`: () => `boolean` ; `value$`: `Observable`<`boolean`\> }\> ; `pendingCount`: `Readonly`<{ `get`: () => `number` ; `value$`: `Observable`<`number`\> }\> ; `result$`: `Observable`<`Result`\> }\> & { `handle`: (`source`: `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> \| `Readonly`<{ `get`: () => `Event` ; `value$`: `Observable`<`Event`\> }\>) => `Subscription` } & { `destroy`: () => `void` }\> ; `onDestroy`: (`teardown`: () => `void`) => `void` ; `subscribe`: <T\>(`source`: `Observable`<`T`\>) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `next`: (`value`: `T`) => `void`) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `observer`: `Partial`<`Observer`<`T`\>\>) => `Subscription` ; `createStore`: <State\>(`initialState`: `State`, `options?`: `Readonly`<{ `comparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` ; `name?`: `string` ; `onDestroy?`: () => `void` }\>) => `Readonly`<`Readonly`<`Readonly`<{ `get`: () => `State` ; `value$`: `Observable`<`State`\> }\> & { `query`: `StoreQueryFn`<`State`\> }\> & { `id`: `number` ; `name?`: `string` ; `notify`: () => `void` ; `set`: (`state`: `State`) => `void` ; `update`: [`StoreUpdateFunction`](README.md#storeupdatefunction)<`State`\> } & { `destroy`: () => `void` }\> } & { `destroy`: () => `void` }\>) => `Service` \| (`scope`: `Readonly`<{ `add`: (`teardown`: `TeardownLogic`) => `void` ; `createController`: <ControllerProps\>(`factory`: () => `Readonly`<`ControllerProps` & { `destroy`: () => `void` }\>) => `Readonly`<`ControllerProps` & { `destroy`: () => `void` }\> ; `createEffect`: <Event, Result, ErrorType\>(`handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\>) => `Readonly`<`Readonly`<{ `done$`: `Observable`<`Readonly`<{ `event`: `Event` ; `result`: `Result` }\>\> ; `error$`: `Observable`<[`EffectError`](README.md#effecterror)<`Event`, `ErrorType`\>\> ; `final$`: `Observable`<[`EffectNotification`](README.md#effectnotification)<`Event`, `Result`, `ErrorType`\>\> ; `pending`: `Readonly`<{ `get`: () => `boolean` ; `value$`: `Observable`<`boolean`\> }\> ; `pendingCount`: `Readonly`<{ `get`: () => `number` ; `value$`: `Observable`<`number`\> }\> ; `result$`: `Observable`<`Result`\> }\> & { `handle`: (`source`: [`Action`](README.md#action)<`Event`\> \| `Observable`<`Event`\> \| `Readonly`<{ `get`: () => `Event` ; `value$`: `Observable`<`Event`\> }\>) => `Subscription` } & { `destroy`: () => `void` }\> ; `handle`: <Event, Result, ErrorType\>(`source`: `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> \| `Readonly`<{ `get`: () => `Event` ; `value$`: `Observable`<`Event`\> }\>, `handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\>) => `Readonly`<`Readonly`<{ `done$`: `Observable`<`Readonly`<{ `event`: `Event` ; `result`: `Result` }\>\> ; `error$`: `Observable`<[`EffectError`](README.md#effecterror)<`Event`, `ErrorType`\>\> ; `final$`: `Observable`<[`EffectNotification`](README.md#effectnotification)<`Event`, `Result`, `ErrorType`\>\> ; `pending`: `Readonly`<{ `get`: () => `boolean` ; `value$`: `Observable`<`boolean`\> }\> ; `pendingCount`: `Readonly`<{ `get`: () => `number` ; `value$`: `Observable`<`number`\> }\> ; `result$`: `Observable`<`Result`\> }\> & { `handle`: (`source`: `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\> \| `Readonly`<{ `get`: () => `Event` ; `value$`: `Observable`<`Event`\> }\>) => `Subscription` } & { `destroy`: () => `void` }\> ; `onDestroy`: (`teardown`: () => `void`) => `void` ; `subscribe`: <T\>(`source`: `Observable`<`T`\>) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `next`: (`value`: `T`) => `void`) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `observer`: `Partial`<`Observer`<`T`\>\>) => `Subscription` ; `createStore`: <State\>(`initialState`: `State`, `options?`: `Readonly`<{ `comparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` ; `name?`: `string` ; `onDestroy?`: () => `void` }\>) => `Readonly`<`Readonly`<`Readonly`<{ `get`: () => `State` ; `value$`: `Observable`<`State`\> }\> & { `query`: `StoreQueryFn`<`State`\> }\> & { `id`: `number` ; `name?`: `string` ; `notify`: () => `void` ; `set`: (`state`: `State`) => `void` ; `update`: [`StoreUpdateFunction`](README.md#storeupdatefunction)<`State`\> } & { `destroy`: () => `void` }\> } & { `destroy`: () => `void` }\>, ...`params`: `Params`) => `Service` |

#### Returns

[`ViewControllerFactory`](README.md#viewcontrollerfactory)<`Service`, `Params`\>

#### Defined in

[packages/rx-effects/src/mvc.ts:69](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/mvc.ts#L69)

---

### mapQuery

▸ **mapQuery**<`T`, `R`\>(`query`, `mapper`): [`Query`](README.md#query)<`R`\>

Creates a new `Query` which maps a source value by the provided mapping
function.

#### Type parameters

| Name |
| :--- |
| `T`  |
| `R`  |

#### Parameters

| Name     | Type                                                             | Description  |
| :------- | :--------------------------------------------------------------- | :----------- |
| `query`  | `Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\> | source query |
| `mapper` | (`value`: `T`) => `R`                                            | value mapper |

#### Returns

[`Query`](README.md#query)<`R`\>

#### Defined in

[packages/rx-effects/src/queryMappers.ts:11](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/queryMappers.ts#L11)

---

### mergeQueries

▸ **mergeQueries**<`Values`, `Result`\>(`queries`, `merger`): [`Query`](README.md#query)<`Result`\>

Creates a new `Query` which takes the latest values from source queries
and merges them into a single value.

#### Type parameters

| Name     | Type                |
| :------- | :------------------ |
| `Values` | extends `unknown`[] |
| `Result` | `Result`            |

#### Parameters

| Name      | Type                                                            | Description    |
| :-------- | :-------------------------------------------------------------- | :------------- |
| `queries` | [...{ [K in string \| number \| symbol]: Readonly<Object\> }[]] | source queries |
| `merger`  | (...`values`: `Values`) => `Result`                             | value merger   |

#### Returns

[`Query`](README.md#query)<`Result`\>

#### Defined in

[packages/rx-effects/src/queryMappers.ts:25](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/queryMappers.ts#L25)

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

[packages/rx-effects/src/store.ts:78](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L78)

---

### pipeStore

▸ **pipeStore**<`T`\>(`store`, `operator`): [`StoreQuery`](README.md#storequery)<`T`\>

Creates a deferred or transformed view of the store.

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name       | Type                                                                                                                                                                                                                                                                                                                                      |
| :--------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `store`    | `Readonly`<`Readonly`<`Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\> & { `query`: `StoreQueryFn`<`T`\> }\> & { `id`: `number` ; `name?`: `string` ; `notify`: () => `void` ; `set`: (`state`: `T`) => `void` ; `update`: [`StoreUpdateFunction`](README.md#storeupdatefunction)<`T`\> } & { `destroy`: () => `void` }\> |
| `operator` | `MonoTypeOperatorFunction`<`T`\>                                                                                                                                                                                                                                                                                                          |

#### Returns

[`StoreQuery`](README.md#storequery)<`T`\>

#### Defined in

[packages/rx-effects/src/pipeStore.ts:7](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/pipeStore.ts#L7)

---

### queryBehaviourSubject

▸ **queryBehaviourSubject**<`T`\>(`source`): [`Query`](README.md#query)<`T`\>

Creates a query for the specified BehaviourSubject

**`Example`**

```ts
const source = new BehaviourSubject(1);
const query = queryBehaviourSubject(source);

const result = compute((get) => get(query) + 1);

expect(result.get()).toBe(2);
```

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name     | Type                    |
| :------- | :---------------------- |
| `source` | `BehaviorSubject`<`T`\> |

#### Returns

[`Query`](README.md#query)<`T`\>

#### Defined in

[packages/rx-effects/src/queryUtils.ts:17](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/queryUtils.ts#L17)

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

[packages/rx-effects/src/storeExtensions.ts:13](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/storeExtensions.ts#L13)

---

### withStoreUpdates

▸ **withStoreUpdates**<`State`, `Updates`\>(`store`, `updates`): [`StoreWithUpdates`](README.md#storewithupdates)<`State`, `Updates`\>

Creates a proxy for the store with "updates" to change a state by provided mutations

#### Type parameters

| Name      | Type                                                                                                                                                                                                                                    |
| :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `State`   | `State`                                                                                                                                                                                                                                 |
| `Updates` | extends `Readonly`<`Record`<`string`, (...`args`: `any`[]) => [`StateMutation`](README.md#statemutation)<`State`\>\>\> = `Readonly`<`Record`<`string`, (...`args`: `any`[]) => [`StateMutation`](README.md#statemutation)<`State`\>\>\> |

#### Parameters

| Name      | Type                                                                                                                                                                                                                                                                                                                                                          |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `store`   | `Readonly`<`Readonly`<`Readonly`<{ `get`: () => `State` ; `value$`: `Observable`<`State`\> }\> & { `query`: `StoreQueryFn`<`State`\> }\> & { `id`: `number` ; `name?`: `string` ; `notify`: () => `void` ; `set`: (`state`: `State`) => `void` ; `update`: [`StoreUpdateFunction`](README.md#storeupdatefunction)<`State`\> } & { `destroy`: () => `void` }\> |
| `updates` | `Updates`                                                                                                                                                                                                                                                                                                                                                     |

#### Returns

[`StoreWithUpdates`](README.md#storewithupdates)<`State`, `Updates`\>

#### Defined in

[packages/rx-effects/src/store.ts:335](https://github.com/mnasyrov/rx-effects/blob/0866ae4/packages/rx-effects/src/store.ts#L335)
