import { createContext } from 'react'
import { FormInstance } from 'antd'

export type DynamicFormContextValue = {
    form: FormInstance
}

export const FormContext = createContext<DynamicFormContextValue | any>({})


export const FormProvider = FormContext.Provider

export default FormContext