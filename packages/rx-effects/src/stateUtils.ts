import { Observable } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { Action } from './action';
import { createEffect, Effect } from './effect';
import { StateQuery } from './stateQuery';
import { StateStore } from './stateStore';

export function createUpdateStoreEffect<Event, State>(
  store: StateStore<State>,
  reducer: (state: State, event: Event) => State,
): Effect<Event> {
  return createEffect((event) =>
    store.update((state) => reducer(state, event)),
  );
}

export function createResetStoreEffect<State>(
  store: StateStore<State>,
  nextState: State,
): Effect<unknown> {
  return createEffect(() => store.set(nextState));
}

export function withStore<Event, State>(
  action: Observable<Event> | Action<Event>,
  store: StateStore<State>,
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
