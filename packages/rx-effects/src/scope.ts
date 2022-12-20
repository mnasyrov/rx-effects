import { Observable, Observer, Subscription, TeardownLogic } from 'rxjs';
import { Action } from './action';
import { Controller } from './controller';
import { createEffect, Effect, EffectHandler, EffectOptions } from './effect';
import { Query } from './query';
import { createStore, Store, StoreOptions } from './store';
import { AnyObject } from './utils';

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
   * Creates a controller which will be destroyed with the scope.
   */
  createController: <ControllerProps extends AnyObject = AnyObject>(
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

  /**
   * Subscribes to the `source` observable until the scope will be destroyed.
   */
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

  function registerTeardown(teardown: TeardownLogic): void {
    subscriptions.add(teardown);
  }

  function destroy(): void {
    subscriptions.unsubscribe();
  }

  function createController<ControllerProps extends AnyObject = AnyObject>(
    factory: () => Controller<ControllerProps>,
  ) {
    const controller = factory();
    registerTeardown(controller.destroy);

    return controller;
  }

  return {
    add: registerTeardown,
    destroy,

    createController,

    createStore<State>(
      initialState: State,
      options?: StoreOptions<State>,
    ): Store<State> {
      return createController(() => createStore(initialState, options));
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

      registerTeardown(subscription);

      return subscription;
    },
  };
}
