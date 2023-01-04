import {
  bufferWhen,
  firstValueFrom,
  Observable,
  Observer,
  Subject,
  timer,
} from 'rxjs';
import Mock = jest.Mock;

export function collectChanges<T>(
  source$: Observable<T>,
  action: () => void | Promise<void>,
): Promise<Array<T>> {
  const bufferClose$ = new Subject<void>();

  setTimeout(async () => {
    await action();

    await firstValueFrom(timer(0));

    bufferClose$.next();
  });

  return firstValueFrom(source$.pipe(bufferWhen(() => bufferClose$)));
}

export function mockObserver<T>(): Observer<T> & {
  next: Mock;
  error: Mock;
  complete: Mock;
} {
  return {
    next: jest.fn(),
    error: jest.fn(),
    complete: jest.fn(),
  };
}
