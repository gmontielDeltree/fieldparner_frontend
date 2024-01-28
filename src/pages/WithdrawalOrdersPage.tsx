import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useBusiness, useCampaign, useDeposit, useForm, useOrder, useSupply } from '../hooks';
import { BorderContainer, Loading, NewSupplyRow, TableCellStyledBlack, TemplateLayout } from '../components';
import { Box, Button, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';
import { ColumnProps, OrderStatus, TipoEntidad, TransformSupply, WithdrawalOrder, WithdrawalOrderType } from '../types';
import { getShortDate } from '../helpers/dates';



const columns: ColumnProps[] = [
    { text: "Deposito", align: "left" },
    { text: "Insumo", align: "left" },
    { text: "UM", align: "center" },
    { text: "Cantidad a Retirar", align: "center" },
];

const initialForm: WithdrawalOrder = {
    creationDate: getShortDate(),
    reason: "",
    campaignId: "",
    withdrawId: "",
    order: "",
    state: OrderStatus.Pending,
    type: WithdrawalOrderType.Individual
};

export const WithdrawalOrdersPage: React.FC = () => {

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isLoading, createWithdrawalOrder } = useOrder();

    const { isLoading: supplyLoading, supplies, getSupplies } = useSupply();
    const { deposits, getDeposits } = useDeposit();
    const { campaigns, getCampaigns } = useCampaign();
    const { isLoading: loadingEntities, businesses: socialEntities } = useBusiness();
    const {
        creationDate,
        reason,
        campaignId,
        withdrawId,
        formulario,
        setFormulario,
        handleInputChange,
        handleFormValueChange,
        handleSelectChange,
    } = useForm(initialForm);

    const onClickCancel = () => navigate("/init/overview/list-orders");

    const handleAddOrder = () => { }

    const addNewDepositSupply = (item: TransformSupply) => {
        console.log('item', item);
    }

    useEffect(() => {
        getCampaigns();
        getSupplies();
        getDeposits();
    }, [])

    return (
        <TemplateLayout key="new-withdrawal-order" viewMap={true}>
            <Loading key="loading-deposit" loading={isLoading || supplyLoading || loadingEntities} />
            <Paper
                variant="outlined"
                sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 } }}
            >
                <Box className="text-center">
                    <AssignmentIcon />
                </Box>
                <Typography
                    component="h1"
                    variant="h4"
                    align="center"
                    sx={{ mt: 1, mb: 7 }}
                >
                    Nueva Orden de Retiro
                </Typography>
                <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            variant="outlined"
                            type="date"
                            label="Fecha"
                            name="creationDate"
                            value={creationDate}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            inputProps={{
                                min: getShortDate(), // Establece la fecha mínima permitida como la fecha actual
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            variant="outlined"
                            type="text"
                            label="Motivo"
                            name="reason"
                            value={reason}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl key="campaign-select" fullWidth>
                            <InputLabel id="campaign">Campaña</InputLabel>
                            <Select
                                labelId="campaign"
                                name="campaignId"
                                value={campaignId}
                                label="Campaña"
                                onChange={handleSelectChange}
                            >
                                {campaigns?.map((c) => (
                                    <MenuItem key={c.campaignId} value={c.campaignId}>
                                        {c.campaignId}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl key="trucker-select" fullWidth>
                            <InputLabel id="withdraw">Retira</InputLabel>
                            <Select
                                labelId="trucker"
                                name="withdrawId"
                                value={withdrawId}
                                label="Retira"
                                onChange={handleSelectChange}
                            >
                                {socialEntities?.filter(s => s.tipoEntidad === TipoEntidad.FISICA).map((f) => (
                                    <MenuItem key={f._id} value={f._id}>
                                        {f.nombreCompleto || f.razonSocial}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <TableContainer
                    key="table-supply-origin"
                    sx={{
                        minHeight: "120px",
                        maxHeight: "440",
                        overflow: "scroll",
                        mb: 5
                    }}
                    component={Paper}
                >
                    <Table sx={{ minWidth: 350 }} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                {
                                    columns.map(({ text, align }) => (
                                        <TableCellStyledBlack key={text} align={align} >
                                            {text}
                                        </TableCellStyledBlack>
                                    ))
                                }
                                <TableCellStyledBlack />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* {supplies.map((originSupply) => (
                                    <SupplyRow
                                        key={originSupply.id}
                                        type='origin'
                                        row={originSupply}
                                        deleteRow={deleteRowOrigin}
                                    />
                                ))} */}
                        </TableBody>
                    </Table>
                </TableContainer>
                <NewSupplyRow
                    key="new-supply-to-origin"
                    supplies={supplies}
                    deposits={deposits}
                    addNewSupply={addNewDepositSupply} />

                <Grid
                    container
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-around"
                    sx={{ mt: 3 }}
                >
                    <Grid item xs={12} sm={3}>
                        <Button onClick={onClickCancel}>Cancelar</Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleAddOrder()}
                        >
                            Generar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </TemplateLayout>
    )
}
