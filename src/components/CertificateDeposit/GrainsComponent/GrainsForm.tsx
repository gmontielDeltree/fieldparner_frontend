import React, { useEffect, useMemo } from 'react';
import { Business } from '../../../interfaces/socialEntity';
import { Company } from '../../../interfaces/company';
import { Box, Card, CardContent, Grid, InputAdornment, ListItemText, Paper, TableCell, TextField, Typography, Divider } from '@mui/material';
import { useTransportDocument } from '../../../hooks/useTransportDocument';
import { Loading } from '../../Loading';
import { TransportDocumentAdd } from './TransportDocumentAdd';
import { DataTable, ItemRow } from '../../DataTable';
import { CertificateDeposit, TransportDocumentByCertificateDeposit } from '../../../interfaces/certificate-deposit';
import { TransportDocumentRow } from './TransportDocumentRow';
import { NoteAdd as NoteAddIcon, LocalShipping as LocalShippingIcon } from '@mui/icons-material';
import { useTranslation } from "react-i18next";

interface GrainsFormProps {
    formData: CertificateDeposit;
    depositary: Business | null;
    depositors: Company | null;
    listTransportByCertificate: TransportDocumentByCertificateDeposit[];
    updateFormData: (path: string, value: any) => void;
    updateListTransport: (listByCert: TransportDocumentByCertificateDeposit[]) => void;
}

export const GrainsForm: React.FC<GrainsFormProps> = ({
    formData,
    depositary,
    depositors,
    listTransportByCertificate,
    updateFormData,
    updateListTransport
}) => {
    const { t } = useTranslation();

    const handleIntegerChange = (path: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        if (rawValue === '') { updateFormData(path, 0); return; }
        const parsed = parseInt(rawValue, 10);
        if (isNaN(parsed)) return;
        if (rawValue !== String(parsed)) {
            e.target.value = String(parsed);
        }
        updateFormData(path, parsed);
    };
    const { isLoading, transportDocumentsItem, getTransportDocuments } = useTransportDocument();

    const listTransportDocument = useMemo(() => {
        if (transportDocumentsItem.length === 0) return [];
        let transportFiltered = transportDocumentsItem.filter((item) =>
            item.exitField?.campaignId === formData.campaniaId && (!formData.cultivoId || item.exitField?.cropId === formData.cultivoId));
        transportFiltered = transportFiltered.filter((item) =>
            !listTransportByCertificate.some((itemFilter) => itemFilter.numeroCartaPorte === item.nroCartaPorte));
        return transportFiltered;
    }, [transportDocumentsItem, listTransportByCertificate, formData.campaniaId, formData.cultivoId]);

    useEffect(() => {
        getTransportDocuments();
    }, [formData.campaniaId, formData.cultivoId]);

    return (
        <Box>
            <Loading loading={isLoading} />
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

                {/* Tarifas cada 100 kg */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                        {t("ratesPer100Kg")}
                    </Typography>
                </Grid>

                <Grid item xs={12} sm={2}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={t("storage")}
                        value={formData.tarifasCada100Kgrs.almacenaje}
                        onChange={(e) => handleIntegerChange('tarifasCada100Kgrs.almacenaje', e)}
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        inputProps={{ style: { textAlign: 'right' } }}
                        fullWidth
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={t("hauling")}
                        value={formData.tarifasCada100Kgrs.acarreo}
                        onChange={(e) => handleIntegerChange('tarifasCada100Kgrs.acarreo', e)}
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        inputProps={{ style: { textAlign: 'right' } }}
                        fullWidth
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={t("generalExpenses")}
                        value={formData.tarifasCada100Kgrs.gastosGenerales}
                        onChange={(e) => handleIntegerChange('tarifasCada100Kgrs.gastosGenerales', e)}
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        inputProps={{ style: { textAlign: 'right' } }}
                        fullWidth
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={t("screening")}
                        value={formData.tarifasCada100Kgrs.zarandeo}
                        onChange={(e) => handleIntegerChange('tarifasCada100Kgrs.zarandeo', e)}
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        inputProps={{ style: { textAlign: 'right' } }}
                        fullWidth
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={t("other")}
                        value={formData.tarifasCada100Kgrs.otros}
                        onChange={(e) => handleIntegerChange('tarifasCada100Kgrs.otros', e)}
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        inputProps={{ style: { textAlign: 'right' } }}
                        fullWidth
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={t("perExcessPoint")}
                        value={formData.tarifasCada100Kgrs.porCptoExceso}
                        onChange={(e) => handleIntegerChange('tarifasCada100Kgrs.porCptoExceso', e)}
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        inputProps={{ style: { textAlign: 'right' } }}
                        fullWidth
                        size="small"
                    />
                </Grid>

                {/* Secado */}
                <Grid item xs={12} sm={1} display="flex" alignItems="center" justifyContent="end">
                    <Typography variant="subtitle2">{t("drying")}</Typography>
                </Grid>
                <Grid item xs={12} sm={1}>
                    <TextField
                        variant="outlined"
                        type="number"
                        placeholder={t("from")}
                        value={formData.tarifasCada100Kgrs.secado.dePorcentaje}
                        onChange={(e) => handleIntegerChange('tarifasCada100Kgrs.secado.dePorcentaje', e)}
                        InputProps={{ startAdornment: <InputAdornment position="start">%</InputAdornment> }}
                        inputProps={{ style: { textAlign: 'right' } }}
                        fullWidth
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={1}>
                    <TextField
                        variant="outlined"
                        type="number"
                        placeholder={t("to")}
                        value={formData.tarifasCada100Kgrs.secado.aPorcentaje}
                        onChange={(e) => handleIntegerChange('tarifasCada100Kgrs.secado.aPorcentaje', e)}
                        InputProps={{ startAdornment: <InputAdornment position="start">%</InputAdornment> }}
                        inputProps={{ style: { textAlign: 'right' } }}
                        fullWidth
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={t("dryingAmount")}
                        value={formData.tarifasCada100Kgrs.secado.montoSecado}
                        onChange={(e) => handleIntegerChange('tarifasCada100Kgrs.secado.montoSecado', e)}
                        inputProps={{ style: { textAlign: 'right' } }}
                        fullWidth
                        size="small"
                    />
                </Grid>

                {/* Tabla de documentos de transporte */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalShippingIcon />
                        Cartas de Porte
                    </Typography>
                </Grid>

                <Grid item xs={12}>
                    <TransportDocumentAdd
                        listTransportDocument={listTransportDocument}
                        addTransportDocument={(transportByCert) => {
                            const newTransport = { ...transportByCert, numeroCertificado: formData.certificacionElectronicaGranos.coe };
                            const updateList = [...listTransportByCertificate, newTransport];
                            updateListTransport(updateList);
                        }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Paper elevation={1} sx={{ width: "100%", overflow: "hidden", minHeight: "170px" }}>
                        <DataTable
                            columnGroups={[
                                { text: "", align: "center", colSpan: 3 },
                                { text: t("screening"), align: "center", colSpan: 3 },
                                { text: t("drying"), align: "center", colSpan: 5 }
                            ]}
                            columns={[
                                { text: t("transportDocNumber"), align: "left" },
                                { text: t("date"), align: "center" },
                                { text: t("netKg"), align: "right" },
                                { text: t("wasteKg"), align: "right" },
                                { text: t("rate"), align: "right" },
                                { text: t("amount"), align: "right" },
                                { text: t("humidityPercentage"), align: "right" },
                                { text: t("wasteKg"), align: "right" },
                                { text: t("rate"), align: "right" },
                                { text: t("amount"), align: "right" },
                                { text: "", align: "center" },
                            ]}
                            isLoading={isLoading}
                        >
                            {listTransportByCertificate.length === 0 && (
                                <ItemRow sx={{ backgroundColor: "#f4f4f4" }}>
                                    <TableCell align="center" colSpan={11}>
                                        <NoteAddIcon fontSize='medium' />
                                    </TableCell>
                                </ItemRow>
                            )}
                            {listTransportByCertificate.map((item) => (
                                <TransportDocumentRow
                                    key={item.numeroCartaPorte}
                                    item={item}
                                    onDelete={(item) => {
                                        const updateList = listTransportByCertificate.filter(
                                            (itemFilter) => itemFilter.numeroCartaPorte !== item.numeroCartaPorte
                                        );
                                        updateListTransport(updateList);
                                    }}
                                />
                            ))}
                        </DataTable>
                    </Paper>
                </Grid>

                {/* Campos adicionales */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={2}>
                    <TextField
                        variant="outlined"
                        type="text"
                        label={t("grade")}
                        value={formData.grado}
                        onChange={(e) => updateFormData('grado', e.target.value)}
                        fullWidth
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        variant="outlined"
                        type="text"
                        label={t("proteinContent")}
                        value={formData.contProteico}
                        onChange={(e) => updateFormData('contProteico', e.target.value)}
                        fullWidth
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        variant="outlined"
                        type="text"
                        label={t("factor")}
                        value={formData.factor}
                        onChange={(e) => updateFormData('factor', e.target.value)}
                        fullWidth
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        variant="outlined"
                        type="text"
                        label={t("observations")}
                        multiline
                        value={formData.tarifasCada100Kgrs.observaciones}
                        onChange={(e) => updateFormData('tarifasCada100Kgrs.observaciones', e.target.value)}
                        fullWidth
                        size="small"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};
