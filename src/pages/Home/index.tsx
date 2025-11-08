import React, { useEffect } from "react";
import { DynamicForm, FormConSumer, withDynamicForm } from "../../DynamicForm";
import useDynamicForm, { middlewareCtx } from "../../DynamicForm/useDynamicForm";
import { BasicTemplate } from "../../DynamicForm/FormTemplate";
import { AsyncFormFields } from "../../DynamicForm/AsyncFormFields";
import { Middleware } from "../../abstract/MiniMiddleware";

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

function useInitialData() {
    const [fields, setFields] = React.useState({});

    useEffect(() => {
        // Simulate fetching initial data
        setTimeout(() => {
            setFields(AsyncFormFields)
        }, 1000);
    }, []);

    return {
        fields
    };
}

const middlewares = [guideMiddleware, displayModeMiddleware, dataSourceMiddleware]

const HomePage: React.FC = () => {
    const { fields } = useInitialData();
    const { formConfig } = useDynamicForm({ template: BasicTemplate, fields, middlewares });

    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <DynamicForm>
                <p>This is a dynamic form inside the home page.</p>
                <FormConSumer formConfig={formConfig} />
            </DynamicForm>
        </div>
    );
};

export default withDynamicForm({})(HomePage);