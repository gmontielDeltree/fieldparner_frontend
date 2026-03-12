import React from 'react';
import { Grid, Typography, Card, CardContent, ListItemText, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box } from '@mui/material';
import { Business } from '../../interfaces/socialEntity';
import { Company } from '../../interfaces/company';
import { CertificateDeposit, TransportDocumentByCertificateDeposit } from '../../interfaces/certificate-deposit';
import {
    CheckCircle as CheckCircleIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    LocalShipping as LocalShippingIcon,
    Scale as ScaleIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';

interface ReviewFormProps {
    formData: CertificateDeposit;
    depositary: Business | null;
    depositors: Company | null;
    listTransportDocument: TransportDocumentByCertificateDeposit[];
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
    formData,
    depositary,
    depositors,
    listTransportDocument
}) => {
    return (
        <Grid container spacing={2} sx={{ px: 1 }}>
            {/* Header de revisión */}
            <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CheckCircleIcon color="success" fontSize="large" />
                    <Typography variant="h5" color="success.main">
                        Revisión Final del Certificado
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Verifique que todos los datos sean correctos antes de guardar el certificado de depósito.
                </Typography>
            </Grid>

            {/* Información General */}
            <Grid item xs={12}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                            Información General
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                                <ListItemText
                                    primary={<Typography variant="caption" color="text.secondary">COE</Typography>}
                                    secondary={<Typography variant="body1" fontWeight="bold">{formData.certificacionElectronicaGranos.coe || '-'}</Typography>}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <ListItemText
                                    primary={<Typography variant="caption" color="text.secondary">Fecha Emisión</Typography>}
                                    secondary={<Typography variant="body2">{formData.certificacionElectronicaGranos.fechaEmision || '-'}</Typography>}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <ListItemText
                                    primary={<Typography variant="caption" color="text.secondary">Tipo</Typography>}
                                    secondary={<Typography variant="body2">{formData.certificacionElectronicaGranos.tipoCertificado || '-'}</Typography>}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <ListItemText
                                    primary={<Typography variant="caption" color="text.secondary">Planta N°</Typography>}
                                    secondary={<Typography variant="body2">{formData.plantaNro || '-'}</Typography>}
                                />
                            </Grid>
                            <Grid item xs={6} sm={6}>
                                <ListItemText
                                    primary={<Typography variant="caption" color="text.secondary">Grano y Tipo</Typography>}
                                    secondary={<Typography variant="body2">{formData.certificacionElectronicaGranos.granoYTipo || '-'}</Typography>}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <ListItemText
                                    primary={<Typography variant="caption" color="text.secondary">Campaña</Typography>}
                                    secondary={<Typography variant="body2">{formData.certificacionElectronicaGranos.campana || '-'}</Typography>}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* Depositario y Depositante */}
            <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon color="primary" fontSize="small" />
                            Depositario
                        </Typography>
                        <ListItemText
                            primary={<Typography variant="body1" fontWeight="bold">{formData.depositario.razonSocial || '-'}</Typography>}
                            secondary={
                                <>
                                    <Typography variant="body2">CUIT: {formData.depositario.cuit}</Typography>
                                    <Typography variant="body2">{formData.depositario.domicilio}</Typography>
                                    <Typography variant="body2">{formData.depositario.localidad}, {formData.depositario.provincia}</Typography>
                                </>
                            }
                        />
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon color="secondary" fontSize="small" />
                            Depositante
                        </Typography>
                        <ListItemText
                            primary={<Typography variant="body1" fontWeight="bold">{formData.depositante.razonSocial || '-'}</Typography>}
                            secondary={
                                <>
                                    <Typography variant="body2">CUIT: {formData.depositante.cuit}</Typography>
                                    <Typography variant="body2">{formData.depositante.domicilio}</Typography>
                                    <Typography variant="body2">{formData.depositante.localidad}, {formData.depositante.provincia}</Typography>
                                </>
                            }
                        />
                    </CardContent>
                </Card>
            </Grid>

            {/* Cartas de Porte */}
            <Grid item xs={12}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalShippingIcon color="primary" fontSize="small" />
                            Cartas de Porte
                            <Chip label={listTransportDocument.length} size="small" color="primary" />
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell>N° Carta Porte</TableCell>
                                        <TableCell align="center">Fecha</TableCell>
                                        <TableCell align="right">Kg Neto</TableCell>
                                        <TableCell align="right">Humedad %</TableCell>
                                        <TableCell align="right">Imp. Secado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {listTransportDocument.map((item) => (
                                        <TableRow key={item.numeroCartaPorte}>
                                            <TableCell>{item.numeroCartaPorte}</TableCell>
                                            <TableCell align="center">{item.fechaCartaPorte}</TableCell>
                                            <TableCell align="right">{item.kgNeto.toLocaleString()}</TableCell>
                                            <TableCell align="right">{item.humedadSecado}%</TableCell>
                                            <TableCell align="right">$ {item.importeSecado.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                    {listTransportDocument.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Typography variant="body2" color="text.secondary">Sin cartas de porte</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>

            {/* Resumen de Peso y Servicios */}
            <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScaleIcon color="primary" fontSize="small" />
                            Peso
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Peso Bruto:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" align="right">{formData.peso.pesoBruto.toLocaleString()} kg</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Merma Volátil:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" align="right">- {formData.peso.mermas.volatil.toLocaleString()} kg</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Merma Zarandeo:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" align="right">- {formData.peso.mermas.zarandeo.toLocaleString()} kg</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Merma Secado:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" align="right">- {formData.peso.mermas.secado.toLocaleString()} kg</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1" fontWeight="bold">Peso Neto:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1" fontWeight="bold" align="right" color="primary">
                                    {formData.peso.pesoNeto.toLocaleString()} kg
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReceiptIcon color="secondary" fontSize="small" />
                            Servicios
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Gastos Generales:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" align="right">$ {formData.servicios.gastosGenerales.toLocaleString()}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Secado:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" align="right">$ {formData.servicios.secado.toLocaleString()}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Zarandeo:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" align="right">$ {formData.servicios.zarandeo.toLocaleString()}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">IVA ({formData.servicios.alicuotaIva}):</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" align="right">$ {formData.servicios.importeIva.toLocaleString()}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Otros:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" align="right">$ {formData.servicios.otros.toLocaleString()}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1" fontWeight="bold">Total:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="h6" fontWeight="bold" align="right" color="success.main">
                                    $ {formData.servicios.total.toLocaleString()}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* Datos adicionales */}
            {formData.datosAdicionales && (
                <Grid item xs={12}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">Datos Adicionales</Typography>
                            <Typography variant="body2">{formData.datosAdicionales}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            )}
        </Grid>
    );
};
