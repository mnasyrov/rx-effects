import { Observable, Observer, Subscription, TeardownLogic } from 'rxjs';
import { Action } from './action';
import { Controller } from './controller';
import {
  createEffect,
  Effect,
  EffectHandler,
  EffectOptions,
  HandlerOptions,
} from './effect';
import { Query } from './queries';
import { StateDeclaration } from './stateDeclaration';
import { createStore, Store, StoreOptions } from './store';

/**
 * A controller-like boundary for effects and business logic.
 *
 * `Scope` collects all subscriptions which are made by child entities and provides
 * `destroy()` method to unsubscribe from them.
 */
export type Scope = Controller<{
  /**
   * Stores any subscription-like or teardown function to be called with
   * `destroy()` method.
   */
  add: (teardown: TeardownLogic) => void;

  /**
   * Creates a store which will be destroyed with the scope.
   *
   * @param initialState Initial state
   * @param options Parameters for the store
   */
  createStore<State>(
    initialState: State,
    options?: StoreOptions<State>,
  ): Store<State>;

  /**
   * Creates a store from its declaration which will be destroyed with the
   * scope.
   */
  createDeclaredStore<State>(
    stateDeclaration: StateDeclaration<State>,
    initialState?: Partial<State>,
  ): Store<State>;

  /**
   * Creates a controller which will be destroyed with the scope.
   */
  createController: <ControllerProps>(
    factory: () => Controller<ControllerProps>,
  ) => Controller<ControllerProps>;

  /**
   * Creates an effect which will be destroyed with the scope.
   */
  createEffect: <Event = void, Result = void, ErrorType = Error>(
    handler: EffectHandler<Event, Result>,
  ) => Effect<Event, Result, ErrorType>;

  /**
   * Creates an effect which handles `source` by `handler`, and it will be
   * destroyed with the scope.
   */
  handleAction: <Event, Result = void, ErrorType = Error>(
    source: Observable<Event> | Action<Event>,
    handler: EffectHandler<Event, Result>,
    options?: HandlerOptions<ErrorType> & EffectOptions<Event, Result>,
  ) => Effect<Event, Result, ErrorType>;

  /**
   * Creates an effect which handles `query` by `handler`, and it will be
   * destroyed with the scope.
   */
  handleQuery: <Value, Result = void, ErrorType = Error>(
    query: Query<Value>,
    handler: EffectHandler<Value, Result>,
    options?: EffectOptions<Value, Result>,
  ) => Effect<Value, Result, ErrorType>;

  observe: {
    <T>(source: Observable<T>): Subscription;
    <T>(source: Observable<T>, next: (value: T) => void): Subscription;
    <T>(source: Observable<T>, observer: Partial<Observer<T>>): Subscription;
  };
}>;

/**
 * `ExternalScope` and `Scope` types allow to distinct which third-party code can invoke `destroy()` method.
 */
export type ExternalScope = Omit<Scope, 'destroy'>;

/**
 * Creates `Scope` instance.
 */
export function createScope(): Scope {
  const subscriptions = new Subscription();

  return {
    add(teardown) {
      subscriptions.add(teardown);
    },

    destroy() {
      subscriptions.unsubscribe();
    },

    createStore<State>(
      initialState: State,
      options?: StoreOptions<State>,
    ): Store<State> {
      const store = createStore(initialState, options);
      subscriptions.add(store.destroy);

      return store;
    },

    createDeclaredStore<State>(
      stateDeclaration: StateDeclaration<State>,
      initialState?: Partial<State>,
    ): Store<State> {
      const store = stateDeclaration.createStore(initialState);
      subscriptions.add(store.destroy);

      return store;
    },

    createController<ControllerProps>(
      factory: () => Controller<ControllerProps>,
    ) {
      const controller = factory();
      subscriptions.add(controller.destroy);

      return controller;
    },

    createEffect<Event, Result, ErrorType>(
      handler: EffectHandler<Event, Result>,
      options?: EffectOptions<Event, Result>,
    ) {
      const effect = createEffect<Event, Result, ErrorType>(handler, options);
      subscriptions.add(effect.destroy);

      return effect;
    },

    handleAction<Event, Result = void, ErrorType = Error>(
      source: Observable<Event> | Action<Event>,
      handler: EffectHandler<Event, Result>,
      options?: HandlerOptions<ErrorType> & EffectOptions<Event, Result>,
    ) {
      const effect = createEffect<Event, Result, ErrorType>(handler, options);
      effect.handle(source, options);

      subscriptions.add(effect.destroy);

      return effect;
    },

    handleQuery<Value, Result = void, ErrorType = Error>(
      query: Query<Value>,
      handler: EffectHandler<Value, Result>,
      options?: HandlerOptions<ErrorType> & EffectOptions<Value, Result>,
    ): Effect<Value, Result, ErrorType> {
      const effect = createEffect<Value, Result, ErrorType>(handler, options);
      effect.handle(query.value$, options);

      subscriptions.add(effect.destroy);

      return effect;
    },

    observe<T>(
      source: Observable<T>,
      nextOrObserver?: Partial<Observer<T>> | ((value: T) => unknown),
    ): Subscription {
      const subscription =
        typeof nextOrObserver === 'function'
          ? source.subscribe(nextOrObserver)
          : source.subscribe(nextOrObserver);

      subscriptions.add(subscription);

      return subscription;
    },
  };
}
