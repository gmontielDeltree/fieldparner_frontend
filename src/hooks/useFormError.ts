import { SelectChangeEvent } from '@mui/material';
import { ChangeEvent, useState } from 'react';

export const useFormError = <T extends Object>(initialState: T) => {

    const [formControlError, setFormControlError] = useState(initialState);

    const handleInputChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = target;
        setFormControlError({
            ...formControlError,
            [name]: value
        });
    };

    const handleSelectChange = ({ target }: SelectChangeEvent) => {
        const { name, value } = target;
        setFormControlError({
            ...formControlError,
            [name]: value
        });
    };

    const reset = () => {
        setFormControlError(initialState);
    }

    const handleFormValueChange = (key: string, value: string) => {
        setFormControlError({
            ...formControlError,
            [key]: value
        })
    }


    return {
        formControlError,
        handleInputChange,
        handleSelectChange,
        setFormControlError,
        reset,
        handleFormValueChange,
        ...formControlError
    }
};