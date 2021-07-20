import { Subscription, TeardownLogic } from 'rxjs';
import { createEffect, Effect, EffectHandler } from './effect';

export type EffectScope = {
  readonly add: (teardown: TeardownLogic) => void;
  readonly destroy: () => void;

  readonly createEffect: <Event = void, Result = void, ErrorType = Error>(
    handler: EffectHandler<Event, Result>,
  ) => Effect<Event, Result, ErrorType>;
};

export function createEffectScope(): EffectScope {
  const subscriptions = new Subscription();

  return {
    add: (teardown) => subscriptions.add(teardown),
    destroy: () => subscriptions.unsubscribe(),

    createEffect: (handler) => createEffect(handler, subscriptions),
  };
}
