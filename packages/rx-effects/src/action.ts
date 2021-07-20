import { Observable, Subject } from 'rxjs';

export type Action<Event> = {
  readonly event$: Observable<Event>;
  (event: Event): void;
} & (Event extends undefined | void
  ? { (event?: Event): void }
  : { (event: Event): void });

export function createAction<Event = void>(): Action<Event> {
  const source$ = new Subject<Event>();

  const emitter = (event: Event): void => source$.next(event);
  emitter.event$ = source$.asObservable();

  return emitter as unknown as Action<Event>;
}
