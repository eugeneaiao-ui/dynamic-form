import type React from 'react';
import type { FormInstance, FormItemProps, FormProps } from 'antd';
import type {
  BasicTemplateProps,
  BuildContext,
  DataContext,
  FieldConfig,
  FormMode,
  FormTemplate as CoreTemplate,
  FormValues,
  Middleware,
  SnapshotValues,
  DataSourceManager,
} from '../core';
import type { ComponentRegistry } from './registry';

export type FormConfigFields<Values extends object = FormValues> = FieldConfig<Values> &
  Omit<FormItemProps<Values>, 'name' | 'dependencies'> & {
    formItemProps?: Omit<FormItemProps<Values>, 'name'>;
    previewRender?: (value: unknown) => React.ReactNode;
    snapshotRender?: (values: SnapshotValues) => React.ReactNode;
    onLogRecord?: (form?: FormInstance<Values>, name?: string) => void;
  };
export type FormTemplate<Values extends object = FormValues> = CoreTemplate<Values, FormConfigFields<Values>>;
export type { BasicTemplateProps };
export interface DateAdapter {
  parse: (value: unknown, format: string) => unknown;
  format: (value: unknown, format: string) => string;
}
export interface FormContextValue<Values extends object = FormValues> {
  form: FormInstance<Values>;
  displayMode: FormMode;
  permission: boolean;
  disabled: boolean;
  setDisplayMode: (mode: FormMode) => void;
  setPermission: (permission: boolean) => void;
  setDisabled: (disabled: boolean) => void;
  registry: ComponentRegistry;
  registryVersion: number;
  dataSources: DataSourceManager<Values>;
  dataSourceVersion: number;
  dataContext: DataContext;
  dateAdapter: DateAdapter;
  onError?: (error: Error) => void;
}
export type FormMiddlewareContext<Values extends object = FormValues> = BuildContext<
  Values,
  FormConfigFields<Values>
> & {
  form?: FormInstance<Values>;
  dataContext: DataContext;
};
export interface DynamicConfigOptions<Values extends object = FormValues> {
  template: FormTemplate<Values>;
  fields?: Readonly<Record<string, FormConfigFields<Values>>>;
  middlewares?: readonly Middleware<FormMiddlewareContext<Values>>[];
  /** @deprecated Use middlewares. */
  middlewaries?: readonly Middleware<FormMiddlewareContext<Values>>[];
  dataSource?: unknown;
}
export interface FormProviderProps<Values extends object = FormValues> {
  children?: React.ReactNode;
  form?: FormInstance<Values>;
  displayMode?: FormMode;
  defaultDisplayMode?: FormMode;
  permission?: boolean;
  defaultPermission?: boolean;
  disabled?: boolean;
  defaultDisabled?: boolean;
  onDisplayModeChange?: (mode: FormMode) => void;
  onPermissionChange?: (permission: boolean) => void;
  onDisabledChange?: (disabled: boolean) => void;
  registry?: ComponentRegistry;
  dataSources?: DataSourceManager<Values>;
  dataContext?: DataContext;
  dateAdapter?: DateAdapter;
  onError?: (error: Error) => void;
}
export type DynamicFormProps<Values extends object = FormValues> = Omit<FormProps<Values>, 'children'> &
  FormProviderProps<Values>;
export interface CustomControlProps {
  value?: unknown;
  onChange?: (value: unknown) => void;
  displayMode: FormMode;
  name?: string | (string | number)[];
  disabled?: boolean;
  snapshotValues?: SnapshotValues;
  snapshootValues?: SnapshotValues;
  [key: string]: unknown;
}
