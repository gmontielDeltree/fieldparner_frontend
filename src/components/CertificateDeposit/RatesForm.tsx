import React, { useEffect, useMemo } from 'react';
import { Grid, InputAdornment, ListItemText, TextField, Typography, Card, CardContent } from '@mui/material';
import { Business } from '../../interfaces/socialEntity';
import { Company } from '../../interfaces/company';
import { CertificateDeposit, TransportDocumentByCertificateDeposit } from '../../interfaces/certificate-deposit';
import { Scale as ScaleIcon, Receipt as ReceiptIcon } from '@mui/icons-material';

interface RatesFormProps {
    formData: CertificateDeposit;
    depositary: Business | null;
    depositors: Company | null;
    listTransportDocument: TransportDocumentByCertificateDeposit[];
    updateFormData: (path: string, value: any) => void;
}

export const RatesForm: React.FC<RatesFormProps> = ({
    formData,
    depositary,
    depositors,
    listTransportDocument,
    updateFormData
}) => {
    const totalServicios = useMemo(() => {
        return (
            Number(formData.servicios.gastosGenerales) +
            Number(formData.servicios.importeIva) +
            Number(formData.servicios.zarandeo) +
            Number(formData.servicios.cptosNoGravados) +
            Number(formData.servicios.secado) +
            Number(formData.servicios.percepcionesIva) +
            Number(formData.servicios.otrasPercepciones) +
            Number(formData.servicios.otros)
        );
    }, [formData.servicios]);

    const totalPesoNeto = useMemo(() => {
        const pesoBruto = Number(formData.peso.pesoBruto);
        const pesoVolatil = Number(formData.peso.mermas.volatil);
        const pesoZarandeo = Number(formData.peso.mermas.zarandeo);
        const pesoSecado = Number(formData.peso.mermas.secado);
        return pesoBruto - pesoVolatil - pesoZarandeo - pesoSecado;
    }, [formData.peso]);

    useEffect(() => {
        if (listTransportDocument.length > 0) {
            const pesoBruto = listTransportDocument.reduce((prev, current) => Number(prev) + Number(current.kgNeto), 0);
            const pesoZarandeo = listTransportDocument.reduce((prev, current) => Number(prev) + Number(current.kgMermaZarandeo), 0);
            const pesoSecado = listTransportDocument.reduce((prev, current) => Number(prev) + Number(current.kgMermaSecado), 0);
            const totalZarandeo = listTransportDocument.reduce((prev, current) => Number(prev) + Number(current.importeZarandeo), 0);
            const totalSecado = listTransportDocument.reduce((prev, current) => Number(prev) + Number(current.importeSecado), 0);

            updateFormData('peso.pesoBruto', pesoBruto);
            updateFormData('peso.mermas.zarandeo', pesoZarandeo);
            updateFormData('peso.mermas.secado', pesoSecado);
            updateFormData('servicios.zarandeo', totalZarandeo);
            updateFormData('servicios.secado', totalSecado);
        }
    }, [listTransportDocument]);

    useEffect(() => {
        updateFormData('peso.pesoNeto', totalPesoNeto);
    }, [totalPesoNeto]);

    useEffect(() => {
        updateFormData('servicios.total', totalServicios);
    }, [totalServicios]);

    return (
        <Grid container spacing={2} sx={{ px: 1 }}>
            {/* Resumen */}
            <Grid item xs={12}>
                <Card variant="outlined" sx={{ backgroundColor: '#f8f9fa' }}>
                    <CardContent sx={{ py: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <ListItemText
                                    primary={<Typography variant="caption" color="text.secondary">COE</Typography>}
                                    secondary={<Typography variant="body1" fontWeight="bold">{formData.certificacionElectronicaGranos.coe || '-'}</Typography>}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <ListItemText
                                    primary={<Typography variant="caption" color="text.secondary">Depositario</Typography>}
                                    secondary={<Typography variant="body2">{depositary?.razonSocial || formData.depositario?.razonSocial || '-'}</Typography>}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <ListItemText
                                    primary={<Typography variant="caption" color="text.secondary">Depositante</Typography>}
                                    secondary={<Typography variant="body2">{depositors?.socialReason || formData.depositante?.razonSocial || '-'}</Typography>}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* Peso */}
            <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScaleIcon color="primary" />
                            Peso
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <ListItemText
                                    sx={{ backgroundColor: "#f5f5f5", p: 1, borderRadius: 1 }}
                                    primary={<Typography variant="caption" color="text.secondary">Peso Bruto Kg</Typography>}
                                    secondary={<Typography variant="body1" align="right" fontWeight="bold">{formData.peso.pesoBruto.toLocaleString()}</Typography>}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Volátil Kg"
                                    value={formData.peso.mermas.volatil}
                                    onChange={(e) => updateFormData('peso.mermas.volatil', Number(e.target.value))}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Zarandeo Kg"
                                    value={formData.peso.mermas.zarandeo}
                                    onChange={(e) => updateFormData('peso.mermas.zarandeo', Number(e.target.value))}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Secado Kg"
                                    value={formData.peso.mermas.secado}
                                    onChange={(e) => updateFormData('peso.mermas.secado', Number(e.target.value))}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <ListItemText
                                    sx={{ backgroundColor: "#e3f2fd", p: 1, borderRadius: 1 }}
                                    primary={<Typography variant="caption" color="text.secondary">Peso Neto Kg</Typography>}
                                    secondary={<Typography variant="h6" align="right" color="primary">{totalPesoNeto.toLocaleString()}</Typography>}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* Servicios */}
            <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReceiptIcon color="secondary" />
                            Servicios
                        </Typography>

                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="text"
                                    label="Forma de Pago"
                                    value={formData.servicios.formaDePago}
                                    onChange={(e) => updateFormData('servicios.formaDePago', e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Gastos Generales"
                                    value={formData.servicios.gastosGenerales}
                                    onChange={(e) => updateFormData('servicios.gastosGenerales', Number(e.target.value))}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="text"
                                    label="Alícuota IVA"
                                    value={formData.servicios.alicuotaIva}
                                    onChange={(e) => updateFormData('servicios.alicuotaIva', e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Importe IVA"
                                    value={formData.servicios.importeIva}
                                    onChange={(e) => updateFormData('servicios.importeIva', Number(e.target.value))}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Zarandeo"
                                    value={formData.servicios.zarandeo}
                                    onChange={(e) => updateFormData('servicios.zarandeo', Number(e.target.value))}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Cptos. no Gravados"
                                    value={formData.servicios.cptosNoGravados}
                                    onChange={(e) => updateFormData('servicios.cptosNoGravados', Number(e.target.value))}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Secado"
                                    value={formData.servicios.secado}
                                    onChange={(e) => updateFormData('servicios.secado', Number(e.target.value))}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Percepciones IVA"
                                    value={formData.servicios.percepcionesIva}
                                    onChange={(e) => updateFormData('servicios.percepcionesIva', Number(e.target.value))}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Otros"
                                    value={formData.servicios.otros}
                                    onChange={(e) => updateFormData('servicios.otros', Number(e.target.value))}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    type="number"
                                    label="Otras Percepciones"
                                    value={formData.servicios.otrasPercepciones}
                                    onChange={(e) => updateFormData('servicios.otrasPercepciones', Number(e.target.value))}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <ListItemText
                                    sx={{ backgroundColor: "#e8f5e9", p: 1, borderRadius: 1 }}
                                    primary={<Typography variant="caption" align="right" display="block">Total</Typography>}
                                    secondary={<Typography variant="h6" align="right" color="success.main">$ {totalServicios.toLocaleString()}</Typography>}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* Datos adicionales */}
            <Grid item xs={12}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Descripción Adicional"
                    multiline
                    rows={2}
                    value={formData.datosAdicionales}
                    onChange={(e) => updateFormData('datosAdicionales', e.target.value)}
                    fullWidth
                />
            </Grid>
        </Grid>
    );
};
