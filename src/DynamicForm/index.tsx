import React, { useContext, useState } from 'react'
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
    return (Component: React.ComponentType) => {
        const WrappedComponent = (props: any) => {
            const [form] = Form.useForm()
            const [displayMode, setDisplayMode] = useState<FormMode>(options.displayMode || 'edit')
            const [permission, setPermission] = useState<string[]>(options.permission || [])
            const [disabled, setDisabled] = useState<boolean>(options.disabled || false)

            return (
                <FormProvider value={{
                    disabled,
                    displayMode,
                    permission,
                    form,
                    setDisplayMode,
                    setPermission,
                    setDisabled
                }}>
                    <Component {...props} />
                </FormProvider>
            )
        }
        return WrappedComponent
    }
}

export { DynamicForm, FormConSumer }