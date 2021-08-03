import { Observable, Subscription, TeardownLogic } from 'rxjs';
import { Action } from './action';
import { Controller } from './controller';
import { createEffect, Effect, EffectHandler, HandlerOptions } from './effect';
import { handleAction } from './handleAction';

export type EffectScope = Controller<{
  add: (teardown: TeardownLogic) => void;

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

export function createEffectScope(): EffectScope {
  const subscriptions = new Subscription();

  return {
    add(teardown) {
      subscriptions.add(teardown);
    },

    destroy() {
      subscriptions.unsubscribe();
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
