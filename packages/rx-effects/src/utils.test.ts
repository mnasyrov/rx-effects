import {
  isReadonlyArray,
  nextSafeInteger,
  OBJECT_COMPARATOR,
  removeFromArray,
} from './utils';

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

describe('removeFromArray()', () => {
  it('should return the same value if source is "undefined"', () => {
    expect(removeFromArray(undefined, 1)).toBeUndefined();
  });

  it('should return the same array if the item is not found', () => {
    const source = [1, 2, 3];
    expect(removeFromArray(source, 4)).toBe(source);
  });

  it('should return a copy without the item if the item is found', () => {
    const source = [1, 2, 3];
    const result = removeFromArray(source, 2);
    expect(result).not.toBe(source);
    expect(result).toEqual([1, 3]);
  });
});

describe('nextSafeInteger()', () => {
  it('should return an increased value', () => {
    expect(nextSafeInteger(0)).toBe(1);
    expect(nextSafeInteger(1)).toBe(2);
    expect(nextSafeInteger(2)).toBe(3);
  });

  it('should return MIN_SAFE_INTEGER if a current value greater or equal MAX_SAFE_INTEGER', () => {
    expect(nextSafeInteger(Number.MAX_SAFE_INTEGER)).toBe(
      Number.MIN_SAFE_INTEGER,
    );
    expect(nextSafeInteger(Number.MAX_SAFE_INTEGER + 1)).toBe(
      Number.MIN_SAFE_INTEGER,
    );
  });
});
