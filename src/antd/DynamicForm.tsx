import React, { useContext } from 'react';
import { Form } from 'antd';
import type { FormValues } from '../core';
import { DynamicFormProvider, FormContext } from '../react/context';
import type { DynamicFormProps, FormProviderProps } from './types';
export function DynamicForm<Values extends object = FormValues>({
  children,
  displayMode,
  permission,
  disabled,
  registry,
  dataSources,
  dataContext,
  dateAdapter,
  onError,
  defaultDisplayMode,
  defaultPermission,
  defaultDisabled,
  onDisplayModeChange,
  onPermissionChange,
  onDisabledChange,
  form: suppliedForm,
  ...formProps
}: DynamicFormProps<Values>): React.ReactElement {
  const inherited = useContext(FormContext);
  const [form] = Form.useForm<Values>(suppliedForm ?? (inherited?.form as FormProviderProps<Values>['form']));
  return (
    <DynamicFormProvider<Values>
      form={form}
      displayMode={displayMode ?? inherited?.displayMode}
      permission={permission ?? inherited?.permission}
      disabled={disabled ?? inherited?.disabled}
      defaultDisplayMode={defaultDisplayMode}
      defaultPermission={defaultPermission}
      defaultDisabled={defaultDisabled}
      onDisplayModeChange={onDisplayModeChange ?? inherited?.setDisplayMode}
      onPermissionChange={onPermissionChange ?? inherited?.setPermission}
      onDisabledChange={onDisabledChange ?? inherited?.setDisabled}
      registry={registry ?? inherited?.registry}
      dataSources={dataSources ?? (inherited?.dataSources as FormProviderProps<Values>['dataSources'])}
      dataContext={dataContext ?? inherited?.dataContext}
      dateAdapter={dateAdapter ?? inherited?.dateAdapter}
      onError={onError ?? inherited?.onError}
    >
      <Form<Values> form={form} layout="vertical" {...formProps}>
        {children}
      </Form>
    </DynamicFormProvider>
  );
}
export interface WithDynamicFormOptions {
  displayMode?: FormProviderProps['displayMode'];
  permission?: boolean;
  disabled?: boolean;
  registry?: FormProviderProps['registry'];
}
export function withDynamicForm(
  options: WithDynamicFormOptions,
): <Props extends object>(component: React.ComponentType<Props>) => React.FC<Props>;
export function withDynamicForm<Props extends object>(
  options: WithDynamicFormOptions,
): (component: React.ComponentType<Props>) => React.FC<Props>;
export function withDynamicForm(options: WithDynamicFormOptions) {
  return function wrap<Props extends object>(Component: React.ComponentType<Props>): React.FC<Props> {
    const Wrapped: React.FC<Props> = (props) => (
      <DynamicFormProvider
        defaultDisplayMode={options.displayMode}
        defaultPermission={options.permission}
        defaultDisabled={options.disabled}
        registry={options.registry}
      >
        <Component {...props} />
      </DynamicFormProvider>
    );
    Wrapped.displayName = 'withDynamicForm(' + (Component.displayName ?? Component.name ?? 'Component') + ')';
    return Wrapped;
  };
}
