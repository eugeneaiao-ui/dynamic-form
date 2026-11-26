export function isEqual(left: unknown, right: unknown): boolean {
  const seen = new WeakMap<object, object>();
  const compare = (a: unknown, b: unknown): boolean => {
    if (Object.is(a, b)) return true;
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    const prototype = Object.getPrototypeOf(a);
    if (!Array.isArray(a) && prototype !== Object.prototype && prototype !== null) return false;
    if (seen.has(a)) return seen.get(a) === b;
    seen.set(a, b);
    const aKeys = Object.keys(a),
      bKeys = Object.keys(b);
    return (
      aKeys.length === bKeys.length &&
      aKeys.every(
        (key) =>
          Object.prototype.hasOwnProperty.call(b, key) &&
          compare((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
      )
    );
  };
  return compare(left, right);
}

/** Clone configuration data, preserving functions and non-plain control values. */
export function cloneConfig<T>(value: T): T {
  const seen = new WeakMap<object, unknown>();
  const clone = (item: unknown): unknown => {
    if (item === null || typeof item !== 'object') return item;
    if (seen.has(item)) return seen.get(item);
    if ('$$typeof' in item) return item; // React elements are opaque values.
    if (Array.isArray(item)) {
      const copy: unknown[] = [];
      seen.set(item, copy);
      for (const child of item) copy.push(clone(child));
      return copy;
    }
    const prototype = Object.getPrototypeOf(item);
    if (prototype !== Object.prototype && prototype !== null) return item;
    const copy: Record<string, unknown> = Object.create(prototype) as Record<string, unknown>;
    seen.set(item, copy);
    for (const key of Object.keys(item)) {
      Object.defineProperty(copy, key, {
        value: clone((item as Record<string, unknown>)[key]),
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
    return copy;
  };
  return clone(value) as T;
}
