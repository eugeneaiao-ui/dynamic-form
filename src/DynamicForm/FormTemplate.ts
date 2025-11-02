export enum FormFields {
    name = 'name',
    school = 'school',
    age = 'age',
    gender = 'gender',
    country = 'country',
    city = 'city',
    address = 'address'
}

export enum FormFieldsType {
    Input = 'Input',
    Select = 'Select',
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

/**
 * 联动运算符：定义支持的条件判断规则
 * - hasValue: 依赖字段「有值」（非空/非undefined）
 * - eq: 依赖字段「等于」指定值
 * - neq: 依赖字段「不等于」指定值
 * - in: 依赖字段值「在」指定列表中
 */
export enum ConditionOperator {
  HAS_VALUE = "hasValue",
  EQ = "eq",
  NEQ = "neq",
  IN = "in"
}

/**
 * 扩展后的联动条件类型（区分联合类型，确保TypeScript类型安全）
 * - 根据运算符自动推断是否需要「值参数」（如hasValue无需value，eq需要value）
 */
type BaseCondition = {
  // 联动依赖的字段（当前字段显示/隐藏依赖哪个字段的变化）
  triggerField: FormFields;
};

// 有值判断（无需value）
export type HasValueCondition = BaseCondition & {
  operator: ConditionOperator.HAS_VALUE;
};

// 等于判断（需要具体value）
export type EqCondition = BaseCondition & {
  operator: ConditionOperator.EQ;
  value: string | number | boolean; // 依赖字段的目标值
};

// 不等于判断（需要具体value）
export type NeqCondition = BaseCondition & {
  operator: ConditionOperator.NEQ;
  value: string | number | boolean;
};

// 在列表中判断（需要数组value）
export type InCondition = BaseCondition & {
  operator: ConditionOperator.IN;
  value: (string | number | boolean)[]; // 依赖字段的目标值列表
};

export type FormFieldCondition = 
  | HasValueCondition 
  | EqCondition 
  | NeqCondition 
  | InCondition;


type DataSource = ApiDataSource | StoreDataSource

export interface FormConfig extends BasicTemplateProps {
    componentProps?: Record<string, any>;
    dataSource?: DataSource
    condition?: FormFieldCondition,
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
}]