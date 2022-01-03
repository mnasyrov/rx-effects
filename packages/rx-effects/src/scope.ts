import { Observable, Subscription, TeardownLogic } from 'rxjs';
import { Action } from './action';
import { Controller } from './controller';
import { createEffect, Effect, EffectHandler, HandlerOptions } from './effect';
import { handleAction } from './handleAction';
import { StateDeclaration } from './stateDeclaration';
import { createStore, Store, StoreOptions } from './store';

/**
 * A controller-like boundary for effects and business logic.
 *
 * It collects all subscriptions which are made by child entities and provides
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
    options?: HandlerOptions<ErrorType>,
  ) => Effect<Event, Result, ErrorType>;
}>;

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
    ) {
      const effect = createEffect<Event, Result, ErrorType>(handler);
      subscriptions.add(effect.destroy);

      return effect;
    },

    handleAction(source, handler, options) {
      const effect = handleAction(source, handler, options);
      subscriptions.add(effect.destroy);

      return effect;
    },
  };
}
