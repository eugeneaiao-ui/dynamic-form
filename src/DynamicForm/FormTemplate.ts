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

export interface FormConfig extends BasicTemplateProps {
    componentProps?: Record<string, any>;
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