import { Autocomplete, TextField } from '@mui/material';
import { Crop } from '../../types';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCrops } from '../../hooks';

type Props = {
    options?: Crop[];
    value: Crop | null;
    onChange: (crop: Crop | null) => void;
}

export const AutocompleteCrop: React.FC<Props> = ({
    options,
    value,
    onChange
}) => {
    const { i18n, t } = useTranslation();
    const { crops, isLoading, getCrops } = useCrops();

    useEffect(() => {
        if (!options) getCrops();
    }, [options]);

    return (
        <Autocomplete
            loading={isLoading}
            value={value}
            onChange={(_event, newValue) => {
                onChange(newValue);
            }}
            options={(options && options.length) ? options : crops}
            getOptionLabel={(option) => {
                return i18n.language === "es" ? option.descriptionES : i18n.language === "en" ? option.descriptionEN : option.descriptionPT;
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
