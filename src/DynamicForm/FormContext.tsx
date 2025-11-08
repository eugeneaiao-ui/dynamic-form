import { createContext } from 'react'
import { FormInstance } from 'antd'

export type DynamicFormContextValue = {
    form: FormInstance,
    displayMode: 'preview' | 'edit',
    permission: string[],
    disabled: boolean
}

export const FormContext = createContext<DynamicFormContextValue>({ permission: [], displayMode: 'edit', form: {} as FormInstance, disabled: false })


export const FormProvider = FormContext.Provider

export default FormContext