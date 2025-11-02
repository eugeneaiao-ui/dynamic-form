import React from 'react'
import { Form } from 'antd'
import { FormProvider } from './FormContext'
import FormConSumer from './FormConsumer'

export const DynamicForm: React.FC = () => {
    const [form] = Form.useForm()

    return (
        <FormProvider value={{ form, displayMode: 'preview', permission: ['read'] }}>
            <FormConSumer />
        </FormProvider>
    )
}

export default DynamicForm