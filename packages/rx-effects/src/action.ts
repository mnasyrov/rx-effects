import { Observable, Subject } from 'rxjs';

/**
 * Action is an event emitter
 *
 * @param operator Optional transformation or handler for an event
 *
 * @field event$ - Observable for emitted events.
 *
 * @example
 * ```ts
 * // Create the action
 * const submitForm = createAction<{login: string, password: string}>();
 *
 * // Call the action
 * submitForm({login: 'foo', password: 'bar'});
 *
 * // Handle action's events
 * submitForm.even$.subscribe((formData) => {
 *   // Process the formData
 * });
 * ```
 */
export type Action<Event> = {
  readonly event$: Observable<Event>;
  (event: Event): void;
} & ([Event] extends [undefined | void]
  ? { (event?: Event): void }
  : { (event: Event): void });

export function createAction<Event = void>(
  operator?: (source$: Observable<Event>) => Observable<Event>,
): Action<Event> {
  const source$ = new Subject<Event>();

  const emitter = (event: Event): void => source$.next(event);
  emitter.event$ = operator ? source$.pipe(operator) : source$.asObservable();

  return emitter as unknown as Action<Event>;
}
