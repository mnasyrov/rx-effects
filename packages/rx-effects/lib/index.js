import { Subject, BehaviorSubject, Subscription, merge, identity, Observable } from 'rxjs';
import { distinctUntilChanged, shareReplay, map, withLatestFrom } from 'rxjs/operators';

function createAction() {
    const source$ = new Subject();
    const emitter = (event) => source$.next(event);
    emitter.event$ = source$.asObservable();
    return emitter;
}

function createStateStore(initialState, stateCompare = Object.is) {
    const store$ = new BehaviorSubject(initialState);
    const state$ = store$.pipe(distinctUntilChanged(stateCompare), shareReplay({ refCount: true, bufferSize: 1 }));
    return {
        value$: state$,
        get() {
            return store$.value;
        },
        set(nextState) {
            store$.next(nextState);
        },
        update(mutation) {
            const prevState = store$.value;
            const nextState = mutation(prevState);
            store$.next(nextState);
        },
        select(selector, valueCompare = Object.is) {
            return state$.pipe(map(selector), distinctUntilChanged(valueCompare));
        },
        query(selector, valueCompare = Object.is) {
            return {
                get: () => selector(store$.value),
                value$: this.select(selector, valueCompare),
            };
        },
    };
}

function createEffect(handler, scopeSubscriptions) {
    const subscriptions = new Subscription();
    if (scopeSubscriptions) {
        scopeSubscriptions.add(subscriptions);
    }
    const done$ = new Subject();
    const error$ = new Subject();
    const pendingCount = createStateStore(0);
    const increaseCount = (count) => count + 1;
    const decreaseCount = (count) => count - 1;
    function executePromise(event, promise) {
        promise
            .then((result) => {
            pendingCount.update(decreaseCount);
            done$.next({ event, result });
        })
            .catch((error) => {
            pendingCount.update(decreaseCount);
            error$.next({ event, error });
        });
    }
    function executeObservable(event, observable) {
        observable.subscribe({
            next: (result) => {
                pendingCount.update(decreaseCount);
                done$.next({ event, result });
            },
            error: (error) => {
                pendingCount.update(decreaseCount);
                error$.next({ event, error });
            },
        });
    }
    function execute(event) {
        pendingCount.update(increaseCount);
        try {
            const handlerResult = handler(event);
            if (handlerResult) {
                if ('then' in handlerResult) {
                    executePromise(event, handlerResult);
                    return;
                }
                if (handlerResult instanceof Observable) {
                    executeObservable(event, handlerResult);
                    return;
                }
            }
            pendingCount.update(decreaseCount);
            done$.next({ event, result: handlerResult });
        }
        catch (error) {
            pendingCount.update(decreaseCount);
            error$.next({ event, error });
        }
    }
    const observer = {
        next: (event) => execute(event),
        error: (error) => {
            done$.error(error);
            error$.error(error);
        },
        complete: () => {
            done$.complete();
            error$.complete();
        },
    };
    function handle(source) {
        const observable = source instanceof Observable ? source : source.event$;
        const subscription = observable.subscribe(observer);
        subscriptions.add(subscription);
        return subscription;
    }
    return {
        done$: done$.asObservable(),
        result$: done$.pipe(map(({ result }) => result)),
        error$: error$.asObservable(),
        final$: merge(done$, error$).pipe(map(({ event }) => event)),
        pending: pendingCount.query((count) => count > 0),
        pendingCount: pendingCount.query(identity),
        handle,
        destroy: () => subscriptions.unsubscribe(),
    };
}

function createEffectScope() {
    const subscriptions = new Subscription();
    return {
        add: (teardown) => subscriptions.add(teardown),
        destroy: () => subscriptions.unsubscribe(),
        createEffect: (handler) => createEffect(handler, subscriptions),
    };
}

function declareState(stateFactory, stateCompare) {
    const initialState = stateFactory();
    const storeFactory = (state = initialState) => createStateStore(state, stateCompare);
    return {
        initialState,
        createState: stateFactory,
        createStore: storeFactory,
    };
}

function pipeStateMutations(mutations) {
    return (state) => mutations.reduce((nextState, mutation) => mutation(nextState), state);
}

function mapStateQuery(query, mapper) {
    return {
        get: () => mapper(query.get()),
        value$: query.value$.pipe(map(mapper)),
    };
}

function createUpdateStoreEffect(store, reducer) {
    return createEffect((event) => store.update((state) => reducer(state, event)));
}
function createResetStoreEffect(store, nextState) {
    return createEffect(() => store.set(nextState));
}
function withStore(action, store) {
    const observable = action instanceof Observable ? action : action.event$;
    return observable.pipe(withLatestFrom(store.value$));
}
function withQuery(action, query) {
    const observable = action instanceof Observable ? action : action.event$;
    return observable.pipe(withLatestFrom(query.value$));
}

export { createAction, createEffect, createEffectScope, createResetStoreEffect, createStateStore, createUpdateStoreEffect, declareState, mapStateQuery, pipeStateMutations, withQuery, withStore };
//# sourceMappingURL=index.js.map
