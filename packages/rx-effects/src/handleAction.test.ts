import { firstValueFrom } from 'rxjs';
import { createAction } from './action';
import { handleAction } from './handleAction';

describe('handleAction()', () => {
  it('should create a new effect and handle the action by it', async () => {
    const action = createAction<number>();
    const handler = jest.fn((value) => value * 3);

    const effect = handleAction(action, handler);
    const resultPromise = firstValueFrom(effect.result$);

    action(2);
    expect(await resultPromise).toBe(6);
  });
});
