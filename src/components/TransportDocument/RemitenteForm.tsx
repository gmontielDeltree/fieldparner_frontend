import { FormControl, Grid, InputAdornment, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import React, { useState, ChangeEvent } from 'react';
import { TransportDocument } from '../../interfaces/transportDocument';
import { getShortDate } from '../../helpers/dates';
import { Company } from '../../interfaces/company';
import { Category, ExitFieldItem } from '@types';


// const TextFieldCustom = styled(TextField)(() => ({
//     backgroundColor: "#f5f5f5",
//     fontWeight: 600
// }));


export interface RemitenteFormProps {
    formValues: TransportDocument;
    companies: Company[];
    categories: Category[];
    fields: ExitFieldItem[];
    handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: ({ target }: SelectChangeEvent) => void;
}

export const RemitenteForm: React.FC<RemitenteFormProps> = ({
    formValues,
    companies,
    categories,
    fields,
    handleInputChange,
    handleSelectChange
}) => {
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    const onChangeCompany = (e: SelectChangeEvent) => {
        const value = e.target.value;
        const foundCompany = companies.find(x => x.companyId === value);
        if (foundCompany)
            setSelectedCompany(foundCompany);

        handleSelectChange(e);
    }

    return (
        <Grid className="remitente-form" container spacing={1}>
            <Grid item xs={12} sm={3}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Carta Porte Nro"
                    required
                    name="nroCartaPorte"
                    value={formValues.nroCartaPorte}
                    onChange={handleInputChange}
                    disabled={!!formValues._id} //readonly si existe
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={2}>
                <TextField
                    variant="outlined"
                    type="date"
                    label={"Fecha Emision"}
                    required
                    name="fechaEmision"
                    value={formValues.fechaEmision}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    inputProps={{
                        min: getShortDate(false, "-"), // Establece la fecha mínima permitida como la fecha actual
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={2}>
                <TextField
                    variant="outlined"
                    type="date"
                    label={"Fecha Vencimiento"}
                    required
                    name="fechaVencimiento"
                    value={formValues.fechaVencimiento}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    inputProps={{
                        min: getShortDate(false, "-"), // Establece la fecha mínima permitida como la fecha actual
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="C.T.G Nro"
                    name="nroCTG"
                    value={formValues.nroCTG}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={2}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Arancel"
                    name="arancel"
                    value={formValues.arancel}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl key="razon-social-select" fullWidth>
                    <InputLabel id="company" required>Razon Social</InputLabel>
                    <Select
                        labelId="company"
                        name="companiaId"
                        required
                        value={formValues.companiaId} //ID COMPAÑIA
                        label="Razon Social"
                        onChange={onChangeCompany}
                    >
                        {companies?.map((c) => (
                            <MenuItem key={c._id} value={c.companyId}>
                                {c.socialReason}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                    <ListItemText
                        primary={<Typography variant='subtitle2'>CUIT</Typography>}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {selectedCompany ? selectedCompany.trybutaryCode : "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                    <ListItemText
                        primary={<Typography variant='subtitle2'>Domicilio</Typography>}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {selectedCompany ? selectedCompany.address : "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                    <ListItemText
                        primary={<Typography variant='subtitle2'>Localidad</Typography>}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {selectedCompany ? selectedCompany.locality : "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={2} >
                <FormControl fullWidth>
                    <ListItemText
                        primary={<Typography variant='subtitle2'>Provincia</Typography>}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {selectedCompany ? selectedCompany.province : "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControl key="razon-social-select" fullWidth>
                    <InputLabel id="category" required>Categoria</InputLabel>
                    <Select
                        labelId="category"
                        name="categoriaEntidad"
                        required
                        value={formValues.categoriaEntidad}
                        label="Categoria"
                        onChange={handleSelectChange}
                    >
                        {categories?.map((c) => (
                            <MenuItem key={c.idCategory} value={c.idCategory}>
                                {c.description}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControl key="razon-social-select" fullWidth>
                    <InputLabel id="field" required>Campo</InputLabel>
                    <Select
                        labelId="field"
                        name="campoCarta"
                        required
                        value={formValues.campoCarta}
                        label="Campo"
                        onChange={onChangeCompany}
                    >
                        {fields?.map((c) => (
                            <MenuItem key={c._id} value={c.fieldId}>
                                {c.field?.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="N° Operador ONCCA"
                    name="nroOperadorONCCA"
                    value={formValues.nroOperadorONCCA}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="N° Planta ONCCA"
                    name="nroPlantaONCCA"
                    value={formValues.nroPlantaONCCA}
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
