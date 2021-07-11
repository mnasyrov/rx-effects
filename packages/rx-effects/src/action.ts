import { Observable, Subject } from 'rxjs';

export type Action<Event> = {
  readonly event$: Observable<Event>;

  // TODO: Check typings
  (): void;
  (event: Event): void;
};

export function createAction<Event>(): Action<Event> {
  const source$ = new Subject<Event>();

  const emitter = (event: Event): void => source$.next(event);
  emitter.event$ = source$.asObservable();

  return emitter as Action<Event>;
}
