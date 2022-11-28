import React, { FC } from 'react';
import { declareStateUpdates } from 'rx-effects';
import { useStoreFactory } from 'rx-effects-react/src/useStore';

const COUNTER_STATE = 0;

const COUNTER_UPDATES = declareStateUpdates<number>({
  decrement: () => (state) => state - 1,
  increment: () => (state) => state + 1,
});

export const App: FC = () => {
  const counter = useStoreFactory(COUNTER_STATE, COUNTER_UPDATES);

  return (
    <div>
      <button onClick={() => counter.updates.decrement()}>-</button>
      <span>{counter.value}</span>
      <button onClick={() => counter.updates.increment()}>+</button>
    </div>
  );
};
