import React, { useContext } from 'react'
import { Form } from 'antd'
import FormContext, { FormProvider } from './FormContext'
import FormConSumer from './FormConsumer'

export enum FormMode {
    edit = 'edit',
    preview = 'preview'
}

interface DynamicFormProps {
    children: React.ReactNode;
    displayMode?: FormMode;
    permission?: string[],
    disabled?: boolean
}

const DynamicForm: React.FC<DynamicFormProps> = ({ children }) => {
    const ctx = useContext(FormContext)
    return (
        <Form form={ctx.form} layout="vertical">
            {children}
        </Form>
    )
}


export const withDynamicForm = (options: any) => {
    const { displayMode = FormMode.edit, permission = [], disabled = false } = options
    return (Component: React.ComponentType) => {
        const WrappedComponent = (props: any) => {
            const [form] = Form.useForm()
            return (
                <FormProvider value={{ disabled, displayMode, permission, form }}>
                    <Component {...props} />
                </FormProvider>
            )
        }
        return WrappedComponent
    }
}

export { DynamicForm, FormConSumer }