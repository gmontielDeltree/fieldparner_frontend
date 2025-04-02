import React, { useEffect, useState, useMemo } from 'react';
import { CertificateDepositFormProps } from '../type'
import { Business } from '../../../interfaces/socialEntity'
import { Company } from '../../../interfaces/company';
import { Box, FormControl, Grid, InputAdornment, ListItemText, Paper, TableCell, TextField, Typography } from '@mui/material';
import { useTransportDocument } from '../../../hooks/useTransportDocument';
import { Loading } from '../../Loading';
import { TransportDocumentAdd } from './TransportDocumentAdd';
import { DataTable, ItemRow } from '../../DataTable';
import { TransportDocumentByCertificateDeposit } from '../../../interfaces/certificate-deposit';
import { TransportDocumentRow } from './TransportDocumentRow';
import { NoteAdd as NoteAddIcon } from '@mui/icons-material';
import { useTranslation } from "react-i18next";

interface GrainsFormProps {
    depositary: Business | null;
    depositors: Company | null;
    updateListTransport: (listByCert: TransportDocumentByCertificateDeposit[]) => void;
}

export const GrainsForm: React.FC<CertificateDepositFormProps & GrainsFormProps> = ({
    formValues,
    depositary,
    depositors,
    handleInputChange,
    updateListTransport
}) => {
    const { t } = useTranslation();
    const { campaniaId: campaignId, cultivoId: cultiveId } = formValues;
    const { isLoading, transportDocumentsItem, getTransportDocuments } = useTransportDocument();
    const [transportsByCertificateDeposit, setTransportsByCertificateDeposit] = useState<TransportDocumentByCertificateDeposit[]>([]);

    const listTransportDocument = useMemo(() => {
        if (transportDocumentsItem.length === 0) return [];
        //Filtramos las carta porte por campaña y cultivo
        let transportFiltered = transportDocumentsItem.filter((item) =>
            item.exitField?.campaignId === campaignId.value && item.exitField?.cropId === cultiveId.value);
        //Filtramos las carta porte que ya fueron agregadas
        transportFiltered = transportFiltered.filter((item) => !transportsByCertificateDeposit.some((itemFilter) => itemFilter.numeroCartaPorte === item.nroCartaPorte));
        return transportFiltered;
    }, [transportDocumentsItem, transportsByCertificateDeposit, campaignId, cultiveId]);

    useEffect(() => {
        getTransportDocuments();
    }, [])

    return (
        <Box>
            <Loading loading={isLoading} />
            <Grid key="grains-form" container spacing={1} sx={{ px: 1 }}>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <ListItemText
                            key="cuit-depositario"
                            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                            primary={<Typography variant='subtitle2'>{t("certificateDepositNumber")}</Typography>}
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
                            key="cuit-depositario"
                            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                            primary={<Typography variant='subtitle2'>{t("depositary")}</Typography>}
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
                            key="cuit-depositario"
                            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
                            primary={<Typography variant='subtitle2'>{t("depositor")}</Typography>}
                            secondary={
                                <Typography letterSpacing={1} variant='subtitle1'>
                                    {depositors ? depositors.socialReason : "-"}
                                </Typography>}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Typography
                        variant='h6'
                        fontWeight={"bold"}
                        mb={1}
                        sx={{ letterSpacing: "1px" }}
                        align='center'>
                        {t("ratesPer100Kg")}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={t("storage")}
                        error={formValues.precioAlmacenaje.isError}
                        helperText={formValues.precioAlmacenaje.message}
                        name="precioAlmacenaje"
                        value={formValues.precioAlmacenaje.value}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={t("hauling")}
                        error={formValues.precioAcarreo.isError}
                        helperText={formValues.precioAcarreo.message}
                        name="precioAcarreo"
                        value={formValues.precioAcarreo.value}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={t("generalExpenses")}
                        error={formValues.precioGastosGenerales.isError}
                        helperText={formValues.precioGastosGenerales.message}
                        name="precioGastosGenerales"
                        value={formValues.precioGastosGenerales.value}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={t("screening")}
                        error={formValues.precioZarandeo.isError}
                        helperText={formValues.precioZarandeo.message}
                        name="precioZarandeo"
                        value={formValues.precioZarandeo.value}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={t("other")}
                        error={formValues.precioOtros.isError}
                        helperText={formValues.precioOtros.message}
                        name="precioOtros"
                        value={formValues.precioOtros.value}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={t("perExcessPoint")}
                        error={formValues.precioExcedente.isError}
                        helperText={formValues.precioExcedente.message}
                        name="precioExcedente"
                        value={formValues.precioExcedente.value}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" >$</InputAdornment>,
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={1} display="flex" alignItems="center" justifyContent="end">
                    <Typography variant="h6" >{t("drying")}</Typography>
                </Grid>
                <Grid item xs={12} sm={1}>
                    <TextField
                        variant="outlined"
                        type="number"
                        placeholder={t("from")}
                        error={formValues.precioSecadoDe.isError}
                        helperText={formValues.precioSecadoDe.message}
                        name="precioSecadoDe"
                        value={formValues.precioSecadoDe.value}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" >%</InputAdornment>,
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={1}>
                    <TextField
                        variant="outlined"
                        type="number"
                        placeholder={t("to")}
                        error={formValues.precioSecadoA.isError}
                        helperText={formValues.precioSecadoA.message}
                        name="precioSecadoA"
                        value={formValues.precioSecadoA.value}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" >%</InputAdornment>,
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label={t("dryingAmount")}
                        error={formValues.precioSecado.isError}
                        helperText={formValues.precioSecado.message}
                        name="precioSecado"
                        value={formValues.precioSecado.value}
                        onChange={handleInputChange}
                        // disabled={!!formValues._id} //readonly si existe
                        InputProps={{
                            startAdornment: <InputAdornment position="start" />,
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <TransportDocumentAdd
                        key="transport-document-row"
                        listTransportDocument={listTransportDocument}
                        addTransportDocument={(transportByCert) => {
                            const newTransport = { ...transportByCert, numeroCertificado: formValues.numeroCertificado.value };
                            const updateList = [...transportsByCertificateDeposit, newTransport];
                            setTransportsByCertificateDeposit(updateList);
                            updateListTransport(updateList); //TODO: ver si coonviene pasar el dto carta porte.
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Paper elevation={1} sx={{
                        width: "100%", overflow: "hidden", minHeight: "170px",
                    }}>
                        <DataTable
                            key="table-transport-document"
                            columnGroups={
                                [
                                    { text: "", align: "center", colSpan: 3 },
                                    { text: t("screening"), align: "center", colSpan: 3 },
                                    { text: t("drying"), align: "center", colSpan: 5 }
                                ]
                            }
                            columns={
                                [
                                    { text: t("transportDocNumber"), align: "left" },
                                    { text: t("date"), align: "center" },
                                    { text: t("netKg"), align: "center" },
                                    { text: t("wasteKg"), align: "center" },
                                    { text: t("rate"), align: "center" },
                                    { text: t("amount"), align: "center" },
                                    { text: t("humidityPercentage"), align: "center" },
                                    { text: t("wasteKg"), align: "center" },
                                    { text: t("rate"), align: "center" },
                                    { text: t("amount"), align: "center" },
                                    { text: "", align: "center" },
                                ]}
                            isLoading={isLoading}
                        >
                            {
                                transportsByCertificateDeposit.length === 0 && (
                                    <ItemRow key="header" sx={{ backgroundColor: "#f4f4f4" }}>
                                        <TableCell align="center" colSpan={11} >
                                            <NoteAddIcon fontSize='medium' />
                                        </TableCell>
                                    </ItemRow>
                                )
                            }
                            {transportsByCertificateDeposit.map((item) => (
                                <TransportDocumentRow
                                    key={item.numeroCartaPorte}
                                    item={item}
                                    onDelete={
                                        (item) => {
                                            let updateList = transportsByCertificateDeposit.filter((itemFilter) => itemFilter.numeroCartaPorte !== item.numeroCartaPorte);
                                            setTransportsByCertificateDeposit(updateList);
                                            updateListTransport(updateList);
                                        }
                                    }
                                />
                            ))}
                        </DataTable>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        variant="outlined"
                        type="text"
                        label={t("grade")}
                        name="grado"
                        value={formValues.grado.value}
                        onChange={handleInputChange}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        variant="outlined"
                        type="text"
                        label={t("proteinContent")}
                        name="contProteico"
                        value={formValues.contProteico.value}
                        onChange={handleInputChange}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        variant="outlined"
                        type="text"
                        label={t("factor")}
                        name="factor"
                        value={formValues.factor.value}
                        onChange={handleInputChange}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        variant="outlined"
                        type="text"
                        label={t("observations")}
                        name="observaciones"
                        multiline
                        value={formValues.observaciones.value}
                        onChange={handleInputChange}
                        fullWidth
                    />
                </Grid>
            </Grid >
        </Box>
    )
}