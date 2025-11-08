import React from 'react'
import renderFormComponent from './renderField'
import { FormConfig } from './FormTemplate';

interface FormConsumerProps {
    formConfig: FormConfig[];
}

export const FormConsumer: React.FC<FormConsumerProps> = ({ formConfig = [] }) => {
    return <>
        {renderFormComponent(formConfig)}
    </>
}

export default FormConsumer