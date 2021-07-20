import { firstValueFrom } from 'rxjs';
import { createAction } from './action';

describe('Action', () => {
  it('should emit the event', async () => {
    const action = createAction<number>();

    const promise = firstValueFrom(action.event$);
    action(1);

    expect(await promise).toBe(1);
  });

  it('should use void type and undefined value if a generic type is not specified', async () => {
    const action = createAction();

    const promise = firstValueFrom(action.event$);
    action();

    expect(await promise).toBe(undefined);
  });
});
