import { FormItemProps } from "antd"
import { FormConfig, FormFields } from "./FormTemplate"

export enum DataSourceType {
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

type DataSource = ApiDataSource | StoreDataSource | string

export type DependentType = 'compute' | 'fetch';

export interface FormFieldsParams extends FormItemProps {
    componentProps?: Record<string, any>
    dataSource?: DataSource
    dependentConfig?: {
        type: DependentType,
        relyOn: string[],
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
}

export const OptionsMap = {
    [FormFields.gender]: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' }
    ],
    [FormFields.country]: [
        { label: 'USA', value: 'usa' },
        { label: 'Canada', value: 'canada' },
        { label: 'UK', value: 'uk' }
    ],
    [FormFields.city]: [
        { label: 'New York', value: 'new_york' },
        { label: 'Los Angeles', value: 'los_angeles' },
        { label: 'Chicago', value: 'chicago' }
    ]
}

export const AsyncParams: Partial<Record<keyof typeof FormFields, any>> = {
    [FormFields.gender]: OptionsMap[FormFields.gender],
    [FormFields.country]: OptionsMap[FormFields.country]
}

export const AsyncFormFields: Record<FormFields, FormFieldsParams> = {
    [FormFields.name]: {
        name: FormFields.name,
        label: 'Full Name',
        componentProps: {
            placeholder: 'Enter your name'
        }
    },
    [FormFields.school]: {
        name: FormFields.school,
        label: 'School Name',
        componentProps: {
            placeholder: 'Enter your school'
        }
    },
    [FormFields.age]: {
        name: FormFields.age,
        label: 'Age',
        componentProps: {
            placeholder: 'Enter your age'
        }
    },
    [FormFields.gender]: {
        name: FormFields.gender,
        label: 'Gender',
        componentProps: {
            options: [],
            placeholder: 'Select your gender'
        },
        dataSource: {
            type: DataSourceType.STORE,
            module: 'common',
            storeKey: FormFields.gender
        }
    },
    [FormFields.country]: {
        name: FormFields.country,
        label: 'Country',
        componentProps: {
            options: [],
            placeholder: 'Select your country'
        },
        dataSource:  FormFields.country
    },
    [FormFields.city]: {
        name: FormFields.city,
        label: 'City',
        hidden: false,
        componentProps: {
            options: [],
            placeholder: 'Select your city'
        },
        dataSource: {
            type: DataSourceType.STORE,
            module: 'common',
            storeKey: FormFields.city
        },
        dependentConfig: {
            type: 'fetch',
            relyOn: [FormFields.country]
        }
    },
    [FormFields.address]: {
        name: FormFields.address,
        label: 'Hiden Address',
        hidden: true,
        componentProps: {
            placeholder: 'Enter your address'
        }
    },
    [FormFields.custom]: {
        label: 'Custom',
        componentProps: {
            tableConfig: [{
                dataIndex: 'key',
                title: 'No',
            }, {
                dataIndex: 'title',
                title: 'Title',
            }, {
                dataIndex: 'impact',
                title: 'Impact',
                type: 'Select',
                props: {
                    options: [{ value: '123', label: 'Test' }],
                }
            }, {
                dataIndex: 'justification',
                title: 'Justification',
                type: 'Input'
            }]
        }
    }
}