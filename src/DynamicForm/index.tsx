import React from 'react'
import { Form } from 'antd'
import { FormProvider } from './FormContext'
import FormConSumer from './FormConsumer'

interface DynamicFormProps {
    children: React.ReactNode;
}

const DynamicForm: React.FC<DynamicFormProps> = (props) => {
    const [form] = Form.useForm()

    return (
        <FormProvider value={{ form, displayMode: 'edit', permission: ['read'] }}>
            <Form form={form} layout="vertical">
                {props.children}
            </Form>
        </FormProvider>
    )
}

export { DynamicForm, FormConSumer }