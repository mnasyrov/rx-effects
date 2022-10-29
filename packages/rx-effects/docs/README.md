rx-effects

# rx-effects

## Table of contents

### Type Aliases

- [Action](README.md#action)
- [Controller](README.md#controller)
- [Effect](README.md#effect)
- [EffectEventProject](README.md#effecteventproject)
- [EffectHandler](README.md#effecthandler)
- [EffectOptions](README.md#effectoptions)
- [EffectPipeline](README.md#effectpipeline)
- [EffectState](README.md#effectstate)
- [ExternalScope](README.md#externalscope)
- [HandlerOptions](README.md#handleroptions)
- [Query](README.md#query)
- [QueryOptions](README.md#queryoptions)
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

### Variables

- [GLOBAL_EFFECT_UNHANDLED_ERROR$](README.md#global_effect_unhandled_error$)

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

## Type Aliases

### Action

Ƭ **Action**<`Event`\>: (`event`: `Event`) => `void` & `Event` extends `undefined` \| `void` ? (`event?`: `Event`) => `void` : (`event`: `Event`) => `void`

Action is an event emitter

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

[packages/rx-effects/src/action.ts:22](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/action.ts#L22)

---

### Controller

Ƭ **Controller**<`ControllerProps`\>: `Readonly`<{ `destroy`: () => `void` } & `ControllerProps`\>

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

| Name              | Type                  |
| :---------------- | :-------------------- |
| `ControllerProps` | extends `Object` = {} |

#### Defined in

[packages/rx-effects/src/controller.ts:16](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/controller.ts#L16)

---

### Effect

Ƭ **Effect**<`Event`, `Result`, `ErrorType`\>: [`Controller`](README.md#controller)<[`EffectState`](README.md#effectstate)<`Event`, `Result`, `ErrorType`\> & { `handle`: (`source`: [`Action`](README.md#action)<`Event`\> \| `Observable`<`Event`\>, `options?`: [`HandlerOptions`](README.md#handleroptions)<`ErrorType`\>) => `Subscription` }\>

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

[packages/rx-effects/src/effect.ts:110](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/effect.ts#L110)

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

[packages/rx-effects/src/effect.ts:81](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/effect.ts#L81)

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

[packages/rx-effects/src/effect.ts:41](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/effect.ts#L41)

---

### EffectOptions

Ƭ **EffectOptions**<`Event`, `Result`\>: `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\>

#### Type parameters

| Name     |
| :------- |
| `Event`  |
| `Result` |

#### Defined in

[packages/rx-effects/src/effect.ts:92](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/effect.ts#L92)

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

[packages/rx-effects/src/effect.ts:85](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/effect.ts#L85)

---

### EffectState

Ƭ **EffectState**<`Event`, `Result`, `ErrorType`\>: `Readonly`<{ `done$`: `Observable`<{ `event`: `Event` ; `result`: `Result` }\> ; `error$`: `Observable`<{ `error`: `ErrorType` ; `event`: `Event` }\> ; `final$`: `Observable`<`Event`\> ; `pending`: [`Query`](README.md#query)<`boolean`\> ; `pendingCount`: [`Query`](README.md#query)<`number`\> ; `result$`: `Observable`<`Result`\> }\>

Details about performing the effect.

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `Event`     | `Event` |
| `Result`    | `void`  |
| `ErrorType` | `Error` |

#### Defined in

[packages/rx-effects/src/effect.ts:61](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/effect.ts#L61)

---

### ExternalScope

Ƭ **ExternalScope**: `Omit`<[`Scope`](README.md#scope), `"destroy"`\>

`ExternalScope` and `Scope` types allow to distinct which third-party code can invoke `destroy()` method.

#### Defined in

[packages/rx-effects/src/scope.ts:109](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/scope.ts#L109)

---

### HandlerOptions

Ƭ **HandlerOptions**<`ErrorType`\>: `Readonly`<{ `onSourceCompleted?`: () => `void` ; `onSourceFailed?`: (`error`: `ErrorType`) => `void` }\>

Options for handling an action or observable.

**`Deprecated`**

Will be removed at 0.8 version.

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `ErrorType` | `Error` |

#### Defined in

[packages/rx-effects/src/effect.ts:50](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/effect.ts#L50)

---

### Query

Ƭ **Query**<`T`\>: `Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\>

Provider for a value of a state.

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Defined in

[packages/rx-effects/src/queries/query.ts:6](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/queries/query.ts#L6)

---

### QueryOptions

Ƭ **QueryOptions**<`T`, `K`\>: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>

Options for processing the query result

**`Property`**

Enables distinct results

**`Property`**

Custom comparator for values. Strict equality `===` is used by default.

**`Property`**

Getter for keys of values to compare. Values itself are used for comparing by default.

#### Type parameters

| Name |
| :--- |
| `T`  |
| `K`  |

#### Defined in

[packages/rx-effects/src/queries/query.ts:21](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/queries/query.ts#L21)

---

### Scope

Ƭ **Scope**: [`Controller`](README.md#controller)<{ `add`: (`teardown`: `TeardownLogic`) => `void` ; `createController`: <ControllerProps\>(`factory`: () => [`Controller`](README.md#controller)<`ControllerProps`\>) => [`Controller`](README.md#controller)<`ControllerProps`\> ; `createEffect`: <Event, Result, ErrorType\>(`handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>) => [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\> ; `handleAction`: <Event, Result, ErrorType\>(`source`: `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\>, `handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: [`HandlerOptions`](README.md#handleroptions)<`ErrorType`\> & [`EffectOptions`](README.md#effectoptions)<`Event`, `Result`\>) => [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\> ; `handleQuery`: <Value, Result, ErrorType\>(`query`: [`Query`](README.md#query)<`Value`\>, `handler`: [`EffectHandler`](README.md#effecthandler)<`Value`, `Result`\>, `options?`: [`EffectOptions`](README.md#effectoptions)<`Value`, `Result`\>) => [`Effect`](README.md#effect)<`Value`, `Result`, `ErrorType`\> ; `observe`: <T\>(`source`: `Observable`<`T`\>) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `next`: (`value`: `T`) => `void`) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `observer`: `Partial`<`Observer`<`T`\>\>) => `Subscription` ; `onDestroy`: (`teardown`: `TeardownLogic`) => `void` ; `subscribe`: <T\>(`source`: `Observable`<`T`\>) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `next`: (`value`: `T`) => `void`) => `Subscription`<T\>(`source`: `Observable`<`T`\>, `observer`: `Partial`<`Observer`<`T`\>\>) => `Subscription` ; `createDeclaredStore`: <State\>(`stateDeclaration`: `Readonly`<{ `createState`: [`StateFactory`](README.md#statefactory)<`State`\> ; `createStore`: (`initialState?`: `Partial`<`State`\>) => [`Store`](README.md#store)<`State`\> ; `initialState`: `State` ; `name?`: `string` ; `createStoreActions`: <Mutations\>(`store`: `Readonly`<`Readonly`<`Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\> & { `asQuery`: () => [`Query`](README.md#query)<`State`\> ; `id`: `number` ; `name?`: `string` ; `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: [`QueryOptions`](README.md#queryoptions)<`R`, `K`\>) => [`Query`](README.md#query)<`R`\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: [`QueryOptions`](README.md#queryoptions)<`R`, `K`\>) => `Observable`<`R`\> }\> & `Readonly`<{ `destroy`: () => `void` } & { `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| `ReadonlyArray`<[`StateMutation`](README.md#statemutation)<`State`\> \| `undefined` \| `null` \| `false`\>) => `void` }\>\>, `mutations`: `Mutations`) => [`StoreActions`](README.md#storeactions)<`State`, `Mutations`\><Mutations\>(`mutations`: `Mutations`) => [`StoreActionsFactory`](README.md#storeactionsfactory)<`State`, `Mutations`\> }\>, `initialState?`: `Partial`<`State`\>) => `Readonly`<`Readonly`<`Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\> & { `asQuery`: () => [`Query`](README.md#query)<`State`\> ; `id`: `number` ; `name?`: `string` ; `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: [`QueryOptions`](README.md#queryoptions)<`R`, `K`\>) => [`Query`](README.md#query)<`R`\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: [`QueryOptions`](README.md#queryoptions)<`R`, `K`\>) => `Observable`<`R`\> }\> & `Readonly`<{ `destroy`: () => `void` } & { `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| `ReadonlyArray`<[`StateMutation`](README.md#statemutation)<`State`\> \| `undefined` \| `null` \| `false`\>) => `void` }\>\> ; `createStore`: <State\>(`initialState`: `State`, `options?`: `Readonly`<{ `internal?`: `boolean` ; `name?`: `string` ; `stateComparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` }\>) => `Readonly`<`Readonly`<`Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\> & { `asQuery`: () => [`Query`](README.md#query)<`State`\> ; `id`: `number` ; `name?`: `string` ; `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: [`QueryOptions`](README.md#queryoptions)<`R`, `K`\>) => [`Query`](README.md#query)<`R`\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: [`QueryOptions`](README.md#queryoptions)<`R`, `K`\>) => `Observable`<`R`\> }\> & `Readonly`<{ `destroy`: () => `void` } & { `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| `ReadonlyArray`<[`StateMutation`](README.md#statemutation)<`State`\> \| `undefined` \| `null` \| `false`\>) => `void` }\>\> }\>

A controller-like boundary for effects and business logic.

`Scope` collects all subscriptions which are made by child entities and provides
`destroy()` method to unsubscribe from them.

#### Defined in

[packages/rx-effects/src/scope.ts:21](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/scope.ts#L21)

---

### StateDeclaration

Ƭ **StateDeclaration**<`State`\>: `Readonly`<{ `createState`: [`StateFactory`](README.md#statefactory)<`State`\> ; `createStore`: (`initialState?`: `Partial`<`State`\>) => [`Store`](README.md#store)<`State`\> ; `initialState`: `State` ; `name?`: `string` ; `createStoreActions`: <Mutations\>(`store`: `Readonly`<`Readonly`<`Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\> & { `asQuery`: () => [`Query`](README.md#query)<`State`\> ; `id`: `number` ; `name?`: `string` ; `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: [`QueryOptions`](README.md#queryoptions)<`R`, `K`\>) => [`Query`](README.md#query)<`R`\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: [`QueryOptions`](README.md#queryoptions)<`R`, `K`\>) => `Observable`<`R`\> }\> & `Readonly`<{ `destroy`: () => `void` } & { `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| `ReadonlyArray`<[`StateMutation`](README.md#statemutation)<`State`\> \| `undefined` \| `null` \| `false`\>) => `void` }\>\>, `mutations`: `Mutations`) => [`StoreActions`](README.md#storeactions)<`State`, `Mutations`\><Mutations\>(`mutations`: `Mutations`) => [`StoreActionsFactory`](README.md#storeactionsfactory)<`State`, `Mutations`\> }\>

Declaration of a state.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/stateDeclaration.ts:18](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/stateDeclaration.ts#L18)

---

### StateDeclarationOptions

Ƭ **StateDeclarationOptions**<`State`\>: `Readonly`<{ `internal?`: `boolean` ; `name?`: `string` ; `stateComparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` }\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/stateDeclaration.ts:42](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/stateDeclaration.ts#L42)

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

[packages/rx-effects/src/stateDeclaration.ts:13](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/stateDeclaration.ts#L13)

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

[packages/rx-effects/src/stateMutation.ts:19](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/stateMutation.ts#L19)

---

### StateMutationMetadata

Ƭ **StateMutationMetadata**: `Readonly`<{ `name?`: `string` }\>

#### Defined in

[packages/rx-effects/src/storeMetadata.ts:7](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/storeMetadata.ts#L7)

---

### StateMutations

Ƭ **StateMutations**<`State`\>: `Readonly`<`Record`<`string`, (...`args`: `any`[]) => [`StateMutation`](README.md#statemutation)<`State`\>\>\>

A record of state mutations.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/stateMutation.ts:24](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/stateMutation.ts#L24)

---

### StateQuery

Ƭ **StateQuery**<`T`\>: [`Query`](README.md#query)<`T`\>

**`Deprecated`**

Deprecated, use `Query` type. Will be removed at 0.8 version.

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Defined in

[packages/rx-effects/src/queries/query.ts:33](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/queries/query.ts#L33)

---

### StateQueryOptions

Ƭ **StateQueryOptions**<`T`, `K`\>: [`QueryOptions`](README.md#queryoptions)<`T`, `K`\>

**`Deprecated`**

Deprecated, use `QueryOptions` type. Will be removed at 0.8 version.

#### Type parameters

| Name |
| :--- |
| `T`  |
| `K`  |

#### Defined in

[packages/rx-effects/src/queries/query.ts:38](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/queries/query.ts#L38)

---

### StateReader

Ƭ **StateReader**<`State`\>: `Readonly`<[`Query`](README.md#query)<`State`\> & { `asQuery`: () => [`Query`](README.md#query)<`State`\> ; `id`: `number` ; `name?`: `string` ; `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: [`QueryOptions`](README.md#queryoptions)<`R`, `K`\>) => [`Query`](README.md#query)<`R`\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: [`QueryOptions`](README.md#queryoptions)<`R`, `K`\>) => `Observable`<`R`\> }\>

Read-only type of the state store.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/store.ts:14](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/store.ts#L14)

---

### Store

Ƭ **Store**<`State`\>: `Readonly`<[`StateReader`](README.md#statereader)<`State`\> & [`Controller`](README.md#controller)<{ `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| `ReadonlyArray`<[`StateMutation`](README.md#statemutation)<`State`\> \| `undefined` \| `null` \| `false`\>) => `void` }\>\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/store.ts:56](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/store.ts#L56)

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

[packages/rx-effects/src/storeActions.ts:6](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/storeActions.ts#L6)

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

[packages/rx-effects/src/storeActions.ts:9](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/storeActions.ts#L9)

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

[packages/rx-effects/src/storeActions.ts:13](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/storeActions.ts#L13)

---

### StoreEvent

Ƭ **StoreEvent**<`State`\>: { `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"created"` } \| { `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"destroyed"` } \| { `mutation`: [`StateMutation`](README.md#statemutation)<`State`\> ; `nextState`: `State` ; `prevState`: `State` ; `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"mutation"` } \| { `nextState`: `State` ; `prevState`: `State` ; `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"updated"` }

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/storeEvents.ts:5](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/storeEvents.ts#L5)

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

[packages/rx-effects/src/storeExtensions.ts:9](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/storeExtensions.ts#L9)

---

### StoreOptions

Ƭ **StoreOptions**<`State`\>: `Readonly`<{ `internal?`: `boolean` ; `name?`: `string` ; `stateComparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` }\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/store.ts:75](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/store.ts#L75)

## Variables

### GLOBAL_EFFECT_UNHANDLED_ERROR$

• `Const` **GLOBAL_EFFECT_UNHANDLED_ERROR$**: `Observable`<{ `error`: `unknown` ; `event`: `unknown` }\>

#### Defined in

[packages/rx-effects/src/effect.ts:25](https://github.com/mnasyrov/rx-effects/blob/4467782/packages/rx-effects/src/effect.ts#L25)

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

---

### createAction

▸ **createAction**<`Event`\>(): [`Action`](README.md#action)<`Event`\>

#### Type parameters

| Name    | Type   |
| :------ | :----- |
| `Event` | `void` |

#### Returns

[`Action`](README.md#action)<`Event`\>

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

---

### createScope

▸ **createScope**(): [`Scope`](README.md#scope)

Creates `Scope` instance.

#### Returns

[`Scope`](README.md#scope)

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

| Name        | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| :---------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `store`     | `Readonly`<`Readonly`<`Readonly`<{ `get`: () => `State` ; `value$`: `Observable`<`State`\> }\> & { `asQuery`: () => `Readonly`<{ `get`: () => `State` ; `value$`: `Observable`<`State`\> }\> ; `id`: `number` ; `name?`: `string` ; `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `R`) => `K` } }\>) => `Readonly`<{ `get`: () => `R` ; `value$`: `Observable`<`R`\> }\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `R`) => `K` } }\>) => `Observable`<`R`\> }\> & `Readonly`<{ `destroy`: () => `void` } & { `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| readonly (`undefined` \| `null` \| `false` \| [`StateMutation`](README.md#statemutation)<`State`\>)[]) => `void` }\>\> |
| `mutations` | `Mutations`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

#### Returns

[`StoreActions`](README.md#storeactions)<`State`, `Mutations`\>

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

---

### createStoreLoggerExtension

▸ **createStoreLoggerExtension**(`logger`): [`StoreExtension`](README.md#storeextension)<`unknown`\>

#### Parameters

| Name     | Type                                                        |
| :------- | :---------------------------------------------------------- |
| `logger` | (`message?`: `any`, ...`optionalParams`: `any`[]) => `void` |

#### Returns

[`StoreExtension`](README.md#storeextension)<`unknown`\>

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

---

### handleAction

▸ **handleAction**<`Event`, `Result`, `ErrorType`\>(`source`, `handler`, `options?`): [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

This helper creates `Effect` from `handler` and subscribes it to `source`.

**`Deprecated`**

This function will be removed at 0.8 version.

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `Event`     | `Event` |
| `Result`    | `void`  |
| `ErrorType` | `Error` |

#### Parameters

| Name       | Type                                                                                                                                                                                                       |
| :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`   | `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\>                                                                                                                                           |
| `handler`  | [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>                                                                                                                                             |
| `options?` | `Readonly`<{ `onSourceCompleted?`: () => `void` ; `onSourceFailed?`: (`error`: `ErrorType`) => `void` }\> & `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\> |

#### Returns

[`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

---

### mapQuery

▸ **mapQuery**<`T`, `R`, `K`\>(`query`, `mapper`, `options?`): [`Query`](README.md#query)<`R`\>

Creates a new `Query` which maps a source value by the provided mapping
function.

#### Type parameters

| Name | Type |
| :--- | :--- |
| `T`  | `T`  |
| `R`  | `R`  |
| `K`  | `R`  |

#### Parameters

| Name       | Type                                                                                                                                                 | Description                             |
| :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| `query`    | `Readonly`<{ `get`: () => `T` ; `value$`: `Observable`<`T`\> }\>                                                                                     | source query                            |
| `mapper`   | (`value`: `T`) => `R`                                                                                                                                | value mapper                            |
| `options?` | `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `R`) => `K` } }\> | options for processing the result value |

#### Returns

[`Query`](README.md#query)<`R`\>

---

### mergeQueries

▸ **mergeQueries**<`Values`, `Result`, `ResultKey`\>(`queries`, `merger`, `options?`): [`Query`](README.md#query)<`Result`\>

Creates a new `Query` which takes the latest values from source queries
and merges them into a single value.

#### Type parameters

| Name        | Type                |
| :---------- | :------------------ |
| `Values`    | extends `unknown`[] |
| `Result`    | `Result`            |
| `ResultKey` | `Result`            |

#### Parameters

| Name       | Type                                                                                                                                                                              | Description                             |
| :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| `queries`  | [...{ [K in string \| number \| symbol]: Readonly<Object\> }[]]                                                                                                                   | source queries                          |
| `merger`   | (...`values`: `Values`) => `Result`                                                                                                                                               | value merger                            |
| `options?` | `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `ResultKey`, `current`: `ResultKey`) => `boolean` ; `keySelector?`: (`value`: `Result`) => `ResultKey` } }\> | options for processing the result value |

#### Returns

[`Query`](README.md#query)<`Result`\>

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

---

### registerStoreExtension

▸ **registerStoreExtension**(`extension`): `Subscription`

#### Parameters

| Name        | Type                                                     |
| :---------- | :------------------------------------------------------- |
| `extension` | [`StoreExtension`](README.md#storeextension)<`unknown`\> |

#### Returns

`Subscription`
