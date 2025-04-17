

import { Autocomplete, TextField } from '@mui/material';
import { Supply } from '../../types';
import React, { useEffect } from 'react'
import { useSupply } from '../../hooks';
import { useTranslation } from 'react-i18next';

export type Props = {
    value: Supply | null;
    options?: Supply[];
    onChange: (supply: Supply | null) => void;
    size?: 'small' | 'medium';
    error: boolean;
    helperText?: string;
}

export const AutocompleteSupply: React.FC<Props> = ({
    value,
    onChange,
    options,
    size = "medium",
    error = false,
    helperText = "",
}) => {
    const { t } = useTranslation();

    const { supplies, getSupplies, isLoading } = useSupply();

    useEffect(() => {
        if (!options) getSupplies();
    }, [options]);

    return (
        <Autocomplete
            size={size}
            loading={isLoading}
            value={value}
            onChange={(_event, newValue) => {
                onChange(newValue);
            }}
            options={(options && options.length) ? options : supplies}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
                <TextField
                    {...params}
                    error={error}
                    helperText={helperText}
                    label={t("_supplies")}
                    variant="outlined" />
            )}
            fullWidth
            ListboxProps={{
                style: {
                    maxHeight: 248,
                    overflow: "auto",
                },
            }}
        />
    )
}
