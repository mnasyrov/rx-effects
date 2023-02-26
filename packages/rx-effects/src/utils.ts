export const DEFAULT_COMPARATOR: (a: unknown, b: unknown) => boolean =
  Object.is;

const hasOwnProperty = Object.prototype.hasOwnProperty;

export type AnyObject = Record<string, any>;
export type EmptyObject = Record<string, never>;

export type PartialProp<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Makes shallow comparison of two objects.
 */
export const OBJECT_COMPARATOR = (
  objA: Record<string, unknown>,
  objB: Record<string, unknown>,
): boolean => {
  if (objA === objB) {
    return true;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!hasOwnProperty.call(objB, key) || objA[key] !== objB[key]) {
      return false;
    }
  }

  return true;
};

export function isReadonlyArray<T>(
  value: ReadonlyArray<T> | unknown,
): value is ReadonlyArray<T> {
  return Array.isArray(value);
}

export function removeFromArray<T>(
  array: T[] | undefined,
  item: T,
): T[] | undefined {
  if (!array) return undefined;

  const index = array.indexOf(item);
  if (index >= 0) {
    array.splice(index, 1);
  }

  return array;
}
