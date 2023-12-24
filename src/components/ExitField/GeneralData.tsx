import { FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import {
    FolderOpen as FolderOpenIcon,
    ArrowRightAlt as ArrowRightAltIcon
} from '@mui/icons-material';
import React, { ChangeEvent } from 'react';
import { ExitField, Supply } from '../../types';
import { getShortDate } from '../../helpers/dates';


interface GeneralDataProps {
    formValues: ExitField;
    crops: Supply[];
    handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
    handleFormValueChange: (key: string, value: string) => void;
    handleSelectChange: ({ target }: SelectChangeEvent) => void;
}

const fields = ["Campo 1", "Campo 2", "Campo 3"]; //TODO: ?fields de donde lo obtenemos
const lots = ["Lote 1", "Lote 2", "Lote 3"];
// const crops = ["Alfalfa", "Soja", "Maiz"];

export const GeneralData: React.FC<GeneralDataProps> = ({
    formValues,
    crops,
    handleInputChange,
    handleSelectChange,
    handleFormValueChange
}) => {

    const onChangeCrop = ({ target }: SelectChangeEvent) => {
        const { value } = target;
        const cropSelected = crops.find((crop) => crop._id === value);

        if (cropSelected) {
            handleFormValueChange("supplyID", value);
            handleFormValueChange("cultive", cropSelected.name);
        }
    };

    return (
        <Grid
            container
            spacing={2}
            direction="row"
            alignItems="center"
            justifyContent="space-between">
            <Grid item xs={12} display="flex" alignItems="center" mb={2}>
                <FolderOpenIcon sx={{ mx: 1 }} />
                <Typography variant="h5">Datos Generales</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    variant="outlined"
                    type="date"
                    label="Fecha de Operacion"
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
                <TextField
                    variant="outlined"
                    type="number"
                    label="Campaña"
                    name="campaign"
                    value={formValues.campaign}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControl key="field-select" fullWidth>
                    <InputLabel id="field">Campo</InputLabel>
                    <Select
                        labelId="field"
                        name="field"
                        value={formValues.field}
                        label="Campo"
                        onChange={handleSelectChange}
                    >
                        {fields?.map((f) => (
                            <MenuItem key={f} value={f}>
                                {f}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControl key="lot-select" fullWidth>
                    <InputLabel id="lot">Lote</InputLabel>
                    <Select
                        labelId="lot"
                        name="lot"
                        value={formValues.lot}
                        label="Lote"
                        onChange={handleSelectChange}
                    >
                        {lots?.map((l) => (
                            <MenuItem key={l} value={l}>
                                {l}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
                <TextField
                    variant="outlined"
                    type="text"
                    placeholder='Hectarea'
                    name="has"
                    value={formValues.has}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl key="lot-select" fullWidth>
                    <InputLabel id="lot">Cultivo</InputLabel>
                    <Select
                        labelId="lot"
                        name="cultive"
                        value={formValues.cultive}
                        label="Cultivo"
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
                    label='Carta de Porte'
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
                    label="Ticker / Remito"
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
