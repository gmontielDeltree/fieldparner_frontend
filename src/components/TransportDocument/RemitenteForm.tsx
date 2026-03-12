import { FormControl, FormHelperText, Grid, InputAdornment, InputLabel, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
// import { getShortDate } from '../../helpers/dates';
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
    const { cuitCompania, salidaCampoId } = formValues;
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    useEffect(() => {
        if (cuitCompania.value !== "" && companies) {
            const foundCompany = companies.find(x => x.trybutaryCode === cuitCompania.value);
            if (foundCompany) setSelectedCompany(foundCompany);
        }
    }, [cuitCompania, companies])

    useEffect(() => {
        if (salidaCampoId.value !== "" && exitFields) {
            const foundExitField = exitFields.find(x => x._id === salidaCampoId.value);
            if (foundExitField) changeExitField(foundExitField);
        }
    }, [salidaCampoId, exitFields])



    return (
        <Grid className="remitente-form" container spacing={1}>
           <Grid item xs={12} sm={3}>
    <TextField
        variant="outlined"
        type="text"
        label="Carta Porte Nro"
        error={formValues.nroCartaPorte.isError}
        helperText={formValues.nroCartaPorte.isError ? formValues.nroCartaPorte.message : "Solo valores numéricos"}
        name="nroCartaPorte"
        value={formValues.nroCartaPorte.value}
        onChange={(e) => {
            // Validar que solo se ingresen números
            const numericRegex = /^[0-9]*$/;
            if (numericRegex.test(e.target.value) || e.target.value === '') {
                handleInputChange(e);
            }
        }}
        disabled={!!formValues._id} //readonly si existe
        InputProps={{
            startAdornment: <InputAdornment position="start" />,
            inputProps: { 
                pattern: '[0-9]*', // HTML5 validation
            }
        }}
        fullWidth
    />
</Grid>
            <Grid item xs={12} sm={2}>
                <TextField
                    variant="outlined"
                    type="date"
                    label={"Fecha Emision"}
                    name="fechaEmision"
                    error={formValues.fechaEmision.isError}
                    helperText={formValues.fechaEmision.message}
                    value={formValues.fechaEmision.value}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    // inputProps={{
                    //     min: getShortDate(false, "-"), // Establece la fecha mínima permitida como la fecha actual
                    // }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={2}>
                <TextField
                    variant="outlined"
                    type="date"
                    label={"Fecha Vencimiento"}
                    aria-pepe="pepe"
                    name="fechaVencimiento"
                    error={formValues.fechaVencimiento.isError}
                    helperText={formValues.fechaVencimiento.message}
                    value={formValues.fechaVencimiento.value}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    // inputProps={{
                    //     min: getShortDate(false, "-"), // Establece la fecha mínima permitida como la fecha actual
                    // }}
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
                <FormControl
                    key="razon-social-select"
                    error={formValues.cuitCompania.isError}
                    fullWidth>
                    <InputLabel id="razonSocial" >Razon Social</InputLabel>
                    <Select
                        labelId="razonSocial"
                        name="cuitCompania"
                        value={formValues.cuitCompania.value} //CUIT 
                        label="Razon Social"
                        onChange={handleSelectChange}
                    >
                        {companies?.map((c) => (
                            <MenuItem key={c._id} value={c.trybutaryCode}>
                                {c.socialReason}
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{formValues.cuitCompania.message}</FormHelperText>
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
                <FormControl
                    key="category-select"
                    fullWidth
                    error={formValues.categoriaEntidadId.isError}>
                    <InputLabel id="category" >Categoria</InputLabel>
                    <Select
                        labelId="category"
                        name="categoriaEntidadId"
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
                    <FormHelperText>{formValues.categoriaEntidadId.message}</FormHelperText>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControl
                    key="field-select"
                    fullWidth
                    error={formValues.salidaCampoId.isError}
                >
                    <InputLabel id="field" >Campo</InputLabel>
                    <Select
                        labelId="field"
                        name="salidaCampoId"
                        value={formValues.salidaCampoId.value}
                        label="Campo"
                        onChange={handleSelectChange}
                    >
                        {exitFields?.map((c) => {
                            const campo = c.field?.nombre || '-';
                            const lote = c.lot?.properties?.nombre || '-';
                            const cultivo = c.crop?.descriptionES || c.crop?.crop || '-';
                            const kg = c.kgNet != null ? c.kgNet : '-';
                            return (
                                <MenuItem key={c._id} value={c._id}>
                                    {`${campo} / ${lote} / ${cultivo} / ${kg} kg`}
                                </MenuItem>
                            );
                        })}
                    </Select>
                    <FormHelperText>{formValues.salidaCampoId.message}</FormHelperText>
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
