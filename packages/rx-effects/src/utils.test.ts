import { isReadonlyArray, OBJECT_COMPARATOR } from './utils';

describe('isReadonlyArray()', () => {
  it('should return true for the array', () => {
    expect(isReadonlyArray([1, 2, 3])).toBe(true);
  });

  it('should return false for a non-array value', () => {
    expect(isReadonlyArray('foo')).toBe(false);
  });
});

describe('OBJECT_COMPARATOR', () => {
  it('should compare properties of objects', () => {
    const obj = { a: 1 };

    expect(OBJECT_COMPARATOR({}, {})).toBe(true);
    expect(OBJECT_COMPARATOR(obj, obj)).toBe(true);
    expect(OBJECT_COMPARATOR({ a: 1 }, {})).toBe(false);
    expect(OBJECT_COMPARATOR({}, { a: 1 })).toBe(false);
    expect(OBJECT_COMPARATOR({ a: 1 }, { a: 1 })).toBe(true);
    expect(OBJECT_COMPARATOR({ a: 1 }, { a: 2 })).toBe(false);
    expect(OBJECT_COMPARATOR({ a: 1 }, { a: 1, b: 3 })).toBe(false);
    expect(OBJECT_COMPARATOR({ a: 1 }, { b: 1 })).toBe(false);
    expect(OBJECT_COMPARATOR({ a: 1 }, { a: 1, b: undefined })).toBe(false);
  });
});
