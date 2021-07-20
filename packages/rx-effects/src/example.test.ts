import { firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { Action, createAction } from './action';
import { Effect } from './effect';
import { createEffectScope, EffectScope } from './effectScope';
import { declareState, StateDeclaration } from './stateDeclaration';
import { StateMutation } from './stateMutation';
import { StateStore } from './stateStore';
import { createResetStoreEffect } from './stateUtils';

// Example usage of RxEffects: a calculator which has actions: increment,
// decrement, add, subtract and reset.

type CalculatorState = { value: number };
type CalculatorStateMutation = StateMutation<CalculatorState>;
type CalculatorStore = StateStore<CalculatorState>;

const CALCULATOR_STATE: StateDeclaration<CalculatorState> = declareState(
  () => ({ value: 0 }),
);

const addValue: (value: number) => CalculatorStateMutation =
  (value) => (state) => ({ ...state, value: state.value + value });

function createCalculatorEffects(
  scope: EffectScope,
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

  const resetEffect = createResetStoreEffect(
    store,
    CALCULATOR_STATE.initialState,
  );

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

function createCalculatorController(
  store: CalculatorStore,
  eventBus: Action<ControllerEvents>,
): {
  destroy: () => void;

  increment: () => void;
  decrement: () => void;
  sum: (value: number) => void;
  subtract: (value: number) => void;
  reset: () => void;
} {
  const scope = createEffectScope();

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

  scope.add(
    incrementEffect.done$.subscribe(() =>
      eventBus({ type: 'added', value: 1 }),
    ),
  );
  scope.add(
    decrementEffect.done$.subscribe(() =>
      eventBus({ type: 'subtracted', value: 1 }),
    ),
  );
  scope.add(
    sumEffect.done$.subscribe(({ event }) =>
      eventBus({ type: 'added', value: event }),
    ),
  );
  scope.add(
    subtractEffect.done$.subscribe(({ event }) =>
      eventBus({ type: 'subtracted', value: event }),
    ),
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
    const store = CALCULATOR_STATE.createStore();
    const scope = createEffectScope();
    const incrementAction = createAction();

    const { incrementEffect } = createCalculatorEffects(scope, store);
    incrementEffect.handle(incrementAction);

    expect(store.get().value).toBe(0);

    incrementAction();
    expect(store.get().value).toBe(1);
  });

  it('should unsubscribe effects on scope.destroy()', async () => {
    const store = CALCULATOR_STATE.createStore({ value: 10 });
    const scope = createEffectScope();
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
    const store = CALCULATOR_STATE.createStore({ value: 0 });
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
