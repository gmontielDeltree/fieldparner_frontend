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
    fileUpload
}) => {
    const { cuitDepositary: cuitDepositario, cuitDepositors: cuitDepositante } = formValues;
    const [selectedDepositary, setSelectedDepositary] = useState<Business | null>(null);
    const [selectedDepositors, setSelectedDepositors] = useState<Company | null>(null);

    const removeFile = () => {
        handleFormValueChange && handleFormValueChange("fileCertificate", "");
        deleteFile();
    }

    const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            let fileNameOriginal = file.name;
            let extensionPos = fileNameOriginal.lastIndexOf(".");
            let fileType = fileNameOriginal.substring(extensionPos, fileNameOriginal.length);

            const newFileName = `certificado-deposito_${formValues.fileCertificate.value}${fileType}`;
            const renamedFile = new File([file], newFileName, { type: file.type });
            fileUpload(renamedFile);
            handleFormValueChange && handleFormValueChange("fileCertificate", newFileName);
        }
    };


    useEffect(() => {
        if (cuitDepositario.value !== "" && providers) {
            const foundDepositario = providers.find(x => x.cuit === cuitDepositario.value);
            if (foundDepositario) setSelectedDepositary(foundDepositario);
        }
    }, [cuitDepositario, providers])

    useEffect(() => {
        if (cuitDepositante.value !== "" && companies) {
            const foundCompany = companies.find(x => x.trybutaryCode === cuitDepositante.value);
            if (foundCompany) setSelectedDepositors(foundCompany);
        }
    }, [cuitDepositante, companies])



    return (
        <Grid className="remitente-form" container spacing={1} sx={{ px: 1 }}>
            <Grid item xs={12} sm={2}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Certificado Deposito Nro"
                    error={formValues.certificateNumber.isError}
                    helperText={formValues.certificateNumber.message}
                    name="certificateNumber"
                    value={formValues.certificateNumber.value}
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
                    name="emissionDate"
                    error={formValues.emissionDate.isError}
                    helperText={formValues.emissionDate.message}
                    value={formValues.emissionDate.value}
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
                    error={formValues.campaignId.isError}
                    fullWidth>
                    <InputLabel id="campaign">Campaña</InputLabel>
                    <Select
                        labelId="campaign"
                        name="campaignId"
                        value={formValues.campaignId.value} //CUIT 
                        label="Campaña"
                        onChange={handleSelectChange}
                    >
                        {campaigns?.map((c) => (
                            <MenuItem key={c._id} value={c.campaignId}>
                                {c.name || c.description}
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{formValues.campaignId.message}</FormHelperText>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControl
                    key="cultive-select"
                    error={formValues.cultiveId.isError}
                    fullWidth>
                    <InputLabel id="cultive">Cultivo</InputLabel>
                    <Select
                        labelId="cultive"
                        name="cultiveId"
                        value={formValues.cultiveId.value} //CUIT 
                        label="Cultivo"
                        onChange={handleSelectChange}
                    >
                        {cultives?.map((c) => (
                            <MenuItem key={c._id} value={c._id}>
                                {c.name}
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{formValues.cultiveId.message}</FormHelperText>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Tipo Certificado"
                    name="certificateType"
                    value={formValues.certificateType.value}
                    helperText={formValues.certificateType.message}
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
                                error={formValues.cuitDepositary.isError}
                                fullWidth>
                                <InputLabel id="depositario">Razon Social</InputLabel>
                                <Select
                                    labelId="depositario"
                                    name="cuitDepositary"
                                    value={formValues.cuitDepositary.value}
                                    label="Razon Social"
                                    onChange={handleSelectChange}
                                >
                                    {providers?.map((x) => (
                                        <MenuItem key={x._id} value={x.cuit}>
                                            {x.razonSocial}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{formValues.cuitDepositary.message}</FormHelperText>
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
                                            {formValues.cuitDepositary.value ? formValues.cuitDepositary.value : "-"}
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
                                error={formValues.cuitDepositors.isError}
                                fullWidth>
                                <InputLabel id="depositante">Razon Social</InputLabel>
                                <Select
                                    labelId="depositante"
                                    name="cuitDepositors"
                                    value={formValues.cuitDepositors.value}
                                    label="Razon Social"
                                    onChange={handleSelectChange}
                                >
                                    {companies?.map((x) => (
                                        <MenuItem key={x._id} value={x.trybutaryCode}>
                                            {x.socialReason}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{formValues.cuitDepositors.message}</FormHelperText>
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
                                            {formValues.cuitDepositors.value ? formValues.cuitDepositors.value : "-"}
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
                    error={formValues.rubroPercentage.isError}
                    helperText={formValues.rubroPercentage.message}
                    name="rubroPercentage"
                    value={formValues.rubroPercentage.value}
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
                    error={formValues.rubroType.isError}
                    helperText={formValues.rubroType.message}
                    name="rubroType"
                    value={formValues.rubroType.value}
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
                    error={formValues.value.isError}
                    helperText={formValues.value.message}
                    name="value"
                    value={formValues.value.value}
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
                    error={formValues.floor.isError}
                    helperText={formValues.floor.message}
                    name="floor"
                    value={formValues.floor.value}
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
                    error={formValues.analysisNumber.isError}
                    helperText={formValues.analysisNumber.message}
                    name="analysisNumber"
                    value={formValues.analysisNumber.value}
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
                {formValues.fileCertificate.value ? (
                    <>
                        <label
                            title={formValues.fileCertificate.value}
                            style={{
                                margin: "10px",
                                width: "240px",
                                display: "inline-block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                            }}>
                            {formValues.fileCertificate.value}
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
