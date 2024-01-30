import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
    useBusiness,
    useCampaign,
    useDeposit,
    useForm,
    useOrder,
    useStockMovement,
    useSupply
} from '../hooks';
import { DataTable, ItemRow, Loading, NewSupplyRow, TableCellStyled, TemplateLayout } from '../components';
import { Box, Button, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Paper, Select, TableContainer, TextField, Typography } from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';
import { ColumnProps, OrderStatus, StockByLot, TipoEntidad, TransformSupply, WithdrawalOrder, WithdrawalOrderType } from '../types';
import { getShortDate } from '../helpers/dates';



const columns: ColumnProps[] = [
    { text: "Deposito", align: "left" },
    { text: "Insumo", align: "left" },
    { text: "UM", align: "center" },
    { text: "N° Lote", align: "center" },
    { text: "Cantidad a Retirar", align: "center" },
];

const initialForm: WithdrawalOrder = {
    creationDate: getShortDate(),
    reason: "",
    campaignId: "",
    withdrawId: "",
    order: 0,
    state: OrderStatus.Pending,
    type: WithdrawalOrderType.Individual,
    suppliesToBeWithdrawn: [],
};

export const WithdrawalOrdersPage: React.FC = () => {

    const navigate = useNavigate();
    // const dispatch = useAppDispatch();
    const { isLoading, createWithdrawalOrder } = useOrder();
    const [suppliesToAdd, setSuppliesToAdd] = useState<TransformSupply[]>([]);
    const { isLoading: supplyLoading, supplies, getSupplies } = useSupply();
    const { deposits, getDeposits } = useDeposit();
    const { campaigns, getCampaigns } = useCampaign();
    const { isLoading: loadingEntities, businesses: socialEntities, getBusinesses } = useBusiness();
    const { getStock } = useStockMovement();
    const {
        creationDate,
        reason,
        campaignId,
        withdrawId,
        formulario: formValues,
        handleInputChange,
        handleSelectChange,
    } = useForm(initialForm);

    const onClickCancel = () => navigate("/init/overview/list-orders");

    const handleAddWithdrawalOrder = () => {

        createWithdrawalOrder({
            type: "Individual",
            campaignId,
            creationDate,
            withdrawId,
            order: formValues.order,
            reason: formValues.reason,
            state: OrderStatus.Pending,
            suppliesToBeWithdrawn: suppliesToAdd,
        });
    }

    const validateStock = async (newSupply: TransformSupply) => {
        try {
            const { supply, deposit } = newSupply;
            if (!supply._id || !deposit._id) return false;

            const result = await getStock(supply._id, deposit._id, newSupply.location, newSupply.nroLot);

            //Chequeamos que el insumo/deposito/ubicacion/lote tenga stock y que la cantidad sea menor al stock actual
            if (result && result.currentStock > 0) {

                let supplyStock: StockByLot = result;
                const newCurrentStock = (Number(supplyStock.currentStock) - Number(newSupply.amount));
                if (newCurrentStock <= 0) {
                    Swal.fire('Stock insuficiente.', 'La cantidad supera al stock actual.', 'error');
                    return false;
                }
                return true;
            }
            else {
                Swal.fire('Stock insuficiente.', 'No tiene stock del insumo.', 'error');
                return false;
            }
        } catch (error) {
            console.log('error', error);
            return false;
        }
    }

    const addSupplyToAdd = async (item: TransformSupply) => {
        const depositId = item.deposit._id;
        const supplyId = item.supply._id;
        const existSupply = suppliesToAdd.find(s => s.deposit._id === depositId && s.supply._id === supplyId);

        if (existSupply) {
            Swal.fire('Deposito/Insumo.', 'Deposito / Insumo existente.', 'error');
            return;
        }

        if (await validateStock(item))
            setSuppliesToAdd([item, ...suppliesToAdd]);
    }


    const handleAddDepositSupply = (item: TransformSupply) => {
        addSupplyToAdd(item);
    }

    useEffect(() => {
        getSupplies();
        getDeposits();
        getCampaigns();
        getBusinesses();
    }, [])

    return (
        <TemplateLayout key="new-withdrawal-order" viewMap={true}>
            <Loading key="loading-deposit" loading={isLoading || supplyLoading || loadingEntities} />
            <Paper
                variant="outlined"
                sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 } }}
            >
                <Box className="text-center">
                    <AssignmentIcon fontSize='large' />
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
                    <DataTable
                        key="datatable-orders"
                        columns={columns}
                        isLoading={isLoading}
                    >
                        {suppliesToAdd.map((row) => (
                            <ItemRow key={row.id}>
                                <TableCellStyled align="left">
                                    {row.deposit.description}
                                </TableCellStyled>
                                <TableCellStyled align="left">{row.supply.name} </TableCellStyled>
                                <TableCellStyled align="center">{row.supply.unitMeasurement}</TableCellStyled>
                                <TableCellStyled align='center'>{row.nroLot || "-"}</TableCellStyled>
                                <TableCellStyled align='center'>{row.amount}</TableCellStyled>
                            </ItemRow>
                        ))}
                    </DataTable>
                </TableContainer>
                <NewSupplyRow
                    key="new-supply-order"
                    supplies={supplies}
                    deposits={deposits}
                    showDueDate={false}
                    addNewSupply={handleAddDepositSupply} />

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
                            onClick={() => handleAddWithdrawalOrder()}
                        >
                            Generar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </TemplateLayout>
    )
}
