import React, { useMemo } from 'react';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox, Input } from 'antd';
import {
  ComponentRegistry,
  createSnapshotMiddleware,
  DataSourceManager,
  DataSourceType,
  DependentTypeEnum,
  DynamicForm,
  DynamicFormProvider,
  FormComponent,
  FormFieldType,
  FormMode,
  useDataSource,
  useDynamicConfig,
  useDynamicFormContext,
  withDynamicForm,
} from '../src';
import type { FormConfigFields, FormTemplate, SelectOption } from '../src';

const template: FormTemplate = [{ name: 'name', type: FormFieldType.Input }];
const fields = { name: { label: 'Name', rules: [{ required: true, message: 'Name is required' }] } };

describe('React configuration updates', () => {
  it('builds on the first render and responds to template, middleware and field changes', () => {
    const { result, rerender } = renderHook(
      ({ name, title }: { name: string; title: string }) => {
        const currentTemplate = useMemo<FormTemplate>(() => [{ name, type: FormFieldType.Input }], [name]);
        const currentFields = useMemo(() => ({ [name]: { label: title } }), [name, title]);
        const middlewares = useMemo(
          () => [
            (context: { fieldProps: FormConfigFields }) => {
              context.fieldProps.componentProps = { placeholder: title };
            },
          ],
          [title],
        );
        return useDynamicConfig({ template: currentTemplate, fields: currentFields, middlewares });
      },
      { initialProps: { name: 'first', title: 'First' } },
    );
    expect(result.current.formConfig[0]?.label).toBe('First');
    rerender({ name: 'next', title: 'Next' });
    expect(result.current.formConfig[0]).toMatchObject({
      name: 'next',
      label: 'Next',
      componentProps: { placeholder: 'Next' },
    });
  });
  it('honors permission:false in the HOC and preserves wrapped props', () => {
    const Child = ({ message }: { message: string }) => {
      const context = useDynamicFormContext();
      return <span>{message + ':' + String(context.permission)}</span>;
    };
    const Wrapped = withDynamicForm<{ message: string }>({ permission: false })(Child);
    render(<Wrapped message="Permission" />);
    expect(screen.getByText('Permission:false')).toBeTruthy();
  });
  it('lets a provider mode change update fields without remounting', () => {
    function Content() {
      const context = useDynamicFormContext();
      const { formConfig } = useDynamicConfig({ template, fields });
      return (
        <>
          <button type="button" onClick={() => context.setDisplayMode(FormMode.preview)}>
            Preview
          </button>
          <DynamicForm initialValues={{ name: 'Saved' }}>
            <FormComponent formConfig={formConfig} />
          </DynamicForm>
        </>
      );
    }
    render(
      <DynamicFormProvider>
        <Content />
      </DynamicFormProvider>,
    );
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();
    fireEvent.click(screen.getByText('Preview'));
    expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
    expect(screen.getByText('Saved')).toBeTruthy();
  });
});

describe('form rendering', () => {
  function Example({
    mode = FormMode.edit,
    onFinish = vi.fn(),
  }: {
    mode?: FormMode;
    onFinish?: (values: unknown) => void;
  }) {
    function Content() {
      const { formConfig } = useDynamicConfig({ template, fields });
      return (
        <>
          <FormComponent formConfig={formConfig} />
          <button type="submit">Submit</button>
        </>
      );
    }
    return (
      <DynamicForm displayMode={mode} onFinish={onFinish}>
        <Content />
      </DynamicForm>
    );
  }
  it('retains Ant Design validation and submission', async () => {
    const submit = vi.fn();
    render(<Example onFinish={submit} />);
    fireEvent.click(screen.getByText('Submit'));
    expect(await screen.findByText('Name is required')).toBeTruthy();
    expect(submit).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Updated' } });
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => expect(submit).toHaveBeenCalledWith({ name: 'Updated' }));
  });
  it('renders snapshot differences and resolves select labels', () => {
    function Content() {
      const middleware = useMemo(() => [createSnapshotMiddleware({ choice: 0 }, { choice: 1 })], []);
      const { formConfig } = useDynamicConfig({
        template: [{ type: FormFieldType.Select, name: 'choice' }],
        fields: {
          choice: {
            label: 'Choice',
            componentProps: {
              options: [
                { label: 'Zero', value: 0 },
                { label: 'One', value: 1 },
              ],
            },
          },
        },
        middlewares: middleware,
      });
      return <FormComponent formConfig={formConfig} />;
    }
    render(
      <DynamicForm displayMode={FormMode.snapshot}>
        <Content />
      </DynamicForm>,
    );
    expect(screen.getByLabelText('Previous value').textContent).toBe('Zero');
    expect(screen.getByLabelText('Current value').textContent).toBe('One');
  });
  it('binds custom components through an isolated registry', async () => {
    const registry = new ComponentRegistry();
    registry.register('Uppercase', ({ value, onChange }: { value?: string; onChange?: (value: string) => void }) => (
      <Input
        aria-label="Custom value"
        value={value}
        onChange={(event) => onChange?.(event.target.value.toUpperCase())}
      />
    ));
    const submitted = vi.fn();
    render(
      <DynamicForm registry={registry} onFinish={submitted}>
        <FormComponent formConfig={[{ type: FormFieldType.Custom, name: 'custom', componentName: 'Uppercase' }]} />
        <button type="submit">Save custom</button>
      </DynamicForm>,
    );
    fireEvent.change(screen.getByLabelText('Custom value'), { target: { value: 'custom' } });
    fireEvent.click(screen.getByText('Save custom'));
    await waitFor(() => expect(submitted).toHaveBeenCalledWith({ custom: 'CUSTOM' }));
  });
  it('forwards non-value bindings and custom log callbacks', async () => {
    const registry = new ComponentRegistry();
    const log = vi.fn();
    const submit = vi.fn();
    registry.register(
      'Consent',
      ({
        checked,
        onChange,
        onLogRecord,
      }: {
        checked?: boolean;
        onChange?: React.ComponentProps<typeof Checkbox>['onChange'];
        onLogRecord?: (form?: unknown, name?: string) => void;
      }) => (
        <>
          <Checkbox checked={checked} onChange={onChange}>
            Consent
          </Checkbox>
          <button type="button" onClick={() => onLogRecord?.(undefined, 'document.pdf')}>
            Log download
          </button>
        </>
      ),
    );
    render(
      <DynamicForm registry={registry} onFinish={submit}>
        <FormComponent
          formConfig={[
            {
              type: FormFieldType.Custom,
              componentName: 'Consent',
              name: 'consent',
              valuePropName: 'checked',
              onLogRecord: log,
            },
          ]}
        />
        <button type="submit">Submit consent</button>
      </DynamicForm>,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Consent' }));
    fireEvent.click(screen.getByText('Log download'));
    expect(log).toHaveBeenCalledWith(undefined, 'document.pdf');
    fireEvent.click(screen.getByText('Submit consent'));
    await waitFor(() => expect(submit).toHaveBeenCalledWith({ consent: true }));
  });
  it('preserves IME composition and truncates text without splitting emoji', () => {
    render(
      <DynamicForm>
        <FormComponent
          formConfig={[
            {
              type: FormFieldType.TextArea,
              name: 'notes',
              label: 'Notes',
              componentProps: { maxLength: 3, showCount: true },
            },
          ]}
        />
      </DynamicForm>,
    );
    const input = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'AB😀' } });
    expect(input.value).toBe('AB');
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: '中文输入' } });
    expect(input.value).toBe('中文输入');
    fireEvent.compositionEnd(input);
    expect(input.value).toBe('中文输');
    expect(screen.getByText('3 / 3')).toBeTruthy();
  });
  it('reacts to false dependency values and computes zero', async () => {
    function Content() {
      const fields: FormConfigFields[] = useMemo(
        () => [
          { type: FormFieldType.Input, name: 'source', label: 'Source' },
          {
            type: FormFieldType.NumberInput,
            name: 'target',
            label: 'Target',
            dependenciesConfig: [
              {
                type: DependentTypeEnum.ATTRIBUTE,
                dependsOn: ['source'],
                calculate: ([value]) => ({ disabled: value === '' }),
              },
              { type: DependentTypeEnum.COMPUTE, dependsOn: ['source'], calculate: () => 0 },
            ],
          },
        ],
        [],
      );
      return <FormComponent formConfig={fields} />;
    }
    render(
      <DynamicForm initialValues={{ source: 'enabled' }}>
        <Content />
      </DynamicForm>,
    );
    await waitFor(() =>
      expect((screen.getByRole('spinbutton', { name: 'Target' }) as HTMLInputElement).value).toBe('0'),
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Source' }), { target: { value: '' } });
    await waitFor(() =>
      expect((screen.getByRole('spinbutton', { name: 'Target' }) as HTMLInputElement).disabled).toBe(true),
    );
  });
  it('preserves unnamed Span placeholders without creating form fields', () => {
    const { container } = render(
      <DynamicForm>
        <FormComponent
          formConfig={[
            { type: FormFieldType.Span, span: 8 },
            { type: FormFieldType.Input, name: 'name', span: 16 },
          ]}
        />
      </DynamicForm>,
    );
    expect(container.querySelector('.ant-col-8')).toBeTruthy();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });
});

describe('asynchronous loading', () => {
  it('discards stale results when a data-source changes and aborts on unmount', async () => {
    const pending = new Map<string, (value: readonly SelectOption[]) => void>();
    const signals: AbortSignal[] = [];
    const manager = new DataSourceManager({
      [DataSourceType.API]: (source, context) => {
        if (source.type !== DataSourceType.API) return [];
        signals.push(context.signal!);
        return new Promise((resolve) => pending.set(source.url, resolve));
      },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DynamicFormProvider dataSources={manager}>{children}</DynamicFormProvider>
    );
    const first = { type: DataSourceType.API as const, url: '/first' },
      second = { type: DataSourceType.API as const, url: '/second' };
    const { result, rerender, unmount } = renderHook(({ source }) => useDataSource(source), {
      wrapper,
      initialProps: { source: first },
    });
    rerender({ source: second });
    expect(signals[0]?.aborted).toBe(true);
    await act(async () => {
      pending.get('/second')?.([{ label: 'New', value: 2 }]);
    });
    await waitFor(() => expect(result.current.options[0]?.value).toBe(2));
    await act(async () => {
      pending.get('/first')?.([{ label: 'Old', value: 1 }]);
    });
    expect(result.current.options[0]?.value).toBe(2);
    unmount();
    expect(signals[1]?.aborted).toBe(true);
  });
  it('refreshes when a named source is replaced and surfaces failures', async () => {
    const manager = new DataSourceManager();
    manager.register('choices', { type: DataSourceType.INLINE, options: [{ label: 'A', value: 1 }] });
    const onError = vi.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DynamicFormProvider dataSources={manager} onError={onError}>
        {children}
      </DynamicFormProvider>
    );
    const { result } = renderHook(() => useDataSource('choices'), { wrapper });
    await waitFor(() => expect(result.current.options[0]?.value).toBe(1));
    act(() => {
      manager.register('choices', { type: DataSourceType.INLINE, options: [{ label: 'B', value: 2 }] });
    });
    await waitFor(() => expect(result.current.options[0]?.value).toBe(2));
    act(() => {
      manager.register('choices', { type: DataSourceType.API, url: 'invalid://source' });
    });
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(onError).toHaveBeenCalled();
  });
});

describe('registered date adapters', () => {
  it('normalizes stored dates and uses the supplied date parser', () => {
    const parse = vi.fn(() => undefined);
    const registry = new ComponentRegistry();
    registry.register(FormFieldType.Date, ({ value }: { value?: unknown }) => <span>{String(value)}</span>);
    render(
      <DynamicForm registry={registry} dateAdapter={{ parse, format: String }} initialValues={{ date: '2025-01-01' }}>
        <FormComponent formConfig={[{ type: FormFieldType.Date, name: 'date' }]} />
      </DynamicForm>,
    );
    expect(parse).toHaveBeenCalledWith('2025-01-01', 'YYYY-MM-DD');
  });
});
