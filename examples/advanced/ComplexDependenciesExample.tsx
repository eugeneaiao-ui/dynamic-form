import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Space, Tag } from 'antd';
import {
  DataSourceManager,
  DataSourceType,
  DependentTypeEnum,
  DynamicForm,
  FormComponent,
  FormFieldType,
  useDynamicConfig,
} from '../../src';
import type { FormConfigFields, FormTemplate, SelectOption } from '../../src';

interface Values {
  country?: string;
  city?: string;
  quantity?: number;
  price?: number;
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  justification?: string;
}
const template: FormTemplate<Values> = [
  { name: 'country', type: FormFieldType.Select, span: 12 },
  { name: 'city', type: FormFieldType.Select, span: 12 },
  { name: 'quantity', type: FormFieldType.NumberInput, span: 8 },
  { name: 'price', type: FormFieldType.NumberInput, span: 8 },
  { name: 'subtotal', type: FormFieldType.NumberInput, span: 8 },
  { name: 'discount', type: FormFieldType.NumberInput, span: 8 },
  { name: 'tax', type: FormFieldType.NumberInput, span: 8 },
  { name: 'total', type: FormFieldType.NumberInput, span: 8 },
  { name: 'justification', type: FormFieldType.TextArea },
];
function Fields() {
  const fields = useMemo<Record<string, FormConfigFields<Values>>>(
    () => ({
      country: {
        label: 'Country',
        componentProps: {
          options: [
            { label: 'Singapore', value: 'SG' },
            { label: 'Philippines', value: 'PH' },
          ],
        },
      },
      city: {
        label: 'City · async options',
        dataSource: 'cities',
        dependenciesConfig: {
          type: DependentTypeEnum.ATTRIBUTE,
          dependsOn: ['country'],
          calculate: ([country]) => ({ disabled: !country }),
        },
      },
      quantity: { label: 'Quantity', componentProps: { min: 0 } },
      price: { label: 'Unit price', componentProps: { min: 0, precision: 2 } },
      subtotal: {
        label: 'Subtotal = quantity × price',
        componentProps: { disabled: true, precision: 2 },
        dependenciesConfig: {
          type: DependentTypeEnum.COMPUTE,
          dependsOn: ['quantity', 'price'],
          calculate: ([quantity, price]) => Number(quantity ?? 0) * Number(price ?? 0),
        },
      },
      discount: { label: 'Discount (%)', componentProps: { min: 0, max: 100 } },
      tax: { label: 'Tax (%)', componentProps: { min: 0, max: 100 } },
      total: {
        label: 'Total = discounted subtotal + tax',
        componentProps: { disabled: true, precision: 2 },
        dependenciesConfig: {
          type: DependentTypeEnum.COMPUTE,
          dependsOn: ['subtotal', 'discount', 'tax'],
          calculate: ([subtotal, discount, tax]) =>
            Math.round(Number(subtotal ?? 0) * (1 - Number(discount ?? 0) / 100) * (1 + Number(tax ?? 0) / 100) * 100) /
            100,
        },
      },
      justification: {
        label: 'Justification · required when total > 5,000',
        componentProps: { rows: 2 },
        dependenciesConfig: {
          type: DependentTypeEnum.ATTRIBUTE,
          dependsOn: ['total'],
          calculate: ([total]) => ({ disabled: Number(total ?? 0) <= 5000 }),
        },
        rules: [
          ({ getFieldValue }) => ({
            validator: (_rule, value: unknown) =>
              Number(getFieldValue('total')) > 5000 && !String(value ?? '').trim()
                ? Promise.reject(new Error('Please justify totals above 5,000.'))
                : Promise.resolve(),
          }),
        ],
      },
    }),
    [],
  );
  const { formConfig } = useDynamicConfig<Values>({ template, fields });
  return <FormComponent formConfig={formConfig} />;
}
export function ComplexDependenciesExample() {
  const [form] = Form.useForm<Values>();
  const [status, setStatus] = useState('Async options use a local 200 ms mock.');
  const [saved, setSaved] = useState<string>();
  const sources = useMemo(() => {
    const manager = new DataSourceManager<Values>({
      [DataSourceType.API]: async (source, context) => {
        if (source.type !== DataSourceType.API) return [];
        const country = context.values?.country;
        setStatus('Loading options for ' + String(country) + '…');
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, 200);
          context.signal?.addEventListener(
            'abort',
            () => {
              clearTimeout(timer);
              reject(new DOMException('Aborted', 'AbortError'));
            },
            { once: true },
          );
        });
        if (context.signal?.aborted) return [];
        setStatus('Latest options loaded for ' + String(country) + '.');
        return (country === 'PH' ? ['Manila', 'Cebu'] : ['Central', 'East']).map(
          (city): SelectOption => ({ label: city, value: city }),
        );
      },
    });
    manager.register('cities', { type: DataSourceType.API, url: '/mock/cities', dependsOn: ['country'] });
    return manager;
  }, []);
  return (
    <Card className="form-card" title="Complex dependencies — one change, several outcomes">
      <Space wrap style={{ marginBottom: 16 }}>
        <Tag color="blue">Async cascade</Tag>
        <Tag color="purple">Multi-stage calculation</Tag>
        <Tag color="green">Dynamic attributes</Tag>
        <Tag color="orange">Conditional validation</Tag>
      </Space>
      <Alert
        type="info"
        showIcon
        message="Try quantity 20 and unit price 300"
        description="Subtotal becomes 6,000; with 8% tax total becomes 6,480. Justification is enabled and must be completed before submission."
        style={{ marginBottom: 20 }}
      />
      <DynamicForm<Values>
        form={form}
        name="linked-example"
        dataSources={sources}
        initialValues={{ country: 'SG', quantity: 10, price: 100, discount: 0, tax: 8 }}
        onValuesChange={(changed) => {
          if ('country' in changed) form.setFieldValue('city', undefined);
          setSaved(undefined);
        }}
        onFinish={(values) => setSaved(JSON.stringify(values, null, 2))}
      >
        <Fields />
        <Button type="primary" htmlType="submit">
          Validate & submit linked form
        </Button>
      </DynamicForm>
      <p role="status">{status}</p>
      {saved && <pre aria-label="Linked form submission">{saved}</pre>}
    </Card>
  );
}
