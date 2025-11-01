import { useMemo } from "react";
import { BasicTemplateProps, FormFields } from "./FormTemplate"
import useGetFormInstance from "./useGetForminstance"
import { mergeWith } from 'lodash'

interface DynamicFormOptions {
    template: BasicTemplateProps[]
    fields: Record<FormFields, object>;
}

export function useDynamicForm(options: DynamicFormOptions) {
    const { template, fields } = options
    const form = useGetFormInstance()

    const formConfig = useMemo(() => {
        return template.map((field) => {
            return mergeWith(field, fields[FormFields[field.name]])
        })
    }, [template, fields])

    return { form, formConfig }
}

export default useDynamicForm