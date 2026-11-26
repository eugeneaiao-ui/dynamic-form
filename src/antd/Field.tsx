import React from 'react';
import { DatePicker, Form, Input, InputNumber, Select } from 'antd';
import type { FormItemProps } from 'antd';
import { dependencyPaths, FormFieldType, FormMode, getValue, isEqual } from '../core';
import type { FormValues, SelectOption } from '../core';
import { useDynamicFormContext } from '../react/context';
import { useDataSource } from '../react/useDataSource';
import { useDependencies } from '../react/useDependencies';
import type { FormConfigFields } from './types';
import { Utf16LimitedTextArea } from './Utf16LimitedTextArea';
import { SnapshotText, ValueText } from './value';
const itemKeys = [
  'label',
  'colon',
  'required',
  'rules',
  'help',
  'extra',
  'tooltip',
  'hidden',
  'validateTrigger',
  'validateStatus',
  'validateFirst',
  'hasFeedback',
  'valuePropName',
  'trigger',
  'normalize',
  'getValueProps',
  'getValueFromEvent',
  'preserve',
  'messageVariables',
  'labelCol',
  'wrapperCol',
  'labelAlign',
  'noStyle',
  'initialValue',
  'className',
  'style',
] as const;
function getItemProps<Values extends object>(field: FormConfigFields<Values>): FormItemProps<Values> {
  const result: Record<string, unknown> = {};
  for (const key of itemKeys) if (key in field) result[key] = field[key];
  return { ...result, ...field.formItemProps, name: field.name } as FormItemProps<Values>;
}
function FieldControl({
  field,
  componentProps,
  ...boundProps
}: {
  field: FormConfigFields;
  componentProps: Record<string, unknown>;
  value?: unknown;
  [key: string]: unknown;
}): React.ReactElement {
  const context = useDynamicFormContext();
  const { displayMode, registry } = context;
  const value =
    'value' in boundProps
      ? boundProps.value
      : field.name === undefined
        ? undefined
        : context.form.getFieldValue(field.name);
  const props = { ...componentProps, ...boundProps };
  const customProps = { ...props, name: field.name, displayMode, onLogRecord: field.onLogRecord };
  const custom = registry.get(field.componentName ?? field.type ?? '', displayMode);
  const snapshotValues = field.snapshotValues ?? field.snapshootValues ?? { before: undefined, after: value };
  const select = field.type === FormFieldType.Select || field.type === FormFieldType.RichTextSelect;
  const options = componentProps.options as readonly SelectOption[] | undefined;
  if (displayMode === FormMode.preview) {
    if (field.previewRender) return <>{field.previewRender(value)}</>;
    if (custom) return React.createElement(custom, { ...customProps, disabled: true });
    if (field.type === FormFieldType.Custom) throw new Error('Unknown custom component: ' + field.componentName);
    const formatted =
      field.type === FormFieldType.Date && value
        ? context.dateAdapter.format(value, String(componentProps.format ?? 'YYYY-MM-DD'))
        : value;
    return <ValueText value={formatted} options={options} select={select} />;
  }
  if (displayMode === FormMode.snapshot) {
    if (field.snapshotRender) return <>{field.snapshotRender(snapshotValues)}</>;
    if (custom)
      return React.createElement(custom, {
        ...customProps,
        disabled: true,
        snapshotValues,
        snapshootValues: snapshotValues,
      });
    if (field.type === FormFieldType.Custom) throw new Error('Unknown custom component: ' + field.componentName);
    return (
      <SnapshotText
        values={snapshotValues}
        render={(item) => <ValueText value={item} options={options} select={select} />}
      />
    );
  }
  if (custom) return React.createElement(custom, customProps);
  switch (field.type) {
    case FormFieldType.Input:
      return <Input {...(props as React.ComponentProps<typeof Input>)} />;
    case FormFieldType.NumberInput:
      return <InputNumber style={{ width: '100%' }} {...(props as React.ComponentProps<typeof InputNumber>)} />;
    case FormFieldType.Select:
    case FormFieldType.RichTextSelect:
      return <Select {...(props as React.ComponentProps<typeof Select>)} />;
    case FormFieldType.Date:
      return <DatePicker style={{ width: '100%' }} {...(props as React.ComponentProps<typeof DatePicker>)} />;
    case FormFieldType.TextArea: {
      const maxLength = componentProps.maxLength;
      if (typeof maxLength === 'number')
        return (
          <Utf16LimitedTextArea
            {...(props as React.ComponentProps<typeof Input.TextArea>)}
            maxLength={maxLength}
            showCount={componentProps.showCount === true}
          />
        );
      return <Input.TextArea {...(props as React.ComponentProps<typeof Input.TextArea>)} />;
    }
    case FormFieldType.Custom:
      throw new Error('Unknown custom component: ' + field.componentName);
    default:
      throw new Error('Unsupported field type: ' + String(field.type));
  }
}
function ResolvedField({ field }: { field: FormConfigFields }): React.ReactElement {
  const context = useDynamicFormContext();
  const componentProps = useDependencies(field);
  const data = useDataSource(field.dataSource, context.form.getFieldsValue(true) as FormValues);
  const resolvedProps: Record<string, unknown> = {
    ...componentProps,
    ...(field.dataSource !== undefined ? { options: data.options, loading: data.loading } : {}),
    disabled: context.disabled || !context.permission || Boolean(componentProps.disabled),
  };
  const itemProps = getItemProps(field);
  const format = String(resolvedProps.format ?? 'YYYY-MM-DD');
  if (field.type === FormFieldType.Date && context.displayMode === FormMode.edit) {
    itemProps.normalize = (value: unknown) => (value == null ? value : context.dateAdapter.format(value, format));
    itemProps.getValueProps = (value: unknown) => ({
      value: value == null || value === '' ? null : context.dateAdapter.parse(value, format),
    });
  }
  return (
    <>
      <Form.Item {...itemProps}>
        <FieldControl field={field} componentProps={resolvedProps} />
      </Form.Item>
      {data.error && (
        <div className="df-error" role="alert">
          {data.error.message}
        </div>
      )}
    </>
  );
}
export function RenderFormItem({ field }: { field: FormConfigFields }): React.ReactElement | null {
  const { dataSources } = useDynamicFormContext();
  if (field.type === FormFieldType.Span) return null;
  if (field.type === FormFieldType.Title)
    return field.hidden ? null : <h3 className="df-title">{field.label ?? (field.name as React.ReactNode)}</h3>;
  const watched = dependencyPaths(field);
  if (field.dataSource !== undefined) {
    try {
      watched.push(...(dataSources.get(field.dataSource).dependsOn ?? []));
    } catch {
      /* Resolving reports registration errors. */
    }
  }
  if (!watched.length) return <ResolvedField field={field} />;
  return (
    <Form.Item
      noStyle
      shouldUpdate={(previous: FormValues, next: FormValues) =>
        watched.some((path) => !isEqual(getValue(previous, path), getValue(next, path)))
      }
    >
      {() => <ResolvedField field={field} />}
    </Form.Item>
  );
}
