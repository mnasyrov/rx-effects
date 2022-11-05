import {
  Action,
  Controller,
  createAction,
  createScope,
  Effect,
  Scope,
  StateMutation,
  Store,
} from 'rx-effects';
import { createStore } from 'rx-effects/src/index';
import { firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';

// Example usage of RxEffects: a calculator which has actions: increment,
// decrement, add, subtract and reset.

type CalculatorState = Readonly<{ value: number }>;
type CalculatorStateMutation = StateMutation<CalculatorState>;
type CalculatorStore = Store<CalculatorState>;

const CALCULATOR_STATE: CalculatorState = { value: 0 };

const addValue: (value: number) => CalculatorStateMutation =
  (value) => (state) => ({ ...state, value: state.value + value });

function createCalculatorEffects(
  scope: Scope,
  store: CalculatorStore,
): {
  incrementEffect: Effect<void>;
  decrementEffect: Effect<void>;
  sumEffect: Effect<number>;
  subtractEffect: Effect<number, number>;
  resetEffect: Effect<void>;
} {
  const incrementEffect = scope.createEffect(() => store.update(addValue(1)));
  const decrementEffect = scope.createEffect(() => store.update(addValue(-1)));

  const sumEffect = scope.createEffect((value: number) =>
    store.update(addValue(value)),
  );

  const subtractEffect = scope.createEffect((value: number) => {
    store.update(addValue(-value));
    return -value;
  });

  const resetEffect = scope.createEffect(() => store.set(CALCULATOR_STATE));

  return {
    incrementEffect,
    decrementEffect,
    sumEffect,
    subtractEffect,
    resetEffect,
  };
}

// Example of the controller and the event bus

type ControllerEvents =
  | { type: 'added'; value: number }
  | { type: 'subtracted'; value: number };

type CalculatorController = Controller<{
  increment: () => void;
  decrement: () => void;
  sum: (value: number) => void;
  subtract: (value: number) => void;
  reset: () => void;
}>;

function createCalculatorController(
  store: CalculatorStore,
  eventBus: Action<ControllerEvents>,
): CalculatorController {
  const scope = createScope();

  const incrementAction = createAction<void>();
  const decrementAction = createAction<void>();
  const sumAction = createAction<number>();
  const subtractAction = createAction<number>();
  const resetAction = createAction<void>();

  const {
    incrementEffect,
    decrementEffect,
    sumEffect,
    subtractEffect,
    resetEffect,
  } = createCalculatorEffects(scope, store);

  incrementEffect.handle(incrementAction);
  decrementEffect.handle(decrementAction);
  sumEffect.handle(sumAction);
  subtractEffect.handle(subtractAction);
  resetEffect.handle(resetAction);

  scope.subscribe(incrementEffect.done$, () =>
    eventBus({ type: 'added', value: 1 }),
  );
  scope.subscribe(decrementEffect.done$, () =>
    eventBus({ type: 'subtracted', value: 1 }),
  );
  scope.subscribe(sumEffect.done$, ({ event }) =>
    eventBus({ type: 'added', value: event }),
  );
  scope.subscribe(subtractEffect.done$, ({ event }) =>
    eventBus({ type: 'subtracted', value: event }),
  );

  return {
    destroy: () => scope.destroy(),

    increment: incrementAction,
    decrement: decrementAction,
    sum: sumAction,
    subtract: subtractAction,
    reset: resetAction,
  };
}

describe('Example usage of RxEffects: Calculator', () => {
  it('should increment the value', async () => {
    const store = createStore(CALCULATOR_STATE);
    const scope = createScope();
    const incrementAction = createAction();

    const { incrementEffect } = createCalculatorEffects(scope, store);
    incrementEffect.handle(incrementAction);

    expect(store.get().value).toBe(0);

    incrementAction();
    expect(store.get().value).toBe(1);
  });

  it('should unsubscribe effects on scope.destroy()', async () => {
    const store = createStore({ ...CALCULATOR_STATE, value: 10 });
    const scope = createScope();
    const decrementAction = createAction();

    const { decrementEffect } = createCalculatorEffects(scope, store);
    decrementEffect.handle(decrementAction);

    decrementAction();
    expect(store.get().value).toBe(9);

    scope.destroy();
    decrementAction();
    expect(store.get().value).toBe(9);
  });

  it('should create actions inside the controller', async () => {
    const store = createStore({ ...CALCULATOR_STATE, value: 0 });
    const eventBus = createAction<ControllerEvents>();

    const controller = createCalculatorController(store, eventBus);

    const eventsPromise = firstValueFrom(
      eventBus.event$.pipe(take(4), toArray()),
    );

    controller.increment();
    expect(store.get().value).toBe(1);

    controller.sum(5);
    expect(store.get().value).toBe(6);

    controller.subtract(2);
    expect(store.get().value).toBe(4);

    controller.decrement();
    expect(store.get().value).toBe(3);

    const events = await eventsPromise;
    expect(events).toEqual([
      {
        type: 'added',
        value: 1,
      },
      {
        type: 'added',
        value: 5,
      },
      {
        type: 'subtracted',
        value: 2,
      },
      {
        type: 'subtracted',
        value: 1,
      },
    ]);
  });
});
