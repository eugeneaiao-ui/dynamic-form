import React from 'react';
import { Form, Input, Select } from 'antd';
import { FormConfig, FormFieldsType } from './FormTemplate';

export const renderField = (field: any) => {
  const { type, componentProps = {} } = field
  switch (type) {
    case FormFieldsType.Input:
      return <Input {...componentProps} />;
    case FormFieldsType.Select:
      return (
        <Select {...componentProps} />
      );
    default:
      return null;
  }
}

export const renderFormField = (field: FormConfig) => {
  const { type, dataSource, componentProps = {}, ...rest } = field;
  return (
    <Form.Item {...rest}>{renderField(field)}</Form.Item>
  )
}


export const renderFormComponent = (template: FormConfig[]) => {
  return template.map((fieldConfig, index) => (
    <React.Fragment key={index}>
      {renderFormField(fieldConfig)}
    </React.Fragment>
  ));
}


export default renderFormComponent;