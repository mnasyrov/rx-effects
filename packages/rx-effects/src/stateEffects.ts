import { Observable } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { Action } from './action';
import { createEffect, Effect } from './effect';
import { StateQuery } from './stateQuery';
import { Store } from './store';

export function createReduceStoreEffect<Event, State>(
  store: Store<State>,
  reducer: (state: State, event: Event) => State,
): Effect<Event> {
  return createEffect((event) =>
    store.update((state) => reducer(state, event)),
  );
}

export function createResetStoreEffect<State>(
  store: Store<State>,
  nextState: State,
): Effect<void> {
  return createEffect(() => store.set(nextState));
}

export function withStore<Event, State>(
  action: Observable<Event> | Action<Event>,
  store: Store<State>,
): Observable<[Event, State]> {
  const observable = action instanceof Observable ? action : action.event$;

  return observable.pipe(withLatestFrom(store.value$));
}

export function withQuery<Event, Value>(
  action: Observable<Event> | Action<Event>,
  query: StateQuery<Value>,
): Observable<[Event, Value]> {
  const observable = action instanceof Observable ? action : action.event$;

  return observable.pipe(withLatestFrom(query.value$));
}
