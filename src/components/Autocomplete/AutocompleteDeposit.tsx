import { Autocomplete, TextField } from '@mui/material';
import { Deposit } from '../../types';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeposit } from '../../hooks';

type Props = {
    options?: Deposit[];
    value: Deposit | null;
    onChange: (deposit: Deposit | null) => void;
    size?: 'small' | 'medium';
}
export const AutocompleteDeposit: React.FC<Props> = ({
    value,
    onChange,
    options,
    size = "medium"
}) => {
    const { t } = useTranslation();
    const { deposits, isLoading, getDeposits } = useDeposit();

    useEffect(() => {
        if (!options) getDeposits();
    }, [options])


    return (
        <Autocomplete
            loading={isLoading}
            size={size}
            value={value}
            onChange={(_event, newValue) => {
                onChange(newValue);
            }}
            options={(options && options.length) ? options : deposits}
            getOptionLabel={(option) => {
                return option.description;
            }}
            renderInput={(params) => (
                <TextField {...params} label={t("_warehouse")} variant="outlined" />
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
