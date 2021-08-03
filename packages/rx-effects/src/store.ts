import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Controller } from './controller';
import { StateMutation } from './stateMutation';
import { StateQuery } from './stateQuery';

export type StateReader<State> = StateQuery<State> & {
  readonly select: <R>(
    selector: (state: State) => R,
    compare?: (v1: R, v2: R) => boolean,
  ) => Observable<R>;

  readonly query: <R>(
    selector: (state: State) => R,
    compare?: (v1: R, v2: R) => boolean,
  ) => StateQuery<R>;
};

export type Store<State> = StateReader<State> &
  Controller<{
    set: (state: State) => void;
    update: (mutation: StateMutation<State>) => void;
  }>;

export function createStore<State>(
  initialState: State,
  stateCompare: (s1: State, s2: State) => boolean = Object.is,
): Store<State> {
  const store$: BehaviorSubject<State> = new BehaviorSubject(initialState);
  const state$ = store$.asObservable();

  return {
    value$: state$,

    get(): State {
      return store$.value;
    },

    set(nextState: State) {
      const prevState = store$.value;
      if (!stateCompare(prevState, nextState)) {
        store$.next(nextState);
      }
    },

    update(mutation: StateMutation<State>) {
      const prevState = store$.value;
      const nextState = mutation(prevState);
      if (!stateCompare(prevState, nextState)) {
        store$.next(nextState);
      }
    },

    select<R>(
      selector: (state: State) => R,
      valueCompare: (v1: R, v2: R) => boolean = Object.is,
    ): Observable<R> {
      return state$.pipe(map(selector), distinctUntilChanged(valueCompare));
    },

    query<R>(
      selector: (state: State) => R,
      valueCompare: (v1: R, v2: R) => boolean = Object.is,
    ): StateQuery<R> {
      return {
        get: () => selector(store$.value),
        value$: this.select(selector, valueCompare),
      };
    },

    destroy() {
      store$.complete();
    },
  };
}
