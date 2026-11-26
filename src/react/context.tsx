import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Form } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { defaultDataSourceManager, FormMode } from '../core';
import type { FormValues } from '../core';
import { defaultComponentRegistry } from '../antd/registry';
import type { DateAdapter, FormContextValue, FormProviderProps } from '../antd/types';

dayjs.extend(customParseFormat);
export const defaultDateAdapter: DateAdapter = {
  parse: (value, format) => {
    if (dayjs.isDayjs(value)) return value;
    if (typeof value === 'string') {
      const parsed = dayjs(value, format, true);
      return parsed.isValid() ? parsed : dayjs(value);
    }
    return dayjs(value as dayjs.ConfigType);
  },
  format: (value, format) => dayjs(value as dayjs.ConfigType).format(format),
};
const EMPTY_DATA_CONTEXT = {};
export const FormContext = createContext<FormContextValue | undefined>(undefined);
function useRevision(source: { version: number; subscribe: (listener: () => void) => () => void }): number {
  const [version, setVersion] = useState(source.version);
  useEffect(() => {
    const unsubscribe = source.subscribe(() => setVersion(source.version));
    setVersion(source.version);
    return unsubscribe;
  }, [source]);
  return version;
}
export function DynamicFormProvider<Values extends object = FormValues>({
  children,
  form: providedForm,
  displayMode,
  defaultDisplayMode = FormMode.edit,
  permission,
  defaultPermission = true,
  disabled,
  defaultDisabled = false,
  onDisplayModeChange,
  onPermissionChange,
  onDisabledChange,
  registry = defaultComponentRegistry,
  dataSources: suppliedSources,
  dataContext = EMPTY_DATA_CONTEXT,
  dateAdapter = defaultDateAdapter,
  onError,
}: FormProviderProps<Values>): React.ReactElement {
  const [form] = Form.useForm<Values>(providedForm);
  const [modeState, setModeState] = useState(defaultDisplayMode);
  const [permissionState, setPermissionState] = useState(defaultPermission);
  const [disabledState, setDisabledState] = useState(defaultDisabled);
  const dataSources =
    suppliedSources ?? (defaultDataSourceManager as unknown as FormContextValue<Values>['dataSources']);
  const registryVersion = useRevision(registry);
  const dataSourceVersion = useRevision(dataSources);
  const setDisplayMode = useCallback(
    (mode: FormMode) => {
      setModeState(mode);
      onDisplayModeChange?.(mode);
    },
    [onDisplayModeChange],
  );
  const setPermission = useCallback(
    (value: boolean) => {
      setPermissionState(value);
      onPermissionChange?.(value);
    },
    [onPermissionChange],
  );
  const setDisabled = useCallback(
    (value: boolean) => {
      setDisabledState(value);
      onDisabledChange?.(value);
    },
    [onDisabledChange],
  );
  const resolvedMode = displayMode ?? modeState;
  const resolvedPermission = permission ?? permissionState;
  const resolvedDisabled = disabled ?? disabledState;
  const value = useMemo<FormContextValue<Values>>(
    () => ({
      form,
      displayMode: resolvedMode,
      permission: resolvedPermission,
      disabled: resolvedDisabled,
      setDisplayMode,
      setPermission,
      setDisabled,
      registry,
      registryVersion,
      dataSources,
      dataSourceVersion,
      dataContext,
      dateAdapter,
      onError,
    }),
    [
      form,
      resolvedMode,
      resolvedPermission,
      resolvedDisabled,
      setDisplayMode,
      setPermission,
      setDisabled,
      registry,
      registryVersion,
      dataSources,
      dataSourceVersion,
      dataContext,
      dateAdapter,
      onError,
    ],
  );
  return <FormContext.Provider value={value as unknown as FormContextValue}>{children}</FormContext.Provider>;
}
export function useDynamicFormContext<Values extends object = FormValues>(): FormContextValue<Values> {
  const context = useContext(FormContext);
  if (!context) throw new Error('Dynamic form hooks must be used inside DynamicForm or DynamicFormProvider.');
  return context as unknown as FormContextValue<Values>;
}
export { DynamicFormProvider as FormProvider };
