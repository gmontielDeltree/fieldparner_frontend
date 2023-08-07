import { ChangeEvent, useState } from 'react';

// export function useForm<T>( initialState: T) {}
// const currentYear = new Date().getFullYear();
export const useFormValid = <T extends Object, E extends Object>(initialState: T, errors: E) => {

    const [formValues, setFormValues] = useState(initialState);
    const [formErrors, setFormErrors] = useState(errors);

    const handleInputChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = target;
        setFormValues({
            ...formValues,
            [name]: value
        });
        setFormErrors({
            ...formErrors,
            [name]: ''
        })
    };


    const reset = () => {
        setFormValues(initialState);
        setFormErrors(errors);
    }

    // const handleFormValueChange = (key: string, value: string) => {
    //     setFormulario({
    //         ...formulario,
    //         [key]: value
    //     })
    // }

    return {
        formValues,
        formErrors,
        handleInputChange,
        reset,
        setFormValues,
        setFormErrors,
        ...formValues,
    }
};
