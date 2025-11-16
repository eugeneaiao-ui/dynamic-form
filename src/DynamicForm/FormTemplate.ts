import { DependentType } from "./AsyncFormFields";

export enum FormFields {
  name = 'name',
  school = 'school',
  age = 'age',
  gender = 'gender',
  country = 'country',
  city = 'city',
  address = 'address',
  custom = 'custom'
}

export enum FormFieldsType {
  Input = 'Input',
  Select = 'Select',
  Custom = 'Custom'
}

export interface BasicTemplateProps {
  type: FormFieldsType;
  name: FormFields
}

enum DataSourceType {
  API = 'api',
  STORE = 'store'
}

interface ApiDataSource {
  type: DataSourceType.API;
  url: string;
  method: 'GET' | 'POST';
  params?: Record<string, any>;
}

interface StoreDataSource {
  type: DataSourceType.STORE;
  module: string;
  storeKey: string;
}

type DataSource = ApiDataSource | StoreDataSource

export interface DependentConfig {
  relyOn: string[]
  type: DependentType,
  computeFn?: (
    relyValues: Record<string, any>, // 所有依赖字段的键值对
    currentField: FormConfig, // 当前字段配置
    getFieldValue: (name: string) => any // Form的取值方法
  ) => {
    rest?: Partial<FormConfig>; // 要覆盖的当前字段rest属性（如rules）
    componentProps?: Record<string, any>; // 要覆盖的组件属性（如disabled）
  };
  fetchFn?: (
    relyValues: Record<string, any>,
    currentField: FormConfig,
    getFieldValue: (name: string) => any
  ) => Promise<any>; // 返回请求到的数据（如Select的dataSource）
}

export interface FormConfig extends BasicTemplateProps {
  componentProps?: Record<string, any>;
  dataSource?: DataSource
  dependentConfig?: DependentConfig
}


export const BasicTemplate: Array<BasicTemplateProps> = [{
  type: FormFieldsType.Input,
  name: FormFields.name
}, {
  type: FormFieldsType.Input,
  name: FormFields.school,
}, {
  type: FormFieldsType.Input,
  name: FormFields.age,
}, {
  type: FormFieldsType.Select,
  name: FormFields.gender
}, {
  type: FormFieldsType.Select,
  name: FormFields.country
}, {
  type: FormFieldsType.Select,
  name: FormFields.city
}, {
  type: FormFieldsType.Input,
  name: FormFields.address
}, {
  type: FormFieldsType.Custom,
  name: FormFields.custom
}]