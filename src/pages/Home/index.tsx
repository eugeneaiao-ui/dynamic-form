import React, { useEffect } from "react";
import { DynamicForm, FormConSumer } from "../../DynamicForm";
import useDynamicForm from "../../DynamicForm/useDynamicForm";
import { BasicTemplate } from "../../DynamicForm/FormTemplate";
import { AsyncFormFields } from "../../DynamicForm/AsyncFormFields";

function useInitialData() {
    const [fields, setFields] = React.useState({});

    useEffect(() => {
        // Simulate fetching initial data
        setTimeout(() => {
            setFields(AsyncFormFields)
        }, 1000);
    }, []);

    return {
        fields
    };
}

const HomePage: React.FC = () => {
    const { fields } = useInitialData();
    const { formConfig } = useDynamicForm({ template: BasicTemplate, fields });
    console.log("formConfig:", formConfig);

    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <DynamicForm >
                <p>This is a dynamic form inside the home page.</p>
                <FormConSumer formConfig={formConfig} />
            </DynamicForm>
        </div>
    );
};

export default HomePage;