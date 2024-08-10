import { FormControl, Grid, InputAdornment, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import React, { useState, ChangeEvent } from 'react';
import { TransportDocument } from '../../interfaces/transportDocument';
import { getShortDate } from '../../helpers/dates';
import { Company } from '../../interfaces/company';


// const TextFieldCustom = styled(TextField)(() => ({
//     backgroundColor: "#f5f5f5",
//     fontWeight: 600
// }));


interface RemitenteFormProps {
    formValues: TransportDocument;
    companies: Company[];
    handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: ({ target }: SelectChangeEvent) => void;
}

export const RemitenteForm: React.FC<RemitenteFormProps> = ({
    formValues,
    companies,
    handleInputChange,
    handleSelectChange
}) => {
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    const onChangeCompany = (e: SelectChangeEvent) => {
        const value = e.target.value;
        const foundCompany = companies.find(x => x.socialReason.toLowerCase() === value.toLowerCase());
        if (foundCompany)
            setSelectedCompany(foundCompany);

        handleSelectChange(e);
    }

    return (
        <Grid container spacing={1}>
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
                    <InputLabel id="company">Campaña</InputLabel>
                    <Select
                        labelId="company"
                        name="razonSocial"
                        required
                        value={formValues.razonSocial}
                        label="Razon Social"
                        onChange={onChangeCompany}
                    >
                        {companies?.map((c) => (
                            <MenuItem key={c._id} value={c.socialReason}>
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
        </Grid>
    )
}
