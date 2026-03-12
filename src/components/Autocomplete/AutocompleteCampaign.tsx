import { Autocomplete, TextField } from '@mui/material';
import { Campaign } from '../../types';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCampaign } from '../../hooks';

type Props = {
    value: Campaign | null;
    onChange: (campaign: Campaign | null) => void;
}
export const AutocompleteCampaign: React.FC<Props> = ({
    value, onChange
}) => {
    const { t } = useTranslation();
    const { campaigns, isLoading, getCampaigns } = useCampaign();

    useEffect(() => {
        getCampaigns();
    }, [])


    return (
        <Autocomplete
            loading={isLoading}
            value={value}
            onChange={(_event, newValue) => {
                onChange(newValue);
            }}
            options={campaigns}
            getOptionLabel={(option) => {
                return option.name;
            }}
            renderInput={(params) => (
                <TextField {...params} label={t("_campaign")} variant="outlined" />
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
