rx-effects

# rx-effects

## Table of contents

### Type aliases

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

[packages/rx-effects/src/action.ts:22](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/action.ts#L22)

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

[packages/rx-effects/src/controller.ts:16](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/controller.ts#L16)

---

### Effect

Ƭ **Effect**<`Event`, `Result`, `ErrorType`\>: [`Controller`](README.md#controller)<[`EffectState`](README.md#effectstate)<`Event`, `Result`, `ErrorType`\> & { `handle`: (`source`: [`Action`](README.md#action)<`Event`\> \| `Observable`<`Event`\>, `options?`: `Readonly`<{ `onSourceCompleted?`: () => `void` ; `onSourceFailed?`: (`error`: `ErrorType`) => `void` }\>) => `Subscription` }\>

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

[packages/rx-effects/src/effect.ts:105](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/effect.ts#L105)

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

[packages/rx-effects/src/effect.ts:76](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/effect.ts#L76)

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

[packages/rx-effects/src/effect.ts:41](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/effect.ts#L41)

---

### EffectOptions

Ƭ **EffectOptions**<`Event`, `Result`\>: `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\>

#### Type parameters

| Name     |
| :------- |
| `Event`  |
| `Result` |

#### Defined in

[packages/rx-effects/src/effect.ts:87](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/effect.ts#L87)

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

[packages/rx-effects/src/effect.ts:80](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/effect.ts#L80)

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

[packages/rx-effects/src/effect.ts:56](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/effect.ts#L56)

---

### ExternalScope

Ƭ **ExternalScope**: `Omit`<[`Scope`](README.md#scope), `"destroy"`\>

`ExternalScope` and `Scope` types allow to distinct which third-party code can invoke `destroy()` method.

#### Defined in

[packages/rx-effects/src/scope.ts:70](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/scope.ts#L70)

---

### HandlerOptions

Ƭ **HandlerOptions**<`ErrorType`\>: `Readonly`<{ `onSourceCompleted?`: () => `void` ; `onSourceFailed?`: (`error`: `ErrorType`) => `void` }\>

Options for handling an action or observable.

#### Type parameters

| Name        | Type    |
| :---------- | :------ |
| `ErrorType` | `Error` |

#### Defined in

[packages/rx-effects/src/effect.ts:48](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/effect.ts#L48)

---

### Query

Ƭ **Query**<`T`\>: `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\>

Provider for a value of a state.

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Defined in

[packages/rx-effects/src/queries/query.ts:6](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/queries/query.ts#L6)

---

### QueryOptions

Ƭ **QueryOptions**<`T`, `K`\>: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>

Options for processing the query result

**`property`** distinct Enables distinct results

**`property`** distinct.comparator Custom comparator for values. Strict equality `===` is used by default.

**`property`** distinct.keySelector Getter for keys of values to compare. Values itself are used for comparing by default.

#### Type parameters

| Name |
| :--- |
| `T`  |
| `K`  |

#### Defined in

[packages/rx-effects/src/queries/query.ts:21](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/queries/query.ts#L21)

---

### Scope

Ƭ **Scope**: [`Controller`](README.md#controller)<{ `add`: (`teardown`: `TeardownLogic`) => `void` ; `createController`: <ControllerProps\>(`factory`: () => `Readonly`<{ `destroy`: () => `void` } & `ControllerProps`\>) => `Readonly`<{ `destroy`: () => `void` } & `ControllerProps`\> ; `createDeclaredStore`: <State\>(`stateDeclaration`: `Readonly`<{ `createState`: [`StateFactory`](README.md#statefactory)<`State`\> ; `initialState`: `State` ; `name?`: `string` ; `createStore`: (`initialState?`: `Partial`<`State`\>) => `Readonly`<`Readonly`<`Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> & { `id`: `number` ; `name?`: `string` ; `asQuery`: () => `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> ; `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Observable`<`R`\> }\> & `Readonly`<{ `destroy`: () => `void` } & { `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| readonly (`undefined` \| `null` \| `false` \| [`StateMutation`](README.md#statemutation)<`State`\>)[]) => `void` }\>\> ; `createStoreActions`: <Mutations\>(`store`: `Readonly`<`Readonly`<`Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> & { `id`: `number` ; `name?`: `string` ; `asQuery`: () => `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> ; `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Observable`<`R`\> }\> & `Readonly`<{ `destroy`: () => `void` } & { `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| readonly (`undefined` \| `null` \| `false` \| [`StateMutation`](README.md#statemutation)<`State`\>)[]) => `void` }\>\>, `mutations`: `Mutations`) => [`StoreActions`](README.md#storeactions)<`State`, `Mutations`\><Mutations\>(`mutations`: `Mutations`) => [`StoreActionsFactory`](README.md#storeactionsfactory)<`State`, `Mutations`\> }\>, `initialState?`: `Partial`<`State`\>) => `Readonly`<`Readonly`<`Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> & { `id`: `number` ; `name?`: `string` ; `asQuery`: () => `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> ; `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Observable`<`R`\> }\> & `Readonly`<{ `destroy`: () => `void` } & { `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| readonly (`undefined` \| `null` \| `false` \| [`StateMutation`](README.md#statemutation)<`State`\>)[]) => `void` }\>\> ; `createEffect`: <Event, Result, ErrorType\>(`handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>) => `Readonly`<{ `destroy`: () => `void` } & `Readonly`<{ `done$`: `Observable`<{ `event`: `Event` ; `result`: `Result` }\> ; `error$`: `Observable`<{ `error`: `ErrorType` ; `event`: `Event` }\> ; `final$`: `Observable`<`Event`\> ; `pending`: [`Query`](README.md#query)<`boolean`\> ; `pendingCount`: [`Query`](README.md#query)<`number`\> ; `result$`: `Observable`<`Result`\> }\> & { `handle`: (`source`: [`Action`](README.md#action)<`Event`\> \| `Observable`<`Event`\>, `options?`: `Readonly`<{ `onSourceCompleted?`: () => `void` ; `onSourceFailed?`: (`error`: `ErrorType`) => `void` }\>) => `Subscription` }\> ; `createStore`: <State\>(`initialState`: `State`, `options?`: `Readonly`<{ `internal?`: `boolean` ; `name?`: `string` ; `stateComparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` }\>) => `Readonly`<`Readonly`<`Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> & { `id`: `number` ; `name?`: `string` ; `asQuery`: () => `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> ; `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Observable`<`R`\> }\> & `Readonly`<{ `destroy`: () => `void` } & { `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| readonly (`undefined` \| `null` \| `false` \| [`StateMutation`](README.md#statemutation)<`State`\>)[]) => `void` }\>\> ; `handleAction`: <Event, Result, ErrorType\>(`source`: `Observable`<`Event`\> \| [`Action`](README.md#action)<`Event`\>, `handler`: [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>, `options?`: `Readonly`<{ `onSourceCompleted?`: () => `void` ; `onSourceFailed?`: (`error`: `ErrorType`) => `void` }\>) => `Readonly`<{ `destroy`: () => `void` } & `Readonly`<{ `done$`: `Observable`<{ `event`: `Event` ; `result`: `Result` }\> ; `error$`: `Observable`<{ `error`: `ErrorType` ; `event`: `Event` }\> ; `final$`: `Observable`<`Event`\> ; `pending`: [`Query`](README.md#query)<`boolean`\> ; `pendingCount`: [`Query`](README.md#query)<`number`\> ; `result$`: `Observable`<`Result`\> }\> & { `handle`: (`source`: [`Action`](README.md#action)<`Event`\> \| `Observable`<`Event`\>, `options?`: `Readonly`<{ `onSourceCompleted?`: () => `void` ; `onSourceFailed?`: (`error`: `ErrorType`) => `void` }\>) => `Subscription` }\> }\>

A controller-like boundary for effects and business logic.

`Scope` collects all subscriptions which are made by child entities and provides
`destroy()` method to unsubscribe from them.

#### Defined in

[packages/rx-effects/src/scope.ts:15](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/scope.ts#L15)

---

### StateDeclaration

Ƭ **StateDeclaration**<`State`\>: `Readonly`<{ `createState`: [`StateFactory`](README.md#statefactory)<`State`\> ; `initialState`: `State` ; `name?`: `string` ; `createStore`: (`initialState?`: `Partial`<`State`\>) => `Readonly`<`Readonly`<`Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> & { `id`: `number` ; `name?`: `string` ; `asQuery`: () => `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> ; `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Observable`<`R`\> }\> & `Readonly`<{ `destroy`: () => `void` } & { `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| readonly (`undefined` \| `null` \| `false` \| [`StateMutation`](README.md#statemutation)<`State`\>)[]) => `void` }\>\> ; `createStoreActions`: <Mutations\>(`store`: `Readonly`<`Readonly`<`Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> & { `id`: `number` ; `name?`: `string` ; `asQuery`: () => `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> ; `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Observable`<`R`\> }\> & `Readonly`<{ `destroy`: () => `void` } & { `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| readonly (`undefined` \| `null` \| `false` \| [`StateMutation`](README.md#statemutation)<`State`\>)[]) => `void` }\>\>, `mutations`: `Mutations`) => [`StoreActions`](README.md#storeactions)<`State`, `Mutations`\><Mutations\>(`mutations`: `Mutations`) => [`StoreActionsFactory`](README.md#storeactionsfactory)<`State`, `Mutations`\> }\>

Declaration of a state.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/stateDeclaration.ts:18](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/stateDeclaration.ts#L18)

---

### StateDeclarationOptions

Ƭ **StateDeclarationOptions**<`State`\>: `Readonly`<{ `internal?`: `boolean` ; `name?`: `string` ; `stateComparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` }\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/stateDeclaration.ts:42](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/stateDeclaration.ts#L42)

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

[packages/rx-effects/src/stateDeclaration.ts:13](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/stateDeclaration.ts#L13)

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

[packages/rx-effects/src/stateMutation.ts:19](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/stateMutation.ts#L19)

---

### StateMutationMetadata

Ƭ **StateMutationMetadata**: `Readonly`<{ `name?`: `string` }\>

#### Defined in

[packages/rx-effects/src/storeMetadata.ts:7](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/storeMetadata.ts#L7)

---

### StateMutations

Ƭ **StateMutations**<`State`\>: `Readonly`<`Record`<`string`, (...`args`: `any`[]) => [`StateMutation`](README.md#statemutation)<`State`\>\>\>

A record of state mutations.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/stateMutation.ts:24](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/stateMutation.ts#L24)

---

### StateQuery

Ƭ **StateQuery**<`T`\>: [`Query`](README.md#query)<`T`\>

**`deprecated`** Deprecated, use `Query` type.

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Defined in

[packages/rx-effects/src/queries/query.ts:33](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/queries/query.ts#L33)

---

### StateQueryOptions

Ƭ **StateQueryOptions**<`T`, `K`\>: [`QueryOptions`](README.md#queryoptions)<`T`, `K`\>

**`deprecated`** Deprecated, use `QueryOptions` type.

#### Type parameters

| Name |
| :--- |
| `T`  |
| `K`  |

#### Defined in

[packages/rx-effects/src/queries/query.ts:38](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/queries/query.ts#L38)

---

### StateReader

Ƭ **StateReader**<`State`\>: `Readonly`<[`Query`](README.md#query)<`State`\> & { `id`: `number` ; `name?`: `string` ; `asQuery`: () => `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> ; `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Observable`<`R`\> }\>

Read-only type of the state store.

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/store.ts:14](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/store.ts#L14)

---

### Store

Ƭ **Store**<`State`\>: `Readonly`<[`StateReader`](README.md#statereader)<`State`\> & [`Controller`](README.md#controller)<{ `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| readonly (`undefined` \| `null` \| `false` \| [`StateMutation`](README.md#statemutation)<`State`\>)[]) => `void` }\>\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/store.ts:56](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/store.ts#L56)

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

[packages/rx-effects/src/storeActions.ts:6](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/storeActions.ts#L6)

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

[packages/rx-effects/src/storeActions.ts:9](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/storeActions.ts#L9)

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

[packages/rx-effects/src/storeActions.ts:13](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/storeActions.ts#L13)

---

### StoreEvent

Ƭ **StoreEvent**<`State`\>: { `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"created"` } \| { `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"destroyed"` } \| { `mutation`: [`StateMutation`](README.md#statemutation)<`State`\> ; `nextState`: `State` ; `prevState`: `State` ; `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"mutation"` } \| { `nextState`: `State` ; `prevState`: `State` ; `store`: [`Store`](README.md#store)<`State`\> ; `type`: `"updated"` }

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/storeEvents.ts:5](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/storeEvents.ts#L5)

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

[packages/rx-effects/src/storeExtensions.ts:9](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/storeExtensions.ts#L9)

---

### StoreOptions

Ƭ **StoreOptions**<`State`\>: `Readonly`<{ `internal?`: `boolean` ; `name?`: `string` ; `stateComparator?`: (`prevState`: `State`, `nextState`: `State`) => `boolean` }\>

#### Type parameters

| Name    |
| :------ |
| `State` |

#### Defined in

[packages/rx-effects/src/store.ts:75](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/store.ts#L75)

## Variables

### GLOBAL_EFFECT_UNHANDLED_ERROR$

• **GLOBAL_EFFECT_UNHANDLED_ERROR$**: `Observable`<{ `error`: `unknown` ; `event`: `unknown` }\>

#### Defined in

[packages/rx-effects/src/effect.ts:25](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/effect.ts#L25)

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

[packages/rx-effects/src/utils.ts:8](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/utils.ts#L8)

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

[packages/rx-effects/src/action.ts:29](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/action.ts#L29)

---

### createEffect

▸ **createEffect**<`Event`, `Result`, `ErrorType`\>(`handler`, `options?`): [`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

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

| Name       | Type                                                                                           |
| :--------- | :--------------------------------------------------------------------------------------------- |
| `handler`  | [`EffectHandler`](README.md#effecthandler)<`Event`, `Result`\>                                 |
| `options?` | `Readonly`<{ `pipeline?`: [`EffectPipeline`](README.md#effectpipeline)<`Event`, `Result`\> }\> |

#### Returns

[`Effect`](README.md#effect)<`Event`, `Result`, `ErrorType`\>

#### Defined in

[packages/rx-effects/src/effect.ts:128](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/effect.ts#L128)

---

### createScope

▸ **createScope**(): [`Scope`](README.md#scope)

Creates `Scope` instance.

#### Returns

[`Scope`](README.md#scope)

#### Defined in

[packages/rx-effects/src/scope.ts:75](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/scope.ts#L75)

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

[packages/rx-effects/src/store.ts:91](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/store.ts#L91)

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

| Name        | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `store`     | `Readonly`<`Readonly`<`Readonly`<{ `value$`: `Observable`<`State`\> ; `get`: () => `T` }\> & { `id`: `number` ; `name?`: `string` ; `asQuery`: () => `Readonly`<{ `value$`: `Observable`<`State`\> ; `get`: () => `T` }\> ; `query`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Readonly`<{ `value$`: `Observable`<`R`\> ; `get`: () => `T` }\> ; `select`: <R, K\>(`selector`: (`state`: `State`) => `R`, `options?`: `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\>) => `Observable`<`R`\> }\> & `Readonly`<{ `destroy`: () => `void` } & { `set`: (`state`: `State`) => `void` ; `update`: (`mutation`: [`StateMutation`](README.md#statemutation)<`State`\> \| readonly (`undefined` \| `null` \| `false` \| [`StateMutation`](README.md#statemutation)<`State`\>)[]) => `void` }\>\> |
| `mutations` | `Mutations`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

#### Returns

[`StoreActions`](README.md#storeactions)<`State`, `Mutations`\>

#### Defined in

[packages/rx-effects/src/storeActions.ts:19](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/storeActions.ts#L19)

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

[packages/rx-effects/src/storeActions.ts:25](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/storeActions.ts#L25)

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

[packages/rx-effects/src/storeLoggerExtension.ts:3](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/storeLoggerExtension.ts#L3)

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

[packages/rx-effects/src/stateDeclaration.ts:58](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/stateDeclaration.ts#L58)

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

[packages/rx-effects/src/handleAction.ts:8](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/handleAction.ts#L8)

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
| `query`    | `Readonly`<{ `value$`: `Observable`<`T`\> ; `get`: () => `T` }\>                                                                                     | source query                            |
| `mapper`   | (`value`: `T`) => `R`                                                                                                                                | value mapper                            |
| `options?` | `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\> | options for processing the result value |

#### Returns

[`Query`](README.md#query)<`R`\>

#### Defined in

[packages/rx-effects/src/queries/queryMappers.ts:14](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/queries/queryMappers.ts#L14)

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

| Name       | Type                                                                                                                                                 | Description                             |
| :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| `queries`  | [...{ [K in string \| number \| symbol]: Readonly<Object\> }[]]                                                                                      | source queries                          |
| `merger`   | (...`values`: `Values`) => `Result`                                                                                                                  | value merger                            |
| `options?` | `Readonly`<{ `distinct?`: `boolean` \| { `comparator?`: (`previous`: `K`, `current`: `K`) => `boolean` ; `keySelector?`: (`value`: `T`) => `K` } }\> | options for processing the result value |

#### Returns

[`Query`](README.md#query)<`Result`\>

#### Defined in

[packages/rx-effects/src/queries/queryMappers.ts:39](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/queries/queryMappers.ts#L39)

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

[packages/rx-effects/src/stateMutation.ts:33](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/stateMutation.ts#L33)

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

[packages/rx-effects/src/storeExtensions.ts:13](https://github.com/mnasyrov/rx-effects/blob/718c5a2/packages/rx-effects/src/storeExtensions.ts#L13)
