import { SelectChangeEvent } from '@mui/material';
import { ChangeEvent, useState } from 'react';

export const useForm = <T extends Object>(initialState: T) => {

    const [formulario, setFormulario] = useState(initialState);

    const handleInputChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = target;
        
        setFormulario((prevState) => ({
          ...prevState,
          [name]: value,
        }));
      };
      

    const handleSelectChange = ({ target }: SelectChangeEvent) => {
        const { name, value } = target;
        setFormulario({
            ...formulario,
            [name]: value
        });
    };

    const handleCategoryChange = (value: string) => {
        setFormulario({
            ...formulario,
            category: value
        });
    };

    const handleYearChange = ({ target }: SelectChangeEvent) => {
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

    const handleCheckboxChange = ({ target }: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        const { name } = target;
        setFormulario({
            ...formulario,
            [name]: checked
        });
    }

    const handleGeolocationChange = ({ lng, lat }: { lng: number, lat: number }) => {
        setFormulario({
            ...formulario,
            geolocation: { lng, lat }
        });
    }

    const handleGenercoChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = target;
        setFormulario({
            ...formulario,
            [name]: value
        });
    };

    return {
        formulario,
        handleInputChange,
        handleSelectChange,
        setFormulario,
        reset,
        handleYearChange,
        handleFormValueChange,
        handleCheckboxChange,
        handleGeolocationChange,
        handleCategoryChange,
        handleGenercoChange, // Agregar handleGenercoChange al objeto devuelto
        ...formulario
    }
};