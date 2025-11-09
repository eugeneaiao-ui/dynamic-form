import React, { useCallback, useContext, useEffect } from "react";
import { DynamicForm, FormConSumer, FormMode, withDynamicForm } from "../../DynamicForm";
import useDynamicForm, { middlewareCtx } from "../../DynamicForm/useDynamicForm";
import { BasicTemplate, FormFields } from "../../DynamicForm/FormTemplate";
import { AsyncFormFields, AsyncParams } from "../../DynamicForm/AsyncFormFields";
import { Middleware } from "../../abstract/MiniMiddleware";
import FormContext from "../../DynamicForm/FormContext";

// 中间件定义, 守卫负责鉴权
const guideMiddleware: Middleware<middlewareCtx> = (ctx, next) => {
    const { permission, fieldProps } = ctx
    if (!permission.length) {
        return ctx.fieldProps = {
            ...fieldProps,
            componentProps: {
                disabled: true
            }
        }
    }
    next()
}

const needShowField = [FormFields.address]
// 中间件定义，负责展示模式字段控制
const displayModeMiddleware: Middleware<middlewareCtx> = (ctx, next) => {
    const { fieldProps, displayMode } = ctx;

    const currentFieldName = fieldProps?.name;
    const isNeedShow = needShowField.includes(currentFieldName);
    if (displayMode === 'preview' && isNeedShow) {
        ctx.fieldProps = {
            ...fieldProps,
            hidden: false,
            componentProps: {
                disabled: false
            }
        }
    } else {
        ctx.fieldProps = {
            ...fieldProps,
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

// 字段模板分离
function useInitialData(id: string) {
    const [fields, setFields] = React.useState({});
    const [params, setParams] = React.useState({})
    const { form } = useContext(FormContext)

    const fetchFormData = useCallback(() => {
        if (!id) return

        form.setFieldsValue({
            [FormFields.name]: "Eugene",
            [FormFields.age]: "27",
            [FormFields.school]: "SZU",
            [FormFields.gender]: "Man"
        })
    }, [id])

    useEffect(() => {
        fetchFormData()
    }, [fetchFormData])

    useEffect(() => {
        // Simulate fetching initial data
        setTimeout(() => {
            setFields(AsyncFormFields)
            setParams(AsyncParams)
        }, 1000);
    }, []);

    return {
        fields,
        params
    };
}

const middlewares = [guideMiddleware, displayModeMiddleware, dataSourceMiddleware]

const HomePage: React.FC = () => {
    const { fields, params } = useInitialData('id');
    const { formConfig } = useDynamicForm({ template: BasicTemplate, fields, middlewares, dataSource: params });
    const { displayMode, permission, setDisplayMode, setPermission } = useContext(FormContext)

    const handleChangeMode = () => {
        if (displayMode === FormMode.edit) {
            setDisplayMode(FormMode.preview)
        } else {
            setDisplayMode(FormMode.edit)
        }
    }

    const handlePermission = () => {
        if (permission.length) {
            setPermission([])
        } else {
            setPermission(['edit'])
        }
    }

    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <DynamicForm>
                <p>This is a dynamic form inside the home page.</p>
                <p>Display Mode: {displayMode} <button onClick={handleChangeMode}>Change Mode</button></p>
                <p>Permissions {permission} <button onClick={handlePermission}>Set Permission</button></p>
                <FormConSumer formConfig={formConfig} />
            </DynamicForm>
        </div>
    );
};

export default withDynamicForm({})(HomePage);