import { Subject } from 'rxjs';
import { StateMutation } from './stateMutation';
import { Store } from './store';

export type StoreEvent<State> =
  | {
      type: 'created';
      store: Store<State>;
    }
  | {
      type: 'destroyed';
      store: Store<State>;
    }
  | {
      type: 'mutation';
      store: Store<State>;
      mutation: StateMutation<State>;
      nextState: State;
      prevState: State;
    }
  | {
      type: 'updated';
      store: Store<State>;
      nextState: State;
      prevState: State;
    };

/** @internal */
export const STORE_EVENT_BUS = new Subject<StoreEvent<any>>();
