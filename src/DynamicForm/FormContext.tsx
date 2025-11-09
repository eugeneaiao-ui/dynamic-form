import { createContext } from 'react'
import { FormInstance } from 'antd'
import { FormMode } from '.'

export type DynamicFormContextValue = {
    form: FormInstance,
    displayMode: 'preview' | 'edit',
    permission: string[],
    disabled: boolean
    setDisplayMode: (mode: FormMode) => void
    setPermission: (perms: string[]) => void
    setDisabled: (disabled: boolean) => void
}

export const FormContext = createContext<DynamicFormContextValue>({
    permission: [], displayMode: 'edit', form: {} as FormInstance, disabled: false,
    setDisplayMode: function (mode: FormMode): void {
        throw new Error('Function not implemented.')
    },
    setPermission: function (perms: string[]): void {
        throw new Error('Function not implemented.')
    },
    setDisabled: function (disabled: boolean): void {
        throw new Error('Function not implemented.')
    }
})


export const FormProvider = FormContext.Provider

export default FormContext