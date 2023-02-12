import {
  bufferWhen,
  firstValueFrom,
  Observable,
  Observer,
  Subject,
} from 'rxjs';
import Mock = jest.Mock;

export function collectChanges<T>(
  source$: Observable<T>,
  action: () => void | Promise<void>,
): Promise<Array<T>> {
  const bufferClose$ = new Subject<void>();

  setImmediate(async () => {
    await action();
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
