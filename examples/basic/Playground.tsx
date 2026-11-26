import React, { useMemo, useState } from 'react';
import { Button, Card, Form, Segmented, Space, Tabs, Tag, Typography } from 'antd';
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
  useDynamicConfig,
} from '../../src';
import type { FormConfigFields, FormTemplate } from '../../src';
import { JsonFormExample } from '../ai/JsonFormExample';
import { LongFormExample } from '../advanced/LongFormExample';
import { ComplexDependenciesExample } from '../advanced/ComplexDependenciesExample';

interface Values {
  name?: string;
  country?: string;
  city?: string;
  address?: string;
  amount?: number;
  notes?: string;
  status?: string;
}
const template: FormTemplate<Values> = [
  { type: FormFieldType.Input, name: 'name', span: 12 },
  { type: FormFieldType.Select, name: 'country', span: 12 },
  { type: FormFieldType.Select, name: 'city', span: 12 },
  { type: FormFieldType.NumberInput, name: 'amount', span: 12 },
  { type: FormFieldType.Input, name: 'address' },
  { type: FormFieldType.TextArea, name: 'notes' },
  { type: FormFieldType.Custom, name: 'status' },
];
const before = {
  name: 'Alex',
  country: 'SG',
  city: 'Central',
  amount: 0,
  address: '1 Example Road',
  notes: 'Previous note',
  status: 'Draft',
};
const after = {
  ...before,
  name: 'Alex Chen',
  amount: 1200,
  notes: 'Updated with supporting details.',
  status: 'Ready',
};

function Fields({ mode, additional }: { mode: FormMode; additional: boolean }) {
  const fields = useMemo<Record<string, FormConfigFields<Values>>>(
    () => ({
      name: { label: 'Name', rules: [{ required: true, message: 'Please enter a name.' }] },
      country: { label: 'Country', dataSource: 'countries' },
      city: {
        label: 'City',
        dataSource: {
          type: DataSourceType.API,
          url: '/cities',
          dependsOn: ['country'],
          params: (values) => ({ country: values.country }),
        },
      },
      amount: { label: 'Amount', componentProps: { min: 0, precision: 2 } },
      address: {
        label: 'Address',
        dependenciesConfig: {
          type: DependentTypeEnum.ATTRIBUTE,
          dependsOn: ['country'],
          calculate: ([country]) => ({
            disabled: !country,
            placeholder: country ? 'Address in ' + String(country) : 'Select a country first',
          }),
        },
      },
      notes: { label: 'Notes', componentProps: { rows: 3, maxLength: 200, showCount: true } },
      status: { label: 'Custom registered component', componentName: 'Status' },
    }),
    [],
  );
  const currentTemplate = useMemo<FormTemplate<Values>>(
    () =>
      additional ? [...template, { type: FormFieldType.Input, name: ['extra'], label: 'Runtime field' }] : template,
    [additional],
  );
  const middlewares = useMemo(
    () =>
      mode === FormMode.snapshot ? [createSnapshotMiddleware<Values, FormConfigFields<Values>>(before, after)] : [],
    [mode],
  );
  const { formConfig } = useDynamicConfig<Values>({ template: currentTemplate, fields, middlewares });
  return <FormComponent formConfig={formConfig} />;
}

export function Playground() {
  const [form] = Form.useForm<Values>();
  const [mode, setMode] = useState(FormMode.edit);
  const [additional, setAdditional] = useState(false);
  const [submitted, setSubmitted] = useState<Values>();
  const registry = useMemo(() => {
    const instance = new ComponentRegistry();
    instance.register('Status', ({ value }: { value?: string }) => <Tag color="blue">{value || 'Draft'}</Tag>);
    return instance;
  }, []);
  const sources = useMemo(() => {
    const instance = new DataSourceManager<Values>({
      [DataSourceType.API]: async (source, context) => {
        if (source.type !== DataSourceType.API) return [];
        const country = context.values?.country;
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, 250);
          context.signal?.addEventListener(
            'abort',
            () => {
              clearTimeout(timer);
              reject(new DOMException('Aborted', 'AbortError'));
            },
            { once: true },
          );
        });
        return (country === 'PH' ? ['Manila', 'Cebu'] : ['Central', 'East']).map((city) => ({
          label: city,
          value: city,
        }));
      },
    });
    instance.register('countries', {
      type: DataSourceType.INLINE,
      options: [
        { label: 'Singapore', value: 'SG' },
        { label: 'Philippines', value: 'PH' },
      ],
    });
    return instance;
  }, []);
  return (
    <main className="playground">
      <header>
        <span className="eyebrow">DYNAMIC FORM / 0.1</span>
        <h1>
          One schema.
          <br />
          Every form state.
        </h1>
        <p>Long forms. Multi-stage dependencies. Typed configuration.</p>
      </header>
      <Tabs
        defaultActiveKey={new URLSearchParams(window.location.search).get('example') ?? 'basic'}
        items={[
          {
            key: 'basic',
            label: 'Basics & snapshots',
            children: (
              <>
                <Card className="form-card" title="Library playground" extra={<Tag>React + Ant Design</Tag>}>
                  <Space wrap className="toolbar">
                    <Segmented
                      options={[FormMode.edit, FormMode.preview, FormMode.snapshot]}
                      value={mode}
                      onChange={(value) => setMode(value as FormMode)}
                    />
                    <Button onClick={() => setAdditional((value) => !value)}>
                      {additional ? 'Remove' : 'Add'} runtime field
                    </Button>
                  </Space>
                  <DynamicForm<Values>
                    form={form}
                    displayMode={mode}
                    initialValues={after}
                    registry={registry}
                    dataSources={sources}
                    onFinish={setSubmitted}
                  >
                    <Fields mode={mode} additional={additional} />
                    {mode === FormMode.edit && (
                      <Button type="primary" htmlType="submit">
                        Validate & submit
                      </Button>
                    )}
                  </DynamicForm>
                  {submitted && (
                    <Typography.Paragraph className="result">
                      <pre>{JSON.stringify(submitted, null, 2)}</pre>
                    </Typography.Paragraph>
                  )}
                </Card>
              </>
            ),
          },
          { key: 'long', label: 'Long forms', children: <LongFormExample /> },
          { key: 'linked', label: 'Complex dependencies', children: <ComplexDependenciesExample /> },
          { key: 'ai', label: 'AI / JSON', children: <JsonFormExample /> },
        ]}
      />

      <footer>Try switching countries, changing modes, or adding a field without remounting the form.</footer>
    </main>
  );
}
