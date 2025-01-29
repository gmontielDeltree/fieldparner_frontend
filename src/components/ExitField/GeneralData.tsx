import { FormControl, Grid, InputAdornment, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import {
    FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import React, { ChangeEvent, useState } from 'react';
import { Campaign, Crop, Deposit, ExitField, ExitFieldItem, Field, Lot } from '../../types';
import { getShortDate } from '../../helpers/dates';

import { useTranslation } from 'react-i18next';
import { AutocompleteCampaign, AutocompleteCrop, AutocompleteDeposit } from '../Autocomplete';

interface GeneralDataProps {
    formValues: ExitFieldItem;
    crops: Crop[];
    deposits: Deposit[];
    listFields: Field[];
    setFormValues: React.Dispatch<React.SetStateAction<ExitField>>;
    handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
}


export const GeneralData: React.FC<GeneralDataProps> = ({
    formValues,
    listFields,
    crops,
    deposits,
    handleInputChange,
    setFormValues
}) => {
    const [campaignSelected, setCampaignSelected] = useState<Campaign | null>(null);
    const [fieldSelected, setFieldSelected] = useState<Field | null>(null);
    const [lotSelected, setLotSelected] = useState<Lot | null>(null);
    
    const onChangeField = ({ target }: SelectChangeEvent) => {
        const fieldId = target.value;
        const fieldSelected = listFields.find(f => f._id === fieldId);

        if (!fieldSelected) return;

        setFormValues((prevState) => ({ ...prevState, fieldId }));
        setFieldSelected(fieldSelected);
        setLotSelected(null);
    }

    const onChangeLot = ({ target }: SelectChangeEvent) => {
        const lotId = target.value;
        const lotSelected = fieldSelected?.lotes.find(l => l.properties.nombre === lotId);

        if (!lotSelected) return;

        setLotSelected(lotSelected);
        setFormValues((prevState) => ({ ...prevState, lotId }));
    }

    const { t } = useTranslation();

    return (
        <Grid
            container
            spacing={2}
            direction="row"
            alignItems="center"
            justifyContent="space-between">
            <Grid item xs={12} display="flex" alignItems="center" mb={2}>
                <FolderOpenIcon sx={{ mx: 1 }} />
                <Typography variant="h5">{t("general_data")}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    variant="outlined"
                    type="date"
                    label={t("operation_date")}
                    name="creationDate"
                    value={formValues.creationDate}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    inputProps={{
                        max: getShortDate(), // Establece la fecha mínima permitida como la fecha actual
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <AutocompleteCampaign
                    value={campaignSelected}
                    onChange={(campaign) => {
                        setCampaignSelected(campaign);
                        setFormValues((prevState) => ({
                            ...prevState,
                            campaignId: campaign?._id || "",
                        }));
                    }}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl key="field-select" fullWidth>
                    <InputLabel id="field">Campo</InputLabel>
                    <Select
                        labelId="field"
                        name="fieldId"
                        value={formValues.fieldId}
                        label="Campo"
                        onChange={onChangeField}
                    >
                        {listFields?.map((field) => (
                            <MenuItem key={field._id} value={field._id}>
                                {field.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl key="lot-select" fullWidth disabled={!formValues.fieldId}>
                    <InputLabel id="lot">{t("_lot")}</InputLabel>
                    <Select
                        labelId="lot"
                        name="lotId"
                        value={formValues.lotId}
                        label={t("_lot")}
                        onChange={onChangeLot}
                    >
                        {fieldSelected?.lotes.map((lot) => (
                            <MenuItem key={lot.properties.nombre} value={lot.properties.nombre}>
                                {lot.properties.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                    <ListItemText
                        primary={<Typography variant='subtitle2'>Hectareas</Typography>}
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {lotSelected?.properties.hectareas || "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
            <AutocompleteCrop
                    options={crops}
                    value={formValues?.crop || null}
                    onChange={(crop) => {
                        setFormValues((prevState) => ({
                            ...prevState,
                            crop: crop,
                            cropId: crop?._id || "",
                        }));
                    }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <AutocompleteDeposit
                    value={formValues?.deposit || null}
                    options={deposits}
                    onChange={(deposit) => {
                        setFormValues((prevState) => ({
                            ...prevState,
                            deposit,
                            depositId: deposit?._id || "",
                        }));
                    }}
                />
            </Grid>

            <Grid item xs={6} sm={6}>
                <TextField
                    variant="outlined"
                    type="text"
                    label={t("_waybill")}
                    name="transportDocument"
                    value={formValues.transportDocument}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={6} sm={6}>
                <TextField
                    variant="outlined"
                    type="text"
                    label={t("Ticket/ Receipt")}
                    name="ticket"
                    value={formValues.ticket}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
        </Grid>
    )
}
