import { FormItemProps } from "antd"
import { ConditionOperator, FormFieldCondition, FormFields } from "./FormTemplate"

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

export interface FormFieldsParams extends FormItemProps {
    triggerField?: FormFields,
    condition?: FormFieldCondition,
    componentProps?: Record<string, any>
    dataSource?: DataSource
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

export const AsyncFormFields: Record<FormFields, FormFieldsParams> = {
    [FormFields.name]: {
        label: 'Full Name',
        componentProps: {
            placeholder: 'Enter your name'
        }
    },
    [FormFields.school]: {
        label: 'School Name',
        componentProps: {
            placeholder: 'Enter your school'
        }
    },
    [FormFields.age]: {
        label: 'Age',
        componentProps: {
            placeholder: 'Enter your age'
        }
    },
    [FormFields.gender]: {
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
        label: 'Country',
        hidden: true,
        triggerField: FormFields.city,
        condition: {
            operator: ConditionOperator.HAS_VALUE,
            triggerField: FormFields.city,
        },
        componentProps: {
            options: [],
            placeholder: 'Select your country'
        },
        dataSource: {
            type: DataSourceType.STORE,
            module: 'common',
            storeKey: FormFields.country
        }
    },
    [FormFields.city]: {
        label: 'City',
        componentProps: {
            options: [],
            placeholder: 'Select your city'
        },
        dataSource: {
            type: DataSourceType.STORE,
            module: 'common',
            storeKey: FormFields.city
        }
    },
    [FormFields.address]: {
        label: 'Address',
        hidden: true,
        componentProps: {
            placeholder: 'Enter your address'
        }
    }
}