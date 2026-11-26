import type { NamePath, PathSegment } from './types';

const unsafeKeys = new Set(['__proto__', 'prototype', 'constructor']);

export function toPath(path: NamePath): PathSegment[] {
  const result = Array.isArray(path) ? [...path] : [path];
  if (result.length === 0) throw new TypeError('A field path cannot be empty.');
  for (const part of result) {
    if (typeof part !== 'string' && typeof part !== 'number') throw new TypeError('Invalid field path segment.');
    if (typeof part === 'string' && unsafeKeys.has(part)) throw new TypeError('Unsafe field path: ' + part);
    if (typeof part === 'number' && (!Number.isInteger(part) || part < 0))
      throw new TypeError('Field indexes must be non-negative integers.');
  }
  return result;
}

export function fieldKey(path: NamePath): string {
  return Array.isArray(path) ? JSON.stringify(toPath(path)) : String(path);
}

export function getValue(source: unknown, path: NamePath): unknown {
  let current = source;
  for (const part of toPath(path)) {
    if (current === null || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, part))
      return undefined;
    current = (current as Record<PathSegment, unknown>)[part];
  }
  return current;
}

/** Immutable path update; unrelated branches retain their identity. */
export function setValue<Values extends object>(source: Values, path: NamePath, value: unknown): Values {
  const parts = toPath(path);
  const update = (current: unknown, index: number): unknown => {
    const part = parts[index]!;
    const object = current !== null && typeof current === 'object' ? current : undefined;
    const copy: Record<PathSegment, unknown> | unknown[] = Array.isArray(object)
      ? [...object]
      : { ...(object as Record<string, unknown> | undefined) };
    const next =
      index === parts.length - 1
        ? value
        : update(object ? (object as Record<PathSegment, unknown>)[part] : undefined, index + 1);
    (copy as Record<PathSegment, unknown>)[part] = next;
    return copy;
  };
  return update(source, 0) as Values;
}
