export const DEFAULT_COMPARATOR = (a: unknown, b: unknown): boolean => a === b;

export function isReadonlyArray<T>(
  value: ReadonlyArray<T> | unknown,
): value is ReadonlyArray<T> {
  return Array.isArray(value);
}
