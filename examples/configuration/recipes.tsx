import React, { useMemo } from 'react';
import { Checkbox } from 'antd';
import {
  ComponentRegistry,
  createSnapshotMiddleware,
  DataSourceManager,
  DataSourceType,
  DependentTypeEnum,
  DynamicForm,
  FormComponent,
  FormFieldType,
  FormMode,
  SnapshotText,
  useDynamicConfig,
} from '../../src';
import type {
  FormConfigFields,
  FormMiddlewareContext,
  FormTemplate,
  Middleware,
  SelectOption,
  SnapshotValues,
} from '../../src';
import { fieldKey } from '../../src/core';

export interface OrderValues {
  country?: string;
  city?: string | null;
  quantity?: number;
  price?: number;
  total?: number;
  consent?: boolean;
  profile?: { email?: string };
}

export const orderTemplate: FormTemplate<OrderValues> = [
  { type: FormFieldType.Title, label: 'Order' },
  { name: 'quantity', type: FormFieldType.NumberInput, span: 8 },
  { name: 'price', type: FormFieldType.NumberInput, span: 8 },
  { name: 'total', type: FormFieldType.NumberInput, span: 8 },
  { name: ['profile', 'email'], type: FormFieldType.Input, span: 16 },
  { type: FormFieldType.Span, span: 8 },
  { name: 'consent', type: FormFieldType.Custom, componentName: 'Consent' },
];

export const orderFields: Record<string, FormConfigFields<OrderValues>> = {
  quantity: { label: 'Quantity', componentProps: { min: 0 } },
  price: { label: 'Unit price', componentProps: { min: 0, precision: 2 } },
  total: {
    label: 'Total',
    componentProps: { disabled: true },
    dependenciesConfig: {
      type: DependentTypeEnum.COMPUTE,
      dependsOn: ['quantity', 'price'],
      calculate: ([quantity, price]) => Number(quantity ?? 0) * Number(price ?? 0),
    },
  },
  [fieldKey(['profile', 'email'])]: {
    label: 'Email',
    rules: [{ type: 'email', message: 'Please enter a valid email.' }],
  },
  consent: {
    label: 'Consent',
    valuePropName: 'checked',
    rules: [
      {
        validator: (_rule, checked: unknown) =>
          checked === true ? Promise.resolve() : Promise.reject(new Error('Please accept before submitting.')),
      },
    ],
  },
};

// #region sources
export function createLocationSources() {
  const sources = new DataSourceManager<OrderValues>();
  sources.register('countries', {
    type: DataSourceType.INLINE,
    options: [
      { label: 'Singapore', value: 'SG' },
      { label: 'Philippines', value: 'PH' },
    ],
  });
  sources.register('cities', {
    type: DataSourceType.API,
    url: '/api/cities',
    dependsOn: ['country'],
    params: (values) => ({ country: values.country }),
    select: (response) => {
      // Replace this shape check with the schema used by your API.
      if (!Array.isArray(response)) throw new Error('Expected a city array.');
      return response.map((item: unknown): SelectOption => {
        if (
          typeof item !== 'object' ||
          item === null ||
          !('id' in item) ||
          !('name' in item) ||
          typeof item.id !== 'string' ||
          typeof item.name !== 'string'
        ) {
          throw new Error('Invalid city response.');
        }
        return { label: item.name, value: item.id };
      });
    },
  });
  return sources;
}
// #endregion sources

// #region attributes
export const locationFields: Record<string, FormConfigFields<OrderValues>> = {
  country: { label: 'Country', dataSource: 'countries' },
  city: {
    label: 'City',
    dataSource: 'cities',
    dependenciesConfig: {
      type: DependentTypeEnum.ATTRIBUTE,
      dependsOn: ['country'],
      calculate: ([country]) => ({ disabled: !country }),
    },
  },
};
// #endregion attributes

function ConsentEditor({ checked, disabled, onChange }: React.ComponentProps<typeof Checkbox>) {
  return (
    <Checkbox checked={checked} disabled={disabled} onChange={onChange}>
      I agree
    </Checkbox>
  );
}
function ConsentPreview({ checked }: { checked?: boolean }) {
  return <span>{checked ? 'Accepted' : 'Not accepted'}</span>;
}
function ConsentSnapshot({ snapshotValues = {} }: { snapshotValues?: SnapshotValues }) {
  return <SnapshotText values={snapshotValues} render={(value) => (value ? 'Accepted' : 'Not accepted')} />;
}
export function createOrderRegistry() {
  const registry = new ComponentRegistry();
  registry.register('Consent', { edit: ConsentEditor, preview: ConsentPreview, snapshot: ConsentSnapshot });
  return registry;
}

// #region middleware
export const compactControls: Middleware<FormMiddlewareContext<OrderValues>> = (context, next) => {
  context.fieldProps.componentProps = { size: 'small', ...context.fieldProps.componentProps };
  next();
};
// #endregion middleware

const before: OrderValues = { quantity: 1, price: 10, total: 10, consent: false };
const after: OrderValues = { quantity: 2, price: 10, total: 20, consent: true };

function OrderFields({ mode }: { mode: FormMode }) {
  const middlewares = useMemo(
    () =>
      mode === FormMode.snapshot
        ? [compactControls, createSnapshotMiddleware<OrderValues, FormConfigFields<OrderValues>>(before, after)]
        : [compactControls],
    [mode],
  );
  const { formConfig } = useDynamicConfig<OrderValues>({ template: orderTemplate, fields: orderFields, middlewares });
  return <FormComponent formConfig={formConfig} />;
}

export function OrderExample({ mode = FormMode.edit }: { mode?: FormMode }) {
  const registry = useMemo(createOrderRegistry, []);
  return (
    <DynamicForm<OrderValues> registry={registry} displayMode={mode} initialValues={after}>
      <OrderFields mode={mode} />
    </DynamicForm>
  );
}
