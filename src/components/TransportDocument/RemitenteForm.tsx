import { FormControl, Grid, InputAdornment, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { getShortDate } from '../../helpers/dates';
import { Company } from '../../interfaces/company';
import { TransportDocumentFormProps } from './type';
import { ExitFieldItem } from '../../types';


interface RemitenteFormProps {
    changeExitField: (item: ExitFieldItem) => void;
}

export const RemitenteForm: React.FC<TransportDocumentFormProps & RemitenteFormProps> = ({
    formValues,
    companies,
    categories,
    exitFields,
    providers,
    handleInputChange,
    handleSelectChange,
    changeExitField,
}) => {
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    const onChangeCompany = (e: SelectChangeEvent) => {
        const tributaryCode = e.target.value;
        const foundCompany = companies?.find(x => x.trybutaryCode === tributaryCode);
        if (foundCompany) setSelectedCompany(foundCompany);
        handleSelectChange(e);
    }

    const onChangeField = (e: SelectChangeEvent) => {
        const salidaCampoId = e.target.value;
        const foundExitField = exitFields?.find(x => x._id === salidaCampoId);
        if (foundExitField) changeExitField(foundExitField);
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
                    value={formValues.nroCartaPorte.value}
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
                    value={formValues.fechaEmision.value}
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
                    value={formValues.fechaVencimiento.value}
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
                    value={formValues.nroCTG.value}
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
                    value={formValues.arancel.value}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl key="razon-social-select" fullWidth>
                    <InputLabel id="razonSocial" required>Razon Social</InputLabel>
                    <Select
                        labelId="razonSocial"
                        name="cuitCompania"
                        required
                        value={formValues.cuitCompania.value} //CUIT 
                        label="Razon Social"
                        onChange={onChangeCompany}
                    >
                        {companies?.map((c) => (
                            <MenuItem key={c._id} value={c.trybutaryCode}>
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
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
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
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
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
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
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
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {selectedCompany ? selectedCompany.province : "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControl key="category-select" fullWidth>
                    <InputLabel id="category" required>Categoria</InputLabel>
                    <Select
                        labelId="category"
                        name="categoriaEntidadId"
                        required
                        value={formValues.categoriaEntidadId.value}
                        label="Categoria"
                        MenuProps={{
                            PaperProps: {
                                style: { maxHeight: 248 }
                            }
                        }}
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
                <FormControl key="field-select" fullWidth>
                    <InputLabel id="field" required>Campo</InputLabel>
                    <Select
                        labelId="field"
                        name="salidaCampoId"
                        required
                        value={formValues.salidaCampoId.value}
                        label="Campo"
                        onChange={onChangeField}
                    >
                        {exitFields?.map((c) => (
                            <MenuItem key={c._id} value={c._id}>
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
                    value={formValues.nroOperadorONCCA.value}
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
                    value={formValues.nroPlantaONCCA.value}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl key="comercial-primario-select" fullWidth>
                    <InputLabel id="comercial-primario">Remitente Comercial Venta Primario</InputLabel>
                    <Select
                        labelId="comercial-primario"
                        name="cuitRemitenteComercialPrimario"
                        value={formValues.cuitRemitenteComercialPrimario.value}
                        label="Remitente Comercial Venta Primario"
                        onChange={handleSelectChange}
                    >
                        {providers?.map((x) => (
                            <MenuItem key={x._id} value={x.cuit}>
                                {x.razonSocial}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                    <ListItemText
                        key="cuit-comercial-primario"
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                        primary={<Typography variant='subtitle2'>CUIT</Typography>}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {formValues.cuitRemitenteComercialPrimario.value ? formValues.cuitRemitenteComercialPrimario.value : "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl key="comercial-secundario-select" fullWidth>
                    <InputLabel id="comercial-secundario">Remitente Comercial Venta Secundario</InputLabel>
                    <Select
                        labelId="comercial-secundario"
                        name="cuitRemitenteComercialSecundario"
                        value={formValues.cuitRemitenteComercialSecundario.value}
                        label="Remitente Comercial Venta Secundario"
                        onChange={handleSelectChange}
                    >
                        {providers?.map((x) => (
                            <MenuItem key={x._id} value={x.cuit}>
                                {x.razonSocial}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                    <ListItemText
                        key="cuit-comercial-secundario"
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                        primary={<Typography variant='subtitle2'>CUIT</Typography>}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {formValues.cuitRemitenteComercialSecundario.value ? formValues.cuitRemitenteComercialSecundario.value : "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl key="secundario-2-select" fullWidth>
                    <InputLabel id="comercial-2">Remitente Comercial Venta Secundario 2</InputLabel>
                    <Select
                        labelId="comercial-2"
                        name="cuitRemitenteComercialSecundario2"
                        value={formValues.cuitRemitenteComercialSecundario2.value}
                        label="Remitente Comercial Venta Secundario 2"
                        onChange={handleSelectChange}
                    >
                        {providers?.map((x) => (
                            <MenuItem key={x._id} value={x.cuit}>
                                {x.razonSocial}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                    <ListItemText
                        key="cuit-comercial-secundario-2"
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                        primary={<Typography variant='subtitle2'>CUIT</Typography>}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {formValues.cuitRemitenteComercialSecundario2.value ? formValues.cuitRemitenteComercialSecundario2.value : "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl key="mat-select" fullWidth>
                    <InputLabel id="mat">M.A.T</InputLabel>
                    <Select
                        labelId="mat"
                        name="cuitMAT"
                        value={formValues.cuitMAT.value}
                        label="M.A.T"
                        onChange={handleSelectChange}
                    >
                        {providers?.map((x) => (
                            <MenuItem key={x._id} value={x.cuit}>
                                {x.razonSocial}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                    <ListItemText
                        key="cuit-mat"
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                        primary={<Typography variant='subtitle2'>CUIT</Typography>}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {formValues.cuitMAT.value ? formValues.cuitMAT.value : "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl key="representante-select" fullWidth>
                    <InputLabel id="representante">Representante Entrega</InputLabel>
                    <Select
                        labelId="representante"
                        name="cuitRepresentanteEntrega"
                        value={formValues.cuitRepresentanteEntrega.value}
                        label="Representante Entrega"
                        onChange={handleSelectChange}
                    >
                        {providers?.map((x) => (
                            <MenuItem key={x._id} value={x.cuit}>
                                {x.razonSocial}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                    <ListItemText
                        key="cuit-representante"
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                        primary={<Typography variant='subtitle2'>CUIT</Typography>}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {formValues.cuitRepresentanteEntrega.value ? formValues.cuitRepresentanteEntrega.value : "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl key="recibidor-select" fullWidth>
                    <InputLabel id="recibidor">Representante Recibidor</InputLabel>
                    <Select
                        labelId="recibidor"
                        name="cuitRepresentanteRecibidor"
                        value={formValues.cuitRepresentanteRecibidor.value}
                        label="Representante Recibidor"
                        onChange={handleSelectChange}
                    >
                        {providers?.map((x) => (
                            <MenuItem key={x._id} value={x.cuit}>
                                {x.razonSocial}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                    <ListItemText
                        key="cuit-recibidor"
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                        primary={<Typography variant='subtitle2'>CUIT</Typography>}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {formValues.cuitRepresentanteRecibidor.value ? formValues.cuitRepresentanteRecibidor.value : "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
        </Grid>
    )
}
