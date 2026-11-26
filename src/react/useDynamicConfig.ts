import { useContext, useMemo, useRef } from 'react';
import { FormConfigBuilder, FormMode } from '../core';
import type { FormValues, Middleware, BuildContext } from '../core';
import { FormContext } from './context';
import type { DynamicConfigOptions, FormConfigFields, FormMiddlewareContext } from '../antd/types';
const EMPTY_FIELDS = {};
const EMPTY_MIDDLEWARES = [] as const;
export function useDynamicConfig<Values extends object = FormValues>(options: DynamicConfigOptions<Values>) {
  const context = useContext(FormContext);
  const { template, fields = EMPTY_FIELDS, dataSource } = options;
  const middlewares = options.middlewares ?? options.middlewaries ?? EMPTY_MIDDLEWARES;
  const builder = useMemo(() => {
    const instance = new FormConfigBuilder<Values, FormConfigFields<Values>>(template, fields);
    const chain: Middleware<BuildContext<Values, FormConfigFields<Values>>>[] = middlewares.map(
      (middleware) => (fieldContext, next) => {
        const extended = Object.assign(fieldContext, { form: context?.form, dataContext: context?.dataContext ?? {} });
        return middleware(extended as unknown as FormMiddlewareContext<Values>, next);
      },
    );
    instance.setMiddlewares(chain).setGlobalCtx({
      displayMode: context?.displayMode ?? FormMode.edit,
      permission: context?.permission ?? true,
      disabled: context?.disabled ?? false,
      dataSource: dataSource ?? context?.dataContext,
    });
    return instance;
  }, [template, fields, middlewares, dataSource, context]);
  const builderRef = useRef(builder);
  builderRef.current = builder;
  const formConfig = useMemo(() => builder.build(), [builder]);
  return { formConfig, builderRef, form: context?.form };
}
export { useDynamicConfig as useDynamicForm };
export default useDynamicConfig;
