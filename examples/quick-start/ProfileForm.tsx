import React from 'react';
import { Button } from 'antd';
import { DynamicForm, FormComponent, FormFieldType, useDynamicConfig } from '../../src';
import type { FormConfigFields, FormTemplate } from '../../src';

export interface ProfileValues {
  name: string;
  country: string;
  notes?: string;
}

const template: FormTemplate<ProfileValues> = [
  { name: 'name', type: FormFieldType.Input, span: 12 },
  { name: 'country', type: FormFieldType.Select, span: 12 },
  { name: 'notes', type: FormFieldType.TextArea },
];

const fields: Record<string, FormConfigFields<ProfileValues>> = {
  name: {
    label: 'Name',
    rules: [{ required: true, message: 'Please enter your name.' }],
    componentProps: { placeholder: 'Alex' },
  },
  country: {
    label: 'Country',
    rules: [{ required: true, message: 'Please select a country.' }],
    componentProps: {
      allowClear: true,
      options: [
        { label: 'Singapore', value: 'SG' },
        { label: 'Philippines', value: 'PH' },
      ],
    },
  },
  notes: {
    label: 'Notes',
    tooltip: 'Additional information, up to 200 UTF-16 code units.',
    componentProps: { rows: 3, maxLength: 200, showCount: true },
  },
};

function ProfileFields() {
  const { formConfig } = useDynamicConfig<ProfileValues>({ template, fields });
  return <FormComponent formConfig={formConfig} />;
}

export function ProfileForm({ onSubmit }: { onSubmit: (values: ProfileValues) => void }) {
  return (
    <DynamicForm<ProfileValues> initialValues={{ country: 'SG' }} onFinish={onSubmit}>
      <ProfileFields />
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </DynamicForm>
  );
}
