import React, { FC } from 'react';
import { declareStateUpdates } from 'rx-effects';
import { useStore } from 'rx-effects-react';

const COUNTER_STATE = 0;

const COUNTER_UPDATES = declareStateUpdates<number>({
  decrement: () => (state) => state - 1,
  increment: () => (state) => state + 1,
});

export const App: FC = () => {
  const [counter, counterUpdates] = useStore(COUNTER_STATE, COUNTER_UPDATES);

  return (
    <div>
      <button onClick={() => counterUpdates.decrement()}>-</button>
      <span>{counter}</span>
      <button onClick={() => counterUpdates.increment()}>+</button>
    </div>
  );
};
