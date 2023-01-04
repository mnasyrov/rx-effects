import { BehaviorSubject } from 'rxjs';
import { collectChanges } from '../test/testUtils';
import { queryBehaviourSubject } from './queryUtils';

describe('queryBehaviourSubject()', () => {
  it('should return a proxy for a BehaviourSubject', async () => {
    const source = new BehaviorSubject(1);
    const query = queryBehaviourSubject(source);

    expect(query.get()).toBe(1);

    const changes = await collectChanges(query.value$, () => {
      source.next(2);
      expect(query.get()).toBe(2);
    });

    expect(changes).toEqual([1, 2]);
  });
});
