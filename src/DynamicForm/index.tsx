import React, { useEffect } from 'react'
import { Form } from 'antd'
import { FormProvider } from './FormContext'
import FormConSumer from './FormConsumer'

export const DynamicForm: React.FC = () => {
    const [form] = Form.useForm()

    useEffect(() => {
        form.setFieldValue('name', 'Eugene')
     }, [])

    return (
        <FormProvider value={{ form, displayMode: 'edit', permission: ['read'] }}>
            <FormConSumer />
        </FormProvider>
    )
}

export default DynamicForm