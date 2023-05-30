import { SelectChangeEvent } from '@mui/material';
import { ChangeEvent, useCallback, useState } from 'react';

// export function useForm<T>( initialState: T) {}

export const useForm = <T extends Object>(initialState: T) => {

    const [formulario, setFormulario] = useState(initialState);

    const handleInputChange = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = target;

        setFormulario({
            ...formulario,
            [name]: value
        });
    }, []);

    const handleSelectChange = useCallback(({ target }: SelectChangeEvent) => {
        const { name, value } = target;

        setFormulario({
            ...formulario,
            [name]: value
        });
    }, []);

    return {
        formulario,
        handleInputChange,
        handleSelectChange,
        ...formulario
    }
};
