import { SelectChangeEvent } from '@mui/material';
import { is } from 'date-fns/locale';
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


export const useFormValue = <T extends Object>(initialState: FormValueState<T>) => {

    const [formValue, setFormValue] = useState(initialState);

    const handleInputChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = target;

        setFormValue((prevState) => ({
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
        setFormValue((prevState) => ({
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
        setFormValue(initialState);
    }

    const handleFormValueChange = (key: string, value: string) => {
        setFormValue((prevState) => ({
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
        setFormValue((prevState) => ({
            ...prevState,
            [name]: {
                ...prevState[name],
                value: checked,
            },
        }));
    }

    const validateFormRequired = (): boolean => {
        let isValid = true;
        const updatedFormValue = { ...formValue };

        Object.keys(formValue).forEach((key) => {
            const field = formValue[key as keyof T];
            if (field.required && !field.value) {
                updatedFormValue[key as keyof T] = {
                    ...field,
                    isError: true,
                    message: 'Este campo es requerido',
                };
                isValid = false;
            }
        });

        setFormValue(updatedFormValue);
        return isValid;
    };

    return {
        formValue,
        handleInputChange,
        handleSelectChange,
        setFormValue,
        reset,
        handleFormValueChange,
        handleCheckboxChange,
        validateFormRequired,
        ...formValue
    }
};