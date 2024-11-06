import { SelectChangeEvent } from '@mui/material';
import { ChangeEvent, useState } from 'react';


type FormField = {
    value: any;
    required: boolean;
    isError: boolean;
    message: string;
};

export type FormValueState<T> = {
    [K in keyof T]: FormField;
};

//Hook para manejar los valores de un formulario y sus validaciones

export const useFormValues = <T extends Object>(initialState: FormValueState<T>) => {

    const [formValues, setFormValues] = useState(initialState);

    const handleInputChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = target;

        setFormValues((prevState) => ({
            ...prevState,
            [name]: {
                ...prevState[name],
                isError: false,
                message: '',
                value,
            },
        }));
    };

    const handleSelectChange = ({ target }: SelectChangeEvent) => {
        const { name, value } = target;
        setFormValues((prevState) => ({
            ...prevState,
            [name]: {
                ...prevState[name],
                isError: false,
                message: '',
                value,
            },
        }));
    };

    const reset = () => {
        setFormValues(initialState);
    }

    const handleFormValueChange = (key: string, value: string) => {
        setFormValues((prevState) => ({
            ...prevState,
            [key]: {
                ...prevState[key],
                isError: false,
                message: '',
                value,
            },
        }));
    }

    const handleCheckboxChange = ({ target }: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        const { name } = target;
        setFormValues((prevState) => ({
            ...prevState,
            [name]: {
                ...prevState[name],
                value: checked,
            },
        }));
    }

    const validateFormRequired = (): boolean => {
        let isValid = true;
        const updatedFormValue = { ...formValues };

        Object.keys(formValues).forEach((key) => {
            const field = formValues[key as keyof T];
            if (field.required && !field.value) {
                updatedFormValue[key as keyof T] = {
                    ...field,
                    isError: true,
                    message: 'Este campo es requerido',
                };
                isValid = false;
            }
        });

        setFormValues(updatedFormValue);
        return isValid;
    };

    return {
        formValues,
        handleInputChange,
        handleSelectChange,
        setFormValues,
        reset,
        handleFormValueChange,
        handleCheckboxChange,
        validateFormRequired,
        ...formValues
    }
};