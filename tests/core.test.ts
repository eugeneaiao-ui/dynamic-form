import { describe, expect, it } from 'vitest';
import {
  cloneConfig,
  createSnapshotMiddleware,
  DataSourceManager,
  DataSourceType,
  DependentTypeEnum,
  FormConfigBuilder,
  FormFieldType,
  getValue,
  guideMiddleware,
  isEqual,
  MiniMiddleware,
  parseFormLayout,
  resolveDependencies,
  setValue,
  sliceBySubmitLength,
  splitIntoBatches,
} from '../src/core';
import type { FormValues } from '../src/core';

describe('middleware and configuration', () => {
  it('composes in order and can intentionally stop the chain', () => {
    const events: string[] = [];
    new MiniMiddleware<{ value: number }>()
      .use((context, next) => {
        events.push('before');
        context.value++;
        next();
        events.push('after');
      })
      .use((context) => {
        events.push(String(context.value));
      })
      .use(() => events.push('unreachable'))
      .execute({ value: 0 });
    expect(events).toEqual(['before', '1', 'after']);
  });
  it('rejects double next and async middleware', () => {
    expect(() =>
      new MiniMiddleware()
        .use((_ctx, next) => {
          next();
          next();
        })
        .execute({} as never),
    ).toThrow('more than once');
    expect(() => new MiniMiddleware().use(async () => {}).execute({} as never)).toThrow('synchronous');
  });
  it('updates template, field definitions and middlewares without mutating inputs', () => {
    const fields = { name: { label: 'Name', componentProps: { nested: { flag: false } } } };
    const builder = new FormConfigBuilder<FormValues>(
      [{ name: 'name', type: FormFieldType.Input }],
      fields,
    ).addMiddleware((context, next) => {
      (context.fieldProps.componentProps?.nested as { flag: boolean }).flag = true;
      next();
    });
    expect(builder.build()[0]?.componentProps?.nested).toEqual({ flag: true });
    expect(fields.name.componentProps.nested.flag).toBe(false);
    builder
      .setMiddlewares([])
      .setTemplate([{ name: 'next', type: FormFieldType.Input }])
      .setFields({ next: { label: 'Next' } });
    expect(builder.build()).toEqual([{ name: 'next', type: FormFieldType.Input, label: 'Next' }]);
  });
  it('preserves configuration props when disabling a field', () => {
    const builder = new FormConfigBuilder<FormValues>([{ name: 'name', type: FormFieldType.Input }], {
      name: { componentProps: { placeholder: 'Name' } },
    });
    builder.addMiddleware(guideMiddleware).setGlobalCtx({ permission: false });
    expect(builder.build()[0]?.componentProps).toEqual({ placeholder: 'Name', disabled: true });
  });
  it('keeps false, zero, null and nested snapshots intact', () => {
    const builder = new FormConfigBuilder([{ name: ['user', 'active'], type: FormFieldType.Custom }], {});
    builder.addMiddleware(createSnapshotMiddleware({ user: { active: false } }, { user: { active: 0 } }));
    expect(builder.build()[0]?.snapshotValues).toEqual({ before: false, after: 0 });
    const nullable = new FormConfigBuilder([{ name: 'value', type: FormFieldType.Input }]);
    nullable.addMiddleware(createSnapshotMiddleware({ value: null }, {}));
    expect(nullable.build()[0]?.snapshotValues).toEqual({ before: null, after: undefined });
  });
  it('requires names for controls but allows unnamed layout placeholders', () => {
    expect(() => new FormConfigBuilder([{ type: FormFieldType.Input }]).build()).toThrow('requires a name');
    expect(new FormConfigBuilder([{ type: FormFieldType.Span, span: 8 }]).build()).toHaveLength(1);
  });
});

describe('safe paths and layout', () => {
  it('distinguishes literal dotted names from nested paths and preserves falsy values', () => {
    const source = { 'user.name': '', user: { name: false }, count: 0 };
    expect(getValue(source, 'user.name')).toBe('');
    expect(getValue(source, ['user', 'name'])).toBe(false);
    expect(getValue(source, 'count')).toBe(0);
    const changed = setValue(source, ['user', 'name'], 'Updated');
    expect(source.user.name).toBe(false);
    expect(changed).toEqual({ 'user.name': '', user: { name: 'Updated' }, count: 0 });
  });
  it('rejects prototype pollution on reads and writes', () => {
    expect(() => setValue({}, ['__proto__', 'polluted'], true)).toThrow('Unsafe');
    expect(() => getValue({}, ['constructor', 'prototype'])).toThrow('Unsafe');
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
  it('keeps placeholders in the grid and rejects invalid spans', () => {
    expect(
      parseFormLayout([{ span: 8 }, { span: 8, hidden: true }, { span: 8 }, { span: 24 }]).map((row) => row.length),
    ).toEqual([3, 1]);
    for (const span of [0, -1, 25, 1.5]) expect(() => parseFormLayout([{ span }])).toThrow();
    expect(
      splitIntoBatches(
        Array.from({ length: 7 }, () => ({ span: 24 })),
        'Title',
        3,
      ).map((batch) => [batch.title, batch.segment.length]),
    ).toEqual([
      ['Title', 3],
      [undefined, 3],
      [undefined, 1],
    ]);
  });
  it('clones circular configuration data and compares control values', () => {
    const original: { data: Record<string, unknown> } = { data: {} };
    original.data.self = original;
    const copied = cloneConfig(original);
    expect(copied).not.toBe(original);
    expect(copied.data.self).toBe(copied);
    expect(isEqual(original, copied)).toBe(true);
    expect(isEqual({ value: 0 }, { value: false })).toBe(false);
  });
  it('does not split an emoji during UTF-16 truncation', () => {
    expect(sliceBySubmitLength('A😀B', 2)).toBe('A');
    expect(sliceBySubmitLength('A😀B', 3)).toBe('A😀');
    expect(sliceBySubmitLength('😀', 0)).toBe('');
  });
});

describe('data sources and dependencies', () => {
  it('isolates registries, versions registrations and protects later replacements from old disposers', async () => {
    const first = new DataSourceManager(),
      second = new DataSourceManager();
    const dispose = first.register('choices', { type: DataSourceType.INLINE, options: [{ label: 'Old', value: 1 }] });
    first.register('choices', { type: DataSourceType.INLINE, options: [{ label: 'New', value: 2 }] });
    dispose();
    expect(await first.resolve('choices')).toEqual([{ label: 'New', value: 2 }]);
    await expect(second.resolve('choices')).rejects.toThrow('Unknown data source');
  });
  it('resolves injected stores and enum services without any business imports', async () => {
    const manager = new DataSourceManager();
    const options = [{ label: 'No', value: 0 }];
    expect(
      await manager.resolve(
        { type: DataSourceType.STORE, module: 'settings', storeKey: ['options'] },
        { store: { settings: { options } } },
      ),
    ).toBe(options);
    expect(
      await manager.resolve({ type: DataSourceType.CEPT, enumName: 'status' }, { enums: { status: options } }),
    ).toBe(options);
  });
  it('supports API resolvers, failure propagation and cancellation even if a resolver ignores the signal', async () => {
    const controller = new AbortController();
    const manager = new DataSourceManager({
      [DataSourceType.API]: async () => {
        controller.abort();
        return [];
      },
    });
    await expect(
      manager.resolve({ type: DataSourceType.API, url: '/choices' }, { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    const failing = new DataSourceManager({
      [DataSourceType.API]: () => {
        throw new Error('Failed');
      },
    });
    await expect(failing.resolve({ type: DataSourceType.API, url: '/choices' })).rejects.toThrow('Failed');
  });
  it('reads dependency paths in declared order, including absent and falsy values', async () => {
    const result = await resolveDependencies<FormValues>(
      {
        name: 'result',
        componentProps: { disabled: true },
        dependenciesConfig: [
          {
            type: DependentTypeEnum.ATTRIBUTE,
            dependsOn: [['nested', 'flag'], 'count'],
            calculate: (values) => ({ values, disabled: false }),
          },
          {
            type: DependentTypeEnum.COMPUTE,
            dependsOn: ['missing'],
            applyTo: 'result',
            calculate: () => false,
            triggerValidate: true,
          },
        ],
      },
      { nested: { flag: false }, count: 0 },
    );
    expect(result.componentProps).toEqual({ disabled: false, values: [false, 0] });
    expect(result.writes).toEqual([{ path: 'result', value: false, validate: true }]);
  });
  it('never applies canceled async dependency writes', async () => {
    const controller = new AbortController();
    const result = await resolveDependencies<FormValues>(
      {
        name: 'target',
        dependenciesConfig: {
          type: DependentTypeEnum.FETCH,
          calculate: async () => {
            controller.abort();
            return 'stale';
          },
        },
      },
      {},
      {},
      controller.signal,
    );
    expect(result.writes).toEqual([]);
  });
});
