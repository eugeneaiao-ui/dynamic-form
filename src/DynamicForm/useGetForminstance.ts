import { useContext } from "react";
import FormContext from "./FormContext";

const useFormInstance = () => {
  const ctx = useContext(FormContext);
  if (!ctx.form) {
    throw new Error('useFormInstance must be used within a FormProvider');
  }
  return ctx.form;
};

export default useFormInstance;