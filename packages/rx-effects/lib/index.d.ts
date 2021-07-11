import { Observable, Subscription, TeardownLogic } from "rxjs";
type Action<Event> = {
    readonly event$: Observable<Event>;
    // TODO: Check typings
    (): void;
    (event: Event): void;
};
declare function createAction<Event>(): Action<Event>;
type StateQuery<T> = Readonly<{
    get: () => T;
    value$: Observable<T>;
}>;
declare function mapStateQuery<T, R>(query: StateQuery<T>, mapper: (value: T) => R): StateQuery<R>;
type Effect<Event, Result = void, ErrorType = Error> = Readonly<{
    result$: Observable<Result>;
    done$: Observable<{
        event: Event;
        result: Result;
    }>;
    error$: Observable<{
        event: Event;
        error: ErrorType;
    }>;
    final$: Observable<Event>;
    pending: StateQuery<boolean>;
    pendingCount: StateQuery<number>;
    handle: ((event$: Observable<Event>) => Subscription) & ((action: Action<Event>) => Subscription);
    destroy: () => void;
}>;
type EffectHandler<Event, Result> = (event: Event) => Result | Promise<Result> | Observable<Result>;
declare function createEffect<Event, Result = void, ErrorType = Error>(handler: EffectHandler<Event, Result>, scopeSubscriptions?: Subscription): Effect<Event, Result, ErrorType>;
type EffectScope = Readonly<{
    add: (teardown: TeardownLogic) => void;
    destroy: () => void;
    createEffect: <Event, Result = void, ErrorType = Error>(handler: EffectHandler<Event, Result>) => Effect<Event, Result, ErrorType>;
}>;
declare function createEffectScope(): EffectScope;
type StateMutation<State> = (state: State) => State;
declare function pipeStateMutations<State>(mutations: Array<StateMutation<State>>): StateMutation<State>;
type StateReader<State> = Readonly<StateQuery<State> & {
    select: <R>(selector: (state: State) => R, compare?: (v1: R, v2: R) => boolean) => Observable<R>;
    query: <R>(selector: (state: State) => R, compare?: (v1: R, v2: R) => boolean) => StateQuery<R>;
}>;
type StateStore<State> = Readonly<StateReader<State> & {
    set: (state: State) => void;
    update: (mutation: StateMutation<State>) => void;
}>;
declare function createStateStore<State>(initialState: State, stateCompare?: (s1: State, s2: State) => boolean): StateStore<State>;
type StateFactory<State extends object> = (values?: Partial<State>) => State;
type StateDeclaration<State extends object> = {
    initialState: State;
    createState: StateFactory<State>;
    createStore: (initialState?: State) => StateStore<State>;
};
declare function declareState<State extends object>(stateFactory: StateFactory<State>, stateCompare?: (s1: State, s2: State) => boolean): StateDeclaration<State>;
declare function createUpdateStoreEffect<Event, State>(store: StateStore<State>, reducer: (state: State, event: Event) => State): Effect<Event>;
declare function createResetStoreEffect<State>(store: StateStore<State>, nextState: State): Effect<void>;
declare function withStore<Event, State>(action: Observable<Event> | Action<Event>, store: StateStore<State>): Observable<[
    Event,
    State
]>;
declare function withQuery<Event, Value>(action: Observable<Event> | Action<Event>, query: StateQuery<Value>): Observable<[
    Event,
    Value
]>;
export { Action, createAction, Effect, EffectHandler, createEffect, EffectScope, createEffectScope, StateFactory, StateDeclaration, declareState, StateMutation, pipeStateMutations, StateQuery, mapStateQuery, StateReader, StateStore, createStateStore, createUpdateStoreEffect, createResetStoreEffect, withStore, withQuery };
