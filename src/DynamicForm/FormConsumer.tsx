import React, { useEffect, useState } from 'react'
import { Form } from 'antd'
import useDynamicForm from './useDynamicForm'
import { BasicTemplate } from './FormTemplate'
import renderFormComponent from './renderField'
import { AsyncFormFields, OptionsMap } from './AsyncFormFields'

export const FormConsumer: React.FC = () => {
    const [options, setOptions] = useState({})

    const { form, formConfig } = useDynamicForm({
        template: BasicTemplate,
        fields: AsyncFormFields,
        dataSource: options,
    })

    useEffect(() => {
        // 模拟异步获取数据源
        setTimeout(() => {
            setOptions(OptionsMap)
        }, 2000)
    }, [])

    return <Form form={form}>
        {renderFormComponent(formConfig)}
    </Form>
}

export default FormConsumer