import { useEffect, useRef, useState } from 'react';
import type { FormInstance } from 'antd';
import { dependencyPaths, isEqual, normalizeDependenciesConfig, resolveDependencies } from '../core';
import type { FormValues, NamePath } from '../core';
import type { FormConfigFields } from '../antd/types';
import { useDynamicFormContext } from './context';
export function useDependencies<Values extends object = FormValues>(field: FormConfigFields<Values>) {
  const { form, dataContext, onError, displayMode } = useDynamicFormContext<Values>();
  const [componentProps, setComponentProps] = useState<Record<string, unknown>>(field.componentProps ?? {});
  // Dynamic names are validated by the engine; adapt Ant Design's literal-path generics once.
  const dynamicForm = form as FormInstance;
  const dependencies = dependencyPaths(field).map((path) => dynamicForm.getFieldValue(path));
  const valuesRef = useRef(dependencies);
  if (!isEqual(valuesRef.current, dependencies)) valuesRef.current = dependencies;
  const values = valuesRef.current;
  const errorHandler = useRef(onError);
  errorHandler.current = onError;
  useEffect(() => {
    if (!normalizeDependenciesConfig(field.dependenciesConfig).length || displayMode !== 'edit') {
      setComponentProps(field.componentProps ?? {});
      return;
    }
    const controller = new AbortController();
    setComponentProps(field.componentProps ?? {});
    void resolveDependencies(field, form.getFieldsValue(true) as Values, dataContext, controller.signal)
      .then(async (result) => {
        if (controller.signal.aborted) return;
        setComponentProps((previous) => (isEqual(previous, result.componentProps) ? previous : result.componentProps));
        for (const write of result.writes) {
          if (controller.signal.aborted) return;
          if (!isEqual(dynamicForm.getFieldValue(write.path), write.value))
            dynamicForm.setFieldValue(write.path, write.value);
          if (write.validate) {
            const names: NamePath[] = write.validate === true ? [write.path] : [...write.validate];
            await form.validateFields(names).catch(() => undefined);
          }
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          errorHandler.current?.(reason instanceof Error ? reason : new Error(String(reason)));
      });
    return () => controller.abort();
  }, [field, form, dataContext, values, displayMode, dynamicForm]);
  return componentProps;
}
