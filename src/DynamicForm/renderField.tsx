import React, { useState } from 'react';
import { Form, FormInstance, FormItemProps, Input, Select } from 'antd';
import { useUpdateEffect, useRequest } from 'ahooks'
import { FormConfig, FormFieldsType } from './FormTemplate';
import { TableForm } from '../component/TableForm'

export const renderField = (field: FormConfig) => {
  const { type, componentProps = {} } = field
  switch (type) {
    case FormFieldsType.Input:
      return <Input {...componentProps} />;
    case FormFieldsType.Select:
      return (
        <Select {...componentProps} />
      );
    case FormFieldsType.Custom: {
      return (
        <TableForm name={field.name} {...componentProps} />
      )
    }

    default:
      return null;
  }
}


type CalculateFieldProps = { children: React.ReactNode, field: FormConfig, formItemProps: FormItemProps } & FormInstance<any>

const fetchCity = async (country: string): Promise<any[]> => {
  return [{ label: 'Shenzhen', value: 'SZ' }]
}

const CalculateField: React.FC<CalculateFieldProps> = ({
  children,
  formItemProps,
  getFieldValue,
  field,
}) => {
  const { dependentConfig } = field
  if (!dependentConfig) return children
  const { relyOn, type } = dependentConfig
  const relyOnValue = getFieldValue([relyOn])
  const [options, setOptions] = useState<any[]>([]);

  const { run } = useRequest(fetchCity, {
    manual: true, onSuccess: (d) => {
      setOptions(d)
      // setFieldValue(name, d)
    },
  })

  useUpdateEffect(() => {
    if (type !== 'fetch') return

    run(relyOnValue)
  }, [relyOnValue, type])

  const modifiedField: FormConfig = {
    ...field, // 保留原字段所有配置
    componentProps: {
      ...field.componentProps, // 保留原componentProps（如placeholder、style）
      options, // 注入动态获取的下拉选项（仅Select类型生效）
    },
  };

  return (
    <Form.Item {...formItemProps}>
      {renderField(modifiedField)}
    </Form.Item>
  );
}

export const renderFormField = (field: FormConfig) => {
  const { type, dataSource, componentProps = {}, dependentConfig, ...rest } = field;

  if (dependentConfig) {
    return (
      <Form.Item noStyle shouldUpdate={(prev, current) => {
        const { relyOn } = dependentConfig
        const isRelyOnChange = relyOn?.some(key => prev[key] !== current[key])
        return Boolean(isRelyOnChange)
      }}>
        {
          (formIntance) => {
            return (
              <CalculateField field={field} formItemProps={rest} {...formIntance}>
                <Form.Item {...rest}>{renderField(field)}</Form.Item>
              </CalculateField>
            )
          }
        }
      </Form.Item>
    )
  }

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