import {
  bufferWhen,
  firstValueFrom,
  Observable,
  Observer,
  Subject,
  timeout,
  timer,
} from 'rxjs';
import Mock = jest.Mock;

export function waitForMicrotask(): Promise<void> {
  return firstValueFrom(timer(0)).then(() => undefined);
}

export function collectChanges<T>(
  source$: Observable<T>,
  action: () => void | Promise<void>,
  interval = 500,
): Promise<Array<T>> {
  const bufferClose$ = new Subject<void>();

  setTimeout(async () => {
    await action();

    await firstValueFrom(timer(0));

    bufferClose$.next();
  });

  return firstValueFrom(
    source$.pipe(
      timeout(interval),
      bufferWhen(() => bufferClose$),
    ),
  );
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

export function dump(message: string, value?: any): void {
  const clone =
    value === undefined ? undefined : JSON.parse(JSON.stringify(value));

  if (clone === undefined) {
    console.log(`!!! ${message}`);
  } else {
    console.log(`!!! ${message}`, clone);
  }
}
