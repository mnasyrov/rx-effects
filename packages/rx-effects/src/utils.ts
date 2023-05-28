export type Comparator<T> = (prev: T, next: T) => boolean;

export const DEFAULT_COMPARATOR: Comparator<unknown> = Object.is;

const hasOwnProperty = Object.prototype.hasOwnProperty;

export type AnyObject = Record<string, any>;
export type EmptyObject = Record<string, never>;

export type PartialProp<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Makes shallow comparison of two objects.
 */
export const OBJECT_COMPARATOR: Comparator<
  Readonly<Record<string, unknown>>
> = (objA, objB): boolean => {
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
  source: T[] | undefined,
  item: T,
): T[] | undefined {
  if (!source) return undefined;

  const index = source.indexOf(item);
  if (index < 0) return source;

  if (source.length === 1) {
    return undefined;
  }

  const clone = [...source];
  clone.splice(index, 1);
  return clone;
}

export function nextSafeInteger(currentValue: number): number {
  return currentValue >= Number.MAX_SAFE_INTEGER ? 0 : currentValue + 1;
}
