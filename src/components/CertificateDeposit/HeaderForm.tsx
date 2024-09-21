import { Button, FormControl, FormHelperText, Grid, IconButton, Input, InputAdornment, InputLabel, ListItemText, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
// import { getShortDate } from '../../helpers/dates';
import { Company } from '../../interfaces/company';
import { CertificateDepositFormProps } from './type';
import { Campaign, Supply } from '../../types';
import { Business } from '../../interfaces/socialEntity';
import {
    CloudUpload as CloudUploadIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';


interface HeaderFormProps {
    campaigns: Campaign[];
    cultives: Supply[];
    providers: Business[];
    companies: Company[];
    deleteFile: () => void;
    fileUpload: (file: File) => void;
    changeDepositary: (depositary: Business) => void;
    changeDepositors: (depositors: Company) => void;
}
//TODO: REVISAR LOS CAMPOS POS IVA (DEPOSITARIO Y DEPOSITANTE)
export const HeaderForm: React.FC<CertificateDepositFormProps & HeaderFormProps> = ({
    formValues,
    campaigns,
    cultives,
    providers,
    companies,
    handleInputChange,
    handleSelectChange,
    handleFormValueChange,
    deleteFile,
    fileUpload,
    changeDepositary,
    changeDepositors
}) => {
    const { cuitDepositario: cuitDepositario, cuitDepositor: cuitDepositante } = formValues;
    const [selectedDepositary, setSelectedDepositary] = useState<Business | null>(null);
    const [selectedDepositors, setSelectedDepositors] = useState<Company | null>(null);

    const removeFile = () => {
        handleFormValueChange && handleFormValueChange("archivoCertificado", "");
        deleteFile();
    }

    const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            let fileNameOriginal = file.name;
            let extensionPos = fileNameOriginal.lastIndexOf(".");
            let fileType = fileNameOriginal.substring(extensionPos, fileNameOriginal.length);

            const newFileName = `certificado-deposito_${formValues.archivoCertificado.value}${fileType}`;
            const renamedFile = new File([file], newFileName, { type: file.type });
            fileUpload(renamedFile);
            handleFormValueChange && handleFormValueChange("archivoCertificado", newFileName);
        }
    };


    useEffect(() => {
        if (cuitDepositario.value !== "" && providers) {
            const foundDepositary = providers.find(x => x.cuit === cuitDepositario.value);
            if (foundDepositary) {
                setSelectedDepositary(foundDepositary);
                changeDepositary(foundDepositary);
            }
        }
    }, [cuitDepositario, providers])

    useEffect(() => {
        if (cuitDepositante.value !== "" && companies) {
            const foundCompany = companies.find(x => x.trybutaryCode === cuitDepositante.value);
            if (foundCompany) {
                changeDepositors(foundCompany);
                setSelectedDepositors(foundCompany);
            }
        }
    }, [cuitDepositante, companies])



    return (
        <Grid key="header-form" container spacing={1} sx={{ px: 1 }}>
            <Grid item xs={12} sm={2}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Certificado Deposito Nro"
                    error={formValues.numeroCertificado.isError}
                    helperText={formValues.numeroCertificado.message}
                    name="numeroCertificado"
                    value={formValues.numeroCertificado.value}
                    onChange={handleInputChange}
                    // disabled={!!formValues._id} //readonly si existe
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
            <Grid item xs={12} sm={3}>
                <FormControl
                    key="campaign-select"
                    error={formValues.campaniaId.isError}
                    fullWidth>
                    <InputLabel id="campaign">Campaña</InputLabel>
                    <Select
                        labelId="campaign"
                        name="campaniaId"
                        value={formValues.campaniaId.value} //CUIT 
                        label="Campaña"
                        onChange={handleSelectChange}
                    >
                        {campaigns?.map((c) => (
                            <MenuItem key={c._id} value={c.campaignId}>
                                {c.name || c.description}
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{formValues.campaniaId.message}</FormHelperText>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControl
                    key="cultive-select"
                    error={formValues.cultivoId.isError}
                    fullWidth>
                    <InputLabel id="cultive">Cultivo</InputLabel>
                    <Select
                        labelId="cultive"
                        name="cultivoId"
                        value={formValues.cultivoId.value} //CUIT 
                        label="Cultivo"
                        onChange={handleSelectChange}
                    >
                        {cultives?.map((c) => (
                            <MenuItem key={c._id} value={c._id}>
                                {c.name}
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{formValues.cultivoId.message}</FormHelperText>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Tipo Certificado"
                    name="tipoCertificado"
                    value={formValues.tipoCertificado.value}
                    helperText={formValues.tipoCertificado.message}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid container sx={{ overflowX: "hidden" }}>
                <Grid key="form-depositario" item xs={12} sm={6} component={Paper} sx={{ my: 1, px: 1 }}>
                    <Typography
                        variant='h6'
                        align='center'
                        mb={2}
                        sx={{
                            backgroundColor: "#a9a9a96b",
                            borderRadius: "10px",
                            letterSpacing: "1px",
                        }}
                    >Depositario</Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={8}>
                            <FormControl
                                key="depositario-select"
                                error={formValues.cuitDepositario.isError}
                                fullWidth>
                                <InputLabel id="depositario">Razon Social</InputLabel>
                                <Select
                                    labelId="depositario"
                                    name="cuitDepositario"
                                    value={formValues.cuitDepositario.value}
                                    label="Razon Social"
                                    onChange={handleSelectChange}
                                >
                                    {providers?.map((x) => (
                                        <MenuItem key={x._id} value={x.cuit}>
                                            {x.razonSocial}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{formValues.cuitDepositario.message}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <ListItemText
                                    key="cuit-depositario"
                                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                                    primary={<Typography variant='subtitle2'>CUIT</Typography>}
                                    secondary={
                                        <Typography letterSpacing={1} variant='subtitle1'>
                                            {formValues.cuitDepositario.value ? formValues.cuitDepositario.value : "-"}
                                        </Typography>}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <ListItemText
                                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                                    primary={<Typography variant='subtitle2'>Domicilio</Typography>}
                                    secondary={
                                        <Typography letterSpacing={1} variant='subtitle1'>
                                            {selectedDepositary ? selectedDepositary.domicilio : "-"}
                                        </Typography>}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <ListItemText
                                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                                    primary={<Typography variant='subtitle2'>Localidad</Typography>}
                                    secondary={
                                        <Typography letterSpacing={1} variant='subtitle1'>
                                            {selectedDepositary ? selectedDepositary.localidad : "-"}
                                        </Typography>}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <ListItemText
                                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                                    primary={<Typography variant='subtitle2'>Provincia</Typography>}
                                    secondary={
                                        <Typography letterSpacing={1} variant='subtitle1'>
                                            {selectedDepositary ? selectedDepositary.provincia : "-"}
                                        </Typography>}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <ListItemText
                                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                                    primary={<Typography variant='subtitle2'>Pos IVA</Typography>}
                                    secondary={
                                        <Typography letterSpacing={1} variant='subtitle1'>
                                            {selectedDepositary ? selectedDepositary.matricula : "-"}
                                        </Typography>}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid key="form-depositante" item xs={12} sm={6} component={Paper} sx={{ my: 1, px: 1 }}>
                    <Typography
                        variant='h6'
                        align='center'
                        mb={2}
                        sx={{
                            backgroundColor: "#a9a9a96b",
                            borderRadius: "10px",
                            letterSpacing: "1px",
                        }}
                    >Depositante</Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={8}>
                            <FormControl
                                key="depositante-select"
                                error={formValues.cuitDepositor.isError}
                                fullWidth>
                                <InputLabel id="depositante">Razon Social</InputLabel>
                                <Select
                                    labelId="depositante"
                                    name="cuitDepositor"
                                    value={formValues.cuitDepositor.value}
                                    label="Razon Social"
                                    onChange={handleSelectChange}
                                >
                                    {companies?.map((x) => (
                                        <MenuItem key={x._id} value={x.trybutaryCode}>
                                            {x.socialReason}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{formValues.cuitDepositor.message}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <ListItemText
                                    key="cuitDepositante"
                                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                                    primary={<Typography variant='subtitle2'>CUIT</Typography>}
                                    secondary={
                                        <Typography letterSpacing={1} variant='subtitle1'>
                                            {formValues.cuitDepositor.value ? formValues.cuitDepositor.value : "-"}
                                        </Typography>}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <ListItemText
                                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                                    primary={<Typography variant='subtitle2'>Domicilio</Typography>}
                                    secondary={
                                        <Typography letterSpacing={1} variant='subtitle1'>
                                            {selectedDepositors ? selectedDepositors.address : "-"}
                                        </Typography>}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <ListItemText
                                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                                    primary={<Typography variant='subtitle2'>Localidad</Typography>}
                                    secondary={
                                        <Typography letterSpacing={1} variant='subtitle1'>
                                            {selectedDepositors ? selectedDepositors.locality : "-"}
                                        </Typography>}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <ListItemText
                                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                                    primary={<Typography variant='subtitle2'>Provincia</Typography>}
                                    secondary={
                                        <Typography letterSpacing={1} variant='subtitle1'>
                                            {selectedDepositors ? selectedDepositors.province : "-"}
                                        </Typography>}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <ListItemText
                                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                                    primary={<Typography variant='subtitle2'>Pos IVA</Typography>}
                                    secondary={
                                        <Typography letterSpacing={1} variant='subtitle1'>
                                            {selectedDepositors ? selectedDepositors.companyId : "-"}
                                        </Typography>}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} sm={3}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Rubro"
                    error={formValues.rubro.isError}
                    helperText={formValues.rubro.message}
                    name="rubro"
                    value={formValues.rubro.value}
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
                    type="number"
                    label="Rubro %"
                    error={formValues.porcentajeRubro.isError}
                    helperText={formValues.porcentajeRubro.message}
                    name="porcentajeRubro"
                    value={formValues.porcentajeRubro.value}
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
                    label="Tipo"
                    error={formValues.tipoRubro.isError}
                    helperText={formValues.tipoRubro.message}
                    name="tipoRubro"
                    value={formValues.tipoRubro.value}
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
                    type="number"
                    label="Valor"
                    error={formValues.valor.isError}
                    helperText={formValues.valor.message}
                    name="valor"
                    value={formValues.valor.value}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Planta"
                    error={formValues.planta.isError}
                    helperText={formValues.planta.message}
                    name="planta"
                    value={formValues.planta.value}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Analisis N°"
                    error={formValues.numeroAnalisis.isError}
                    helperText={formValues.numeroAnalisis.message}
                    name="numeroAnalisis"
                    value={formValues.numeroAnalisis.value}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={4} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} >
                <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                >
                    Documento
                    <Input
                        type="file"
                        hidden
                        inputProps={{ accept: 'application/pdf' }}
                        onChange={onChangeFile} />
                </Button>
                {formValues.archivoCertificado.value ? (
                    <>
                        <label
                            title={formValues.archivoCertificado.value}
                            style={{
                                margin: "10px",
                                width: "240px",
                                display: "inline-block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                            }}>
                            {formValues.archivoCertificado.value}
                        </label>
                        <IconButton onClick={() => removeFile()} color="error">
                            <CancelIcon fontSize="medium" />
                        </IconButton>
                    </>
                ) :
                    <Typography variant="body1" sx={{ ml: 1, display: "inline-block" }}>
                        Ningún archivo seleccionado
                    </Typography>
                }
            </Grid>
        </Grid>
    )
}
