import { useContext, useMemo, useRef } from "react";
import { BasicTemplateProps, FormConfig } from "./FormTemplate"
import useGetFormInstance from "./useGetForminstance"
import { EventEmitter } from 'events';
import MiniMiddleware, { Middleware } from "../abstract/MiniMiddleware";
import FormContext, { DynamicFormContextValue } from "./FormContext";
import { FormFieldsParams } from "./AsyncFormFields";

type FormFieldsProps = Record<string, object>
export type middlewareCtx = DynamicFormContextValue & DynamicFormOptions

interface DynamicFormOptions {
    template: BasicTemplateProps[]
    fields: FormFieldsProps;
    fieldProps?: FormFieldsParams
    dataSource?: any;
}

interface DynamicForm {
    template: FormConfig[]
    fields: FormFieldsProps
    dataSource?: any,
    middlewares?: Middleware<middlewareCtx>[]
}

class FormConfigBuilder extends MiniMiddleware<middlewareCtx> {
    #config: FormConfig[] = [];
    #context: any = {};
    emitter: EventEmitter = new EventEmitter();

    // 构造函数修改：不再传入ctx（改为每次execute时传入）
    constructor(
        private template: BasicTemplateProps[],
        private fields: FormFieldsProps,
    ) {
        super();
        this.#config = [...template];
    }

    build(): FormConfig[] {
        return this.#config.map(field => {
            // 1. 为当前字段创建独立上下文（包含全局上下文+字段自身配置）
            const fieldProps = this.fields[field.name] || {};
            const initialContext: middlewareCtx = {
                // 从FormContext获取的全局上下文（如permission、displayMode）
                ...this.#context,
                template: this.template,
                fields: this.fields,
                fieldProps: fieldProps // 当前字段的初始fieldProps
            };
            // 2. 执行中间件，获取修改后的上下文！
            const updatedContext = this.execute(initialContext);

            // 3. 基于修改后的context.fieldProps拼接结果
            return {
                ...field,
                ...updatedContext.fieldProps // ✅ 用中间件修改后的fieldProps！
            };
        });
    }

    // 新增：存储全局上下文（从外部传入，如FormContext的值）
    setGlobalCtx(ctx: Partial<DynamicFormContextValue>, fields?: FormFieldsProps): this {
        this.#context = ctx;
        fields && (this.fields = fields);
        return this;
    }

    // addMiddleware逻辑不变（链式添加中间件）
    addMiddleware(middleware: Middleware<middlewareCtx>): this {
        this.use(middleware);
        return this;
    }

    addMiddlewares(middlewares: Middleware<middlewareCtx>[]): this {
        middlewares.forEach(mw => this.use(mw));
        return this;
    }
}

// 同时修改useDynamicForm Hook，传入全局上下文
export function useDynamicForm(options: DynamicForm) {
    const { template, fields, dataSource, middlewares = [] } = options;
    const globalCtx = useContext(FormContext); // 获取全局上下文
    const form = useGetFormInstance();
    // 构造Builder时，通过setGlobalCtx传入全局上下文
    const builderRef = useRef<FormConfigBuilder>(
        new FormConfigBuilder(template, fields).addMiddlewares(middlewares)
    );

    const formConfig = useMemo(() => {
        const builder = builderRef.current;

        return builder
            .setGlobalCtx(Object.assign({ dataSource }, globalCtx), fields)
            .build();

    }, [globalCtx, dataSource, fields]);


    return { form, formConfig, builderRef };
}

export default useDynamicForm