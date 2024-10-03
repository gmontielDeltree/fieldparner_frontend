import { FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import {
    FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import React, { ChangeEvent, useState } from 'react';
import { Campaign, ExitField, Field, Lot, Supply } from '../../types';
import { getShortDate } from '../../helpers/dates';

import { useTranslation } from 'react-i18next';

//TODO: validar q descripcion mostrar del cultivo
interface GeneralDataProps {
    formValues: ExitField;
    crops: Supply[];
    campaigns: Campaign[];
    listFields: Field[];
    setFormValues: React.Dispatch<React.SetStateAction<ExitField>>;
    handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: ({ target }: SelectChangeEvent) => void;
}


export const GeneralData: React.FC<GeneralDataProps> = ({
    formValues,
    crops,
    campaigns,
    listFields,
    handleInputChange,
    handleSelectChange,
    setFormValues
}) => {
    
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

    const onChangeCrop = ({ target }: SelectChangeEvent) => {
        const { value } = target;
        const cropSelected = crops.find((crop) => crop._id === value);

        if (cropSelected?._id) {
            setFormValues((prevState) => ({
                ...prevState,
                cropId: value, //Insumo id
                cultive: cropSelected.name || "",
                supply: cropSelected
            }));
        }
    };
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
            {/* TODO: ?? tabla campaña */}
            <Grid item xs={12} sm={6}>
                <FormControl key="campaign-select" fullWidth>
                    <InputLabel id="campaign">Campaña</InputLabel>
                    <Select
                        labelId="campaign"
                        name="campaignId"
                        value={formValues.campaignId}
                        label="Campaña"
                        onChange={handleSelectChange}
                    >
                        {campaigns?.map((c) => (
                            <MenuItem key={c.name} value={c.name}>
                                {c.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
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
            <Grid item xs={12} sm={3}>
                {
                    (fieldSelected) && (
                        <FormControl key="lot-select" fullWidth>
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
                    )
                }
            </Grid>
            <Grid item xs={6} sm={2}>
                {
                    lotSelected && (
                        <Typography variant="body1">
                            <b>Hectareas: </b> {lotSelected?.properties.hectareas}
                        </Typography>
                    )
                }
            </Grid>
            <Grid item xs={12} sm={4}>
                {/* Insumos de tipo "Cultivo" */}
                <FormControl key="crop-select" fullWidth>
                    <InputLabel id="crop">{t("_crop")}</InputLabel>
                    <Select
                        labelId="crop"
                        name="cropId"
                        value={formValues.cropId}
                        label={t("_crop")}
                        onChange={onChangeCrop}
                    >
                        {crops?.map((crop) => (
                            <MenuItem key={crop._id} value={crop._id}>
                                {crop.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
            {/* <Grid item sm={4} /> */}
        </Grid>
    )
}
