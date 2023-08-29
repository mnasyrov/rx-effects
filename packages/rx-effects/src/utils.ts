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

export function isArrayEqual(
  a: ReadonlyArray<unknown>,
  b: ReadonlyArray<unknown>,
): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

export function isSetEqual(
  a: ReadonlySet<unknown>,
  b: ReadonlySet<unknown>,
): boolean {
  if (a.size !== b.size) {
    return false;
  }

  const it1 = a.values();
  const it2 = b.values();

  let r1 = it1.next();
  let r2 = it2.next();

  while (!r1.done && !r2.done) {
    if (r1.value !== r2.value) return false;

    r1 = it1.next();
    r2 = it2.next();
  }

  return r1.done === r2.done;
}

export function nextSafeInteger(currentValue: number): number {
  return currentValue < Number.MAX_SAFE_INTEGER
    ? currentValue + 1
    : Number.MIN_SAFE_INTEGER;
}

export class MicrotaskScheduler<T> {
  private readonly queue = new Set<T>();

  constructor(private readonly action: (entry: T) => void) {}

  isEmpty(): boolean {
    return this.queue.size === 0;
  }

  schedule(entry: T): void {
    const prevSize = this.queue.size;
    this.queue.add(entry);

    if (prevSize === 0) {
      Promise.resolve().then(() => this.execute());
    }
  }

  remove(entry: T): void {
    this.queue.delete(entry);
  }

  execute(): void {
    if (this.queue.size === 0) {
      return;
    }

    const list = [...this.queue];
    this.queue.clear();

    for (const entry of list) {
      this.action(entry);
    }
  }
}
