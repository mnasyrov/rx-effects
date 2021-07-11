import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { StateMutation } from './stateMutation';
import { StateQuery } from './stateQuery';

export type StateReader<State> = Readonly<
  StateQuery<State> & {
    select: <R>(
      selector: (state: State) => R,
      compare?: (v1: R, v2: R) => boolean,
    ) => Observable<R>;
    query: <R>(
      selector: (state: State) => R,
      compare?: (v1: R, v2: R) => boolean,
    ) => StateQuery<R>;
  }
>;

export type StateStore<State> = Readonly<
  StateReader<State> & {
    set: (state: State) => void;
    update: (mutation: StateMutation<State>) => void;
  }
>;

export function createStateStore<State>(
  initialState: State,
  stateCompare: (s1: State, s2: State) => boolean = Object.is,
): StateStore<State> {
  const store$: BehaviorSubject<State> = new BehaviorSubject(initialState);
  const state$ = store$.pipe(
    distinctUntilChanged(stateCompare),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  return {
    value$: state$,

    get(): State {
      return store$.value;
    },

    set(nextState: State) {
      store$.next(nextState);
    },

    update(mutation: StateMutation<State>) {
      const prevState = store$.value;
      const nextState = mutation(prevState);
      store$.next(nextState);
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
  };
}
