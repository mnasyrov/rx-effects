import { Observable } from 'rxjs';
import { Action } from './action';
import {
  createEffect,
  Effect,
  EffectHandler,
  EffectOptions,
  HandlerOptions,
} from './effect';

/**
 * This helper creates `Effect` from `handler` and subscribes it to `source`.
 */
export function handleAction<Event, Result = void, ErrorType = Error>(
  source: Observable<Event> | Action<Event>,
  handler: EffectHandler<Event, Result>,
  options?: HandlerOptions<ErrorType> & EffectOptions<Event, Result>,
): Effect<Event, Result, ErrorType> {
  const effect = createEffect<Event, Result, ErrorType>(handler, options);
  effect.handle(source, options);

  return effect;
}
