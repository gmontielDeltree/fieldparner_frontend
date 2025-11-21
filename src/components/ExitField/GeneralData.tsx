import { FormControl, Grid, InputAdornment, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent, TextField, Typography, FormHelperText } from '@mui/material';
import {
    FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Campaign, Crop, Deposit, ExitField, ExitFieldItem, Field, Lot } from '../../types';
import { getShortDate } from '../../helpers/dates';

import { useTranslation } from 'react-i18next';
import { useMapContext } from '../TemplateLayout';
import { addLotesToMap } from '../../helpers/mapHelpers';
import { AutocompleteCampaign, AutocompleteCrop, AutocompleteDeposit } from '../Autocomplete';

interface GeneralDataProps {
    formValues: ExitFieldItem;
    crops: Crop[];
    deposits: Deposit[];
    listFields: Field[];
    setFormValues: React.Dispatch<React.SetStateAction<ExitField>>;
    handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
    errors?: Record<string, string>;
    showErrors?: boolean;
}

export const GeneralData: React.FC<GeneralDataProps> = ({
    formValues,
    listFields,
    crops,
    deposits,
    handleInputChange,
    setFormValues,
    errors = {},
    showErrors = false
}) => {
    const [campaignSelected, setCampaignSelected] = useState<Campaign | null>(null);
    const [fieldSelected, setFieldSelected] = useState<Field | null>(null);
    const [availableZafras, setAvailableZafras] = useState<string[]>([]);
    const [lotSelected, setLotSelected] = useState<Lot | null>(null);

    // Background map integration
    const { map, fields: allFields } = useMapContext() as any;

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

    // Attach background map click handlers to pick field/lot
    useEffect(() => {
        if (!map) return;

        const onClickField = (e: any) => {
            const f = e?.features?.[0];
            const fid = f?.properties?.id;
            if (!fid) return;
            const foundField = (allFields || listFields || []).find((ff: any) => ff._id === fid);
            if (!foundField) return;
            setFieldSelected(foundField);
            setFormValues(prev => ({ ...prev, fieldId: foundField._id, lotId: '' }));
            try { addLotesToMap(map, foundField as any); } catch { }
        };

        const onClickLot = (e: any) => {
            const f = e?.features?.[0];
            const lotName = f?.properties?.nombre;
            const campoId = f?.properties?.campo_parent_id;
            if (!lotName) return;
            const foundField = fieldSelected || (allFields || listFields || []).find((ff: any) => ff._id === campoId);
            const foundLot = foundField?.lotes.find((l: any) => l.properties?.nombre === lotName) || null;
            if (!foundField || !foundLot) return;
            setFieldSelected(foundField);
            setLotSelected(foundLot);
            setFormValues(prev => ({ ...prev, fieldId: foundField._id, lotId: lotName }));
        };

        try { map.on('click', 'campos-fill', onClickField); } catch { }
        try { map.on('click', 'lotes-fill', onClickLot); } catch { }

        return () => {
            try { map.off('click', 'campos-fill', onClickField); } catch { }
            try { map.off('click', 'lotes-fill', onClickLot); } catch { }
        };
    }, [map, allFields, listFields, fieldSelected, setFormValues]);

    // Helper function to determine if a field has an error
    const hasError = (field: string) => showErrors && errors[field];

    return (
        <>
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
                        max: getShortDate(),
                    }}
                    fullWidth
                    error={hasError('creationDate')}
                    helperText={hasError('creationDate') ? errors['creationDate'] : ''}
                    required
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
                        // Cargar zafras de la campaña (string o array)
                        const z = (campaign && (campaign as any).zafra)
                            ? (Array.isArray((campaign as any).zafra) ? (campaign as any).zafra as string[] : [String((campaign as any).zafra)])
                            : [];
                        setAvailableZafras(z);
                    }}
                    error={hasError('campaignId')}
                    helperText={hasError('campaignId') ? errors['campaignId'] : ''}
                    required
                />
            </Grid>
            {availableZafras.length > 0 && (
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel id="zafra-label">Zafra</InputLabel>
                        <Select
                            labelId="zafra-label"
                            id="zafra"
                            value={formValues.zafra || ''}
                            label="Zafra"
                            onChange={(e) => setFormValues(prev => ({ ...prev, zafra: e.target.value as string }))}
                        >
                            {availableZafras.map((z) => (
                                <MenuItem key={z} value={z}>{z}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            )}
            <Grid item xs={12} sm={4}>
                <FormControl
                    key="field-select"
                    fullWidth
                    error={hasError('fieldId')}
                    required
                >
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
                    {hasError('fieldId') && <FormHelperText>{errors['fieldId']}</FormHelperText>}
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl
                    key="lot-select"
                    fullWidth
                    disabled={!formValues.fieldId}
                    error={hasError('lotId')}
                    required
                >
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
                    {hasError('lotId') && <FormHelperText>{errors['lotId']}</FormHelperText>}
                </FormControl>
            </Grid>
            {/* Map de fondo soporta clic; no es necesario botón extra */}
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
                    error={hasError('cropId')}
                    helperText={hasError('cropId') ? errors['cropId'] : ''}
                // required
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
                    error={hasError('depositId')}
                    helperText={hasError('depositId') ? errors['depositId'] : ''}
                // required
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
        {/* No modal map picker: se usa el mapa de fondo para seleccionar */}
    </>
  )
}