import { FormItemProps } from "antd"
import { FormFields } from "./FormTemplate"

export interface FormFieldsParams extends FormItemProps {
    triggerField?: string
    condition?: { operator: 'eq', value: 'admin' },
    componentProps?: Record<string, any>
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
            options: [
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' }
            ],
            placeholder: 'Select your gender'
        }
    },
    [FormFields.country]: {
        label: 'Country',
        componentProps: {
            options: [
                { label: 'USA', value: 'usa' },
                { label: 'Canada', value: 'canada' },
                { label: 'UK', value: 'uk' }
            ],
            placeholder: 'Select your country'
        }
    },
    [FormFields.city]: {
        label: 'City',
        componentProps: {
            options: [
                { label: 'New York', value: 'new_york' },
                { label: 'Los Angeles', value: 'los_angeles' },
                { label: 'Chicago', value: 'chicago' }
            ],
            placeholder: 'Select your city'
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