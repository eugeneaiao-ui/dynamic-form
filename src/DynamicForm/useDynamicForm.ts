import { useContext, useMemo, useRef } from "react";
import { BasicTemplateProps, FormFields, FormConfig } from "./FormTemplate"
import useGetFormInstance from "./useGetForminstance"
import MiniMiddleware, { Middleware } from "../abstract/MiniMiddleware";
import FormContext, { DynamicFormContextValue } from "./FormContext";
import { FormFieldsParams } from "./AsyncFormFields";

type FormFieldsProps = Record<FormFields, object>
type middlewareCtx = DynamicFormContextValue & DynamicFormOptions

interface DynamicFormOptions {
    template: BasicTemplateProps[]
    fields: FormFieldsProps;
    fieldProps?: FormFieldsParams
}

// 中间件定义, 守卫负责鉴权
const guideMiddleware: Middleware<middlewareCtx> = (ctx, next) => {
    const { permission, fieldProps } = ctx
    if (!permission.length) {
        ctx.fieldProps = {
            ...fieldProps,
            componentProps: {
                disabled: true
            }
        }
    }
    next()
}

// 中间件定义，负责展示模式字段控制
const displayModeMiddleware: Middleware<middlewareCtx> = (ctx, next) => {
    const { fieldProps, displayMode } = ctx;

    if (displayMode === 'preview') {
        ctx.fieldProps = {
            ...fieldProps,
            componentProps: {
                disabled: true
            }
        }
    }

    next();
}

class FormConfigBuilder extends MiniMiddleware<middlewareCtx> {
    private config: FormConfig[] = []

    constructor(
        private template: BasicTemplateProps[],
        private fields: FormFieldsProps,
        ctx?: Partial<DynamicFormContextValue>
    ) {
        super({ ...ctx, template, fields })
        this.config = [...template];
        this.setupMiddlewarePipeline()
    }

    private setupMiddlewarePipeline() {
        this.use(guideMiddleware)
            .use(displayModeMiddleware)
    }

    build(): FormConfig[] {
        return this.config.map(field => {
            const fieldProps = this.fields[field.name] || {}
            const contextForField = {
                ...this.context, // 共享的上下文，如permission, displayMode等
                fieldProps,
            };
            this.execute(contextForField)
            return {
                ...field,
                ...contextForField.fieldProps,
            }
        })
    }

}

export function useDynamicForm(options: DynamicFormOptions) {
    const { template, fields } = options
    const ctx = useContext(FormContext)
    const form = useGetFormInstance()
    const builder = useRef<FormConfigBuilder>(new FormConfigBuilder(template, fields, ctx))

    const formConfig = useMemo(() => {
        return builder.current.build()
    }, [])

    console.log('formConfig', formConfig)

    return { form, formConfig }
}

export default useDynamicForm