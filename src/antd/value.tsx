import React from 'react';
import { Tag } from 'antd';
import { isEqual } from '../core';
import type { SelectOption, SnapshotValues } from '../core';
export function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '';
  if (Array.isArray(value)) return value.map(formatValue).join(', ');
  if (typeof value === 'object') {
    const seen = new WeakSet<object>();
    try {
      return JSON.stringify(value, (_key, item: unknown) => {
        if (typeof item === 'bigint') return String(item);
        if (item !== null && typeof item === 'object') {
          if (seen.has(item)) return '[Circular]';
          seen.add(item);
        }
        return item;
      });
    } catch {
      return String(value);
    }
  }
  return String(value);
}
export function resolveSelectLabel(value: unknown, options: readonly SelectOption[] = []): React.ReactNode {
  if (value !== null && typeof value === 'object' && 'label' in value)
    return (value as { label: React.ReactNode }).label;
  const key =
    value !== null && typeof value === 'object' && 'value' in value ? (value as { value: unknown }).value : value;
  const search = (items: readonly SelectOption[]): SelectOption | undefined => {
    for (const item of items) {
      if (item.value === key) return item;
      const child = item.children && search(item.children);
      if (child) return child;
    }
    return undefined;
  };
  return (search(options)?.label as React.ReactNode) ?? formatValue(key);
}
export function ValueText({
  value,
  options,
  select = false,
}: {
  value: unknown;
  options?: readonly SelectOption[];
  select?: boolean;
}): React.ReactElement {
  if (select) {
    const values = Array.isArray(value) ? value : value == null || value === '' ? [] : [value];
    return (
      <span className="df-tags">
        {values.map((item, index) => (
          <Tag key={index}>{resolveSelectLabel(item, options)}</Tag>
        ))}
      </span>
    );
  }
  return <span className="df-value">{formatValue(value)}</span>;
}
export function SnapshotText({
  values,
  render = (value) => <ValueText value={value} />,
}: {
  values: SnapshotValues;
  render?: (value: unknown) => React.ReactNode;
}): React.ReactElement {
  if (isEqual(values.before, values.after)) return <>{render(values.after)}</>;
  return (
    <span className="df-snapshot">
      <del aria-label="Previous value">{render(values.before)}</del>
      <ins aria-label="Current value">{render(values.after)}</ins>
    </span>
  );
}
