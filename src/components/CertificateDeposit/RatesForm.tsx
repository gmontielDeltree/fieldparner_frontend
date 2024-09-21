import React, { useEffect, useMemo } from 'react';
import { CertificateDepositFormProps } from './type'
import { FormControl, Grid, InputAdornment, ListItemText, Paper, TextField, Typography } from '@mui/material'
import { Business } from '../../interfaces/socialEntity';
import { Company } from '../../interfaces/company';
import { TransportDocumentByCertificateDeposit } from '../../interfaces/certificate-deposit';

interface RatesFormProps {
    depositary: Business | null;
    depositors: Company | null;
    listTransportDocument: TransportDocumentByCertificateDeposit[];
}

export const RatesForm: React.FC<CertificateDepositFormProps & RatesFormProps> = ({
    formValues,
    depositary,
    depositors,
    listTransportDocument,
    handleInputChange,
    handleFormValueChange
}) => {

    const {
        totalGastosGenerales,
        importeIVA,
        totalZarandeo,
        totalConceptoNoGravado,
        totalSecado,
        percepcionIVA,
        otrasPercepciones,
        totalOtros
    } = formValues;


    const total = useMemo(() => {
        return (
            Number(totalGastosGenerales.value) + Number(importeIVA.value) + Number(totalZarandeo.value) +
            Number(totalConceptoNoGravado.value) + Number(totalSecado.value) + Number(percepcionIVA.value) +
            Number(otrasPercepciones.value) + Number(totalOtros.value));
    }, [
        totalGastosGenerales,
        importeIVA,
        totalZarandeo,
        totalConceptoNoGravado,
        totalSecado,
        percepcionIVA,
        otrasPercepciones,
        totalOtros
    ]);


    useEffect(() => {
        const initWeight = () => {
            const pesoBruto = listTransportDocument.reduce((prev, current) => {
                return Number(prev) + Number(current.kgNeto);
            }, 0);
            const pesoVolatil = Number(formValues.kgVolatil.value);
            const pesoZarandeo = listTransportDocument.reduce((prev, current) => {
                return Number(prev) + Number(current.kgMermaZarandeo);
            }, 0);
            const pesoSecado = listTransportDocument.reduce((prev, current) => {
                return Number(prev) + Number(current.kgMermaSecado);
            }, 0);
            const totalZarandeo = listTransportDocument.reduce((prev, current) => {
                return Number(prev) + Number(current.importeZarandeo);
            }, 0);
            const totalSecado = listTransportDocument.reduce((prev, current) => {
                return Number(prev) + Number(current.importeSecado);
            }, 0);

            const pesoNeto = (pesoBruto - pesoVolatil - pesoZarandeo - pesoSecado);
            if (handleFormValueChange) {
                handleFormValueChange("kgBruto", pesoBruto.toString());
                handleFormValueChange("kgZarandeo", pesoZarandeo.toString());
                handleFormValueChange("kgSecado", pesoSecado.toString());
                handleFormValueChange("kgNeto", pesoNeto.toString());
                handleFormValueChange("totalZarandeo", totalZarandeo.toString());
                handleFormValueChange("totalSecado", totalSecado.toString());
            }
        }
        initWeight();
    }, [])


    return (
        <Grid key="grains-form" container spacing={1} sx={{ px: 1 }}>
            <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                    <ListItemText
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                        primary={<Typography variant='subtitle2'>Certificado Deposito N°</Typography>}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {formValues.numeroCertificado.value ? formValues.numeroCertificado.value : "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                    <ListItemText
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                        primary={<Typography variant='subtitle2'>Depositario</Typography>}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {depositary ? depositary.razonSocial : "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                    <ListItemText
                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                        primary={<Typography variant='subtitle2'>Depositante</Typography>}
                        secondary={
                            <Typography letterSpacing={1} variant='subtitle1'>
                                {depositors ? depositors.socialReason : "-"}
                            </Typography>}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={12}>
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={6} component={Paper} sx={{ p: 1 }}>
                        <Grid item xs={12} sm={12}>
                            <Typography align='center' letterSpacing={1} variant='h6'>
                                Peso
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} mb={1}>
                            <FormControl fullWidth>
                                <ListItemText
                                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                                    primary={<Typography variant='subtitle2'>Peso Bruto Kg</Typography>}
                                    secondary={
                                        <Typography align='right' letterSpacing={1} variant='subtitle1'>
                                            {formValues.kgBruto.value}
                                        </Typography>}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} mb={2}>
                            <TextField
                                variant="outlined"
                                type="number"
                                label="Volatil Kg"
                                name="kgVolatil"
                                value={formValues.kgVolatil.value}
                                onChange={handleInputChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" />,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} mb={2}>
                            <TextField
                                variant="outlined"
                                type="number"
                                label="Zarandeo Kg"
                                name="kgZarandeo"
                                value={formValues.kgZarandeo.value}
                                onChange={handleInputChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" />,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} mb={1}>
                            <TextField
                                variant="outlined"
                                type="number"
                                label="Secado Kg"
                                name="kgSecado"
                                value={formValues.kgSecado.value}
                                onChange={handleInputChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" />,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <FormControl fullWidth>
                                <ListItemText
                                    sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                                    primary={<Typography variant='subtitle2'>Peso Neto Kg</Typography>}
                                    secondary={
                                        <Typography align='right' letterSpacing={1} variant='subtitle1'>
                                            {formValues.kgNeto.value}
                                        </Typography>}
                                />
                            </FormControl>
                        </Grid>

                    </Grid>
                    <Grid item xs={12} sm={6} component={Paper}>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={12}>
                                <Typography align='center' letterSpacing={1} variant='h6'>
                                    Servicio
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="text"
                                    label="Forma de Pago"
                                    name="formaPago"
                                    value={formValues.formaPago.value}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" />,
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Gastos Generales"
                                    name="totalGastosGenerales"
                                    value={formValues.totalGastosGenerales.value}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="IVA"
                                    name="iva"
                                    value={formValues.iva.value}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" >%</InputAdornment>,
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Importe IVA"
                                    name="importeIVA"
                                    value={formValues.importeIVA.value}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Zarandeo"
                                    name="totalZarandeo"
                                    value={formValues.totalZarandeo.value}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Cptos. no Gravados"
                                    name="totalConceptoNoGravado"
                                    value={formValues.totalConceptoNoGravado.value}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Secado"
                                    name="totalSecado"
                                    value={formValues.totalSecado.value}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Percepciones IVA"
                                    name="percepcionIVA"
                                    value={formValues.percepcionIVA.value}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Otros"
                                    name="totalOtros"
                                    value={formValues.totalOtros.value}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Otras Percepciones"
                                    name="otrasPercepciones"
                                    value={formValues.otrasPercepciones.value}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} mb={1}>
                                <FormControl fullWidth>
                                    <ListItemText
                                        sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                                        primary={<Typography align='right' variant='subtitle2'>Total</Typography>}
                                        secondary={
                                            <Typography align='right' letterSpacing={1} variant='subtitle1'>
                                                $ {total}
                                            </Typography>}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>

                </Grid>
            </Grid>
            <Grid item xs={12} sm={12}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Descripcion Adicional"
                    name="descripcionAdicional"
                    multiline
                    value={formValues.descripcionAdicional.value}
                    onChange={handleInputChange}
                    fullWidth />
            </Grid>
        </Grid>

    )
}
