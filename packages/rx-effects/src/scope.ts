import { Observable, Observer, Subscription, TeardownLogic } from 'rxjs';
import { Action } from './action';
import { Controller } from './controller';
import { createEffect, Effect, EffectHandler, EffectOptions } from './effect';
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
   * Register subscription-like or teardown function to be called with
   * `destroy()` method.
   */
  onDestroy: (teardown: TeardownLogic) => void;

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
    options?: EffectOptions<Event, Result>,
  ) => Effect<Event, Result, ErrorType>;

  /**
   * Creates an effect which handles `source` by `handler`, and it will be
   * destroyed with the scope.
   */
  handle: <Event, Result = void, ErrorType = Error>(
    source: Observable<Event> | Action<Event> | Query<Event>,
    handler: EffectHandler<Event, Result>,
    options?: EffectOptions<Event, Result>,
  ) => Effect<Event, Result, ErrorType>;

  subscribe: {
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

  function onDestroy(teardown: TeardownLogic): void {
    subscriptions.add(teardown);
  }

  function destroy(): void {
    subscriptions.unsubscribe();
  }

  function createController<ControllerProps>(
    factory: () => Controller<ControllerProps>,
  ) {
    const controller = factory();
    onDestroy(controller.destroy);

    return controller;
  }

  return {
    createController,
    onDestroy,
    destroy,

    createStore<State>(
      initialState: State,
      options?: StoreOptions<State>,
    ): Store<State> {
      return createController(() => createStore(initialState, options));
    },

    createDeclaredStore<State>(
      stateDeclaration: StateDeclaration<State>,
      initialState?: Partial<State>,
    ): Store<State> {
      return createController(() => stateDeclaration.createStore(initialState));
    },

    createEffect<Event, Result, ErrorType>(
      handler: EffectHandler<Event, Result>,
      options?: EffectOptions<Event, Result>,
    ) {
      return createController(() =>
        createEffect<Event, Result, ErrorType>(handler, options),
      );
    },

    handle<Event, Result = void, ErrorType = Error>(
      source: Observable<Event> | Action<Event> | Query<Event>,
      handler: EffectHandler<Event, Result>,
      options?: EffectOptions<Event, Result>,
    ) {
      const effect = createController(() =>
        createEffect<Event, Result, ErrorType>(handler, options),
      );

      effect.handle(source);

      return effect;
    },

    subscribe<T>(
      source: Observable<T>,
      nextOrObserver?: Partial<Observer<T>> | ((value: T) => unknown),
    ): Subscription {
      const subscription =
        typeof nextOrObserver === 'function'
          ? source.subscribe(nextOrObserver)
          : source.subscribe(nextOrObserver);

      onDestroy(subscription);

      return subscription;
    },
  };
}
