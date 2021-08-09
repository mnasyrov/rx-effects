import { Observable, Subscription, TeardownLogic } from 'rxjs';
import { Action } from './action';
import { Controller } from './controller';
import { createEffect, Effect, EffectHandler, HandlerOptions } from './effect';
import { handleAction } from './handleAction';
import { StateDeclaration } from './stateDeclaration';
import { createStore, Store } from './store';

export type Scope = Controller<{
  add: (teardown: TeardownLogic) => void;

  createStore<State>(
    initialState: State,
    stateCompare?: (s1: State, s2: State) => boolean,
  ): Store<State>;

  createDeclaredStore<State>(
    stateDeclaration: StateDeclaration<State>,
    initialState?: Partial<State>,
  ): Store<State>;

  createController: <ControllerProps>(
    factory: () => Controller<ControllerProps>,
  ) => Controller<ControllerProps>;

  createEffect: <Event = void, Result = void, ErrorType = Error>(
    handler: EffectHandler<Event, Result>,
  ) => Effect<Event, Result, ErrorType>;

  handleAction: <Event, Result = void, ErrorType = Error>(
    source: Observable<Event> | Action<Event>,
    handler: EffectHandler<Event, Result>,
    options?: HandlerOptions<ErrorType>,
  ) => Effect<Event, Result, ErrorType>;
}>;

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
      stateCompare: (s1: State, s2: State) => boolean = Object.is,
    ): Store<State> {
      const store = createStore(initialState, stateCompare);
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
