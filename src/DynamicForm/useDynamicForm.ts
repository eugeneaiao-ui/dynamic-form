import { useContext, useEffect, useMemo, useRef } from "react";
import { BasicTemplateProps, FormFields, FormConfig } from "./FormTemplate"
import useGetFormInstance from "./useGetForminstance"
import { EventEmitter } from 'events';
import MiniMiddleware, { Middleware } from "../abstract/MiniMiddleware";
import FormContext, { DynamicFormContextValue } from "./FormContext";
import { FormFieldsParams } from "./AsyncFormFields";
import { Form } from "antd";

type FormFieldsProps = Record<FormFields, object>
type middlewareCtx = DynamicFormContextValue & DynamicFormOptions

interface DynamicFormOptions {
    template: BasicTemplateProps[]
    fields: FormFieldsProps;
    fieldProps?: FormFieldsParams
}

interface DynamicForm {
    template: FormConfig[]
    fields: FormFieldsProps
    dataSource?: any,
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
            hidden: false,
            componentProps: {
                disabled: false
            }
        }
    }
    next();
}

const dataSourceMiddleware: Middleware<middlewareCtx> = (ctx, next) => {
    const { dataSource, fieldProps } = ctx;
    if (!fieldProps?.dataSource) {
        next();
        return;
    }
    const type = fieldProps?.dataSource?.type

    if (type === 'store') {
        const storeKey = fieldProps?.dataSource?.storeKey;
        ctx.fieldProps = {
            ...fieldProps,
            componentProps: {
                ...fieldProps.componentProps,
                options: dataSource?.[storeKey] || []
            }
        }
        next()
    }
    next();
}

const linkageMiddleware: Middleware<middlewareCtx> = function (this: FormConfigBuilder, ctx, next) {
    const { fieldProps = {}, form } = ctx;
    // 联动逻辑处理
    if (!fieldProps.triggerField || !fieldProps.condition) {
        next();
        return;
    }

    const { triggerField, condition } = fieldProps;

    const triggerValue = form.getFieldValue(triggerField);

    let shouldShow = false;
    switch (condition.operator) {
        case "hasValue":
            shouldShow = triggerValue !== undefined && triggerValue !== null && triggerValue !== '';
            break;
        case "eq":
            shouldShow = triggerValue === condition.value;
            break;
        case "neq":
            shouldShow = triggerValue !== condition.value;
            break;
        case "in":
            shouldShow = Array.isArray(condition.value) && condition.value.includes(triggerValue);
            break;
        default:
            break;
    }

    this.emitter.removeAllListeners('formValueChange');
    this.emitter.addListener('formValueChange', (value) => {
        console.log('formValueChange in useDynamicForm', value);
    });

    ctx.fieldProps = {
        ...fieldProps,
        hidden: !shouldShow
    };

    next();
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
    setGlobalCtx(ctx: Partial<DynamicFormContextValue>): this {
        this.#context = ctx;
        return this;
    }

    // addMiddleware逻辑不变（链式添加中间件）
    addMiddleware(middleware: Middleware<middlewareCtx>): this {
        this.use(middleware);
        return this;
    }
}

// 同时修改useDynamicForm Hook，传入全局上下文
export function useDynamicForm(options: DynamicForm) {
    const { template, fields, dataSource } = options;
    const globalCtx = useContext(FormContext); // 获取全局上下文
    const form = useGetFormInstance();
    // 构造Builder时，通过setGlobalCtx传入全局上下文
    const builderRef = useRef<FormConfigBuilder>(
        new FormConfigBuilder(template, fields)
    );
    const fieldsValue = Form.useWatch([FormFields.city], form);

    const formConfig = useMemo(() => {
        const builder = builderRef.current;

        return builder
            .setGlobalCtx(Object.assign({ dataSource }, globalCtx))
            .addMiddleware(guideMiddleware)
            .addMiddleware(displayModeMiddleware)
            .addMiddleware(dataSourceMiddleware)
            .addMiddleware(linkageMiddleware)
            .build();

    }, [globalCtx, dataSource]);

    useEffect(() => {
        builderRef.current.emitter.emit('formValueChange', fieldsValue);
    }, [fieldsValue]);

    useEffect(() => {
        return () => {
            // 组件卸载时清理事件监听器
            builderRef.current.emitter.removeAllListeners();
        }
    }, [])

    return { form, formConfig, builderRef };
}

export default useDynamicForm