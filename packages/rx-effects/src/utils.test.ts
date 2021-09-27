import { isReadonlyArray } from './utils';

describe('isReadonlyArray()', () => {
  it('should return true for the array', () => {
    expect(isReadonlyArray([1, 2, 3])).toBe(true);
  });

  it('should return false for a non-array value', () => {
    expect(isReadonlyArray('foo')).toBe(false);
  });
});
