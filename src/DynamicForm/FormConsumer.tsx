import React from 'react'
import { Form } from 'antd'
import useDynamicForm from './useDynamicForm'
import { BasicTemplate } from './FormTemplate'
import renderFormComponent from './renderField'
import { AsyncFormFields } from './AsyncFormFields'

export const FormConsumer: React.FC = () => {
    const { form } = useDynamicForm({
        template: BasicTemplate,
        fields: AsyncFormFields
    })

    return <Form form={form}>
        {renderFormComponent(BasicTemplate)}
    </Form>
}

export default FormConsumer