import { SelectChangeEvent } from '@mui/material';
import { ChangeEvent, useState } from 'react';

// export function useForm<T>( initialState: T) {}
// const currentYear = new Date().getFullYear();
export const useForm = <T extends Object>(initialState: T) => {

    const [formulario, setFormulario] = useState(initialState);

    const handleInputChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = target;

        setFormulario({
            ...formulario,
            [name]: value
        });
    };

    const handleSelectChange = ({ target }: SelectChangeEvent) => {
        const { name, value } = target;
        setFormulario({
            ...formulario,
            [name]: value
        });
    };

    const handleYearChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = target;

        if (/^\d*$/.test(value) && value.length <= 4) {
            setFormulario({
                ...formulario,
                [name]: value
            });
        }
    };

    const reset = () => {
        setFormulario(initialState);
    }

    const handleFormValueChange = (key: string, value: string) => {
        setFormulario({
            ...formulario,
            [key]: value
        })
    }

    return {
        formulario,
        handleInputChange,
        handleSelectChange,
        setFormulario,
        reset,
        handleYearChange,
        handleFormValueChange,
        ...formulario
    }
};
