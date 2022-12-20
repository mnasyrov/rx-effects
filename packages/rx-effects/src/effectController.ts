import { identity, map, merge, Observable, Subject, Subscription } from 'rxjs';
import { Controller } from './controller';
import {
  EffectError,
  EffectNotification,
  EffectResult,
  EffectState,
} from './effectState';
import { createStore, InternalStoreOptions } from './store';

const GLOBAL_EFFECT_UNHANDLED_ERROR_SUBJECT = new Subject<
  EffectError<unknown, unknown>
>();

export const GLOBAL_EFFECT_UNHANDLED_ERROR$ =
  GLOBAL_EFFECT_UNHANDLED_ERROR_SUBJECT.asObservable();

function emitGlobalUnhandledError(
  effectError: EffectError<unknown, unknown>,
): void {
  if (GLOBAL_EFFECT_UNHANDLED_ERROR_SUBJECT.observed) {
    GLOBAL_EFFECT_UNHANDLED_ERROR_SUBJECT.next(effectError);
  } else {
    console.error('Uncaught error in Effect', effectError);
  }
}

export type EffectController<Event, Result, ErrorType = Error> = Controller<{
  state: EffectState<Event, Result, ErrorType>;

  start: () => void;
  next: (result: EffectResult<Event, Result>) => void;
  complete: () => void;
  error: (error: EffectError<Event, ErrorType>) => void;
}>;

const increaseCount = (count: number): number => count + 1;
const decreaseCount = (count: number): number => (count > 0 ? count - 1 : 0);

export function createEffectController<
  Event,
  Result,
  ErrorType = Error,
>(): EffectController<Event, Result, ErrorType> {
  const subscriptions = new Subscription();

  const event$: Subject<Event> = new Subject();
  const done$: Subject<EffectResult<Event, Result>> = new Subject();
  const error$: Subject<EffectError<Event, ErrorType>> = new Subject();
  const pendingCount = createStore<number>(0, {
    internal: true,
  } as InternalStoreOptions<number>);

  subscriptions.add(() => {
    event$.complete();
    done$.complete();
    error$.complete();
    pendingCount.destroy();
  });

  const notifications$: Observable<
    EffectNotification<Event, Result, ErrorType>
  > = merge(
    done$.pipe(
      map<
        EffectResult<Event, Result>,
        EffectNotification<Event, Result, ErrorType>
      >((entry) => ({ type: 'result', ...entry })),
    ),

    error$.pipe(
      map<
        EffectError<Event, ErrorType>,
        EffectNotification<Event, Result, ErrorType>
      >((entry) => ({ type: 'error', ...entry })),
    ),
  );

  return {
    state: {
      done$: done$.asObservable(),
      result$: done$.pipe(map(({ result }) => result)),
      error$: error$.asObservable(),
      final$: notifications$,
      pending: pendingCount.query((count) => count > 0),
      pendingCount: pendingCount.query(identity),
    },

    start: () => pendingCount.update(increaseCount),

    next: (result) => done$.next(result),

    complete: () => pendingCount.update(decreaseCount),

    error: (effectError) => {
      if (effectError.origin === 'handler') {
        pendingCount.update(decreaseCount);
      }

      if (error$.observed) {
        error$.next(effectError);
      } else {
        emitGlobalUnhandledError(effectError);
      }
    },

    destroy: () => {
      subscriptions.unsubscribe();
    },
  };
}
