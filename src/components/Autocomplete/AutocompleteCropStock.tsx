import { Autocomplete, TextField } from '@mui/material';

import React from 'react';
import { useTranslation } from 'react-i18next';

import { CropStockData } from '../../interfaces/stock';

type Props = {
    options?: CropStockData[];
    value: CropStockData | null;
    onChange: (crop: CropStockData | null) => void;
}

export const AutocompleteCropStock: React.FC<Props> = ({
    options,
    value,
    onChange
}) => {
    const { i18n, t } = useTranslation();


    return (
        <Autocomplete
            loading={false}
            value={value}
            onChange={(_event, newValue) => {
                onChange(newValue);
            }}
            options={(options && options.length) ? options : []}
            getOptionLabel={(option) => {
                return option.cropName || '';
            }}
            renderInput={(params) => (
                <TextField {...params} label={t("_crop")} variant="outlined" />
            )}
            fullWidth
            ListboxProps={{
                style: {
                    maxHeight: 248,
                    overflow: "auto",
                },
            }}
        />
    );
}
