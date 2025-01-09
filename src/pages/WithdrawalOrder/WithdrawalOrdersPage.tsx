import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
    useAppSelector,
    useBusiness,
    useCampaign,
    useCrops,
    useDeposit,
    useForm,
    useOrder,
    useStockMovement,
    useSupply
} from '../../hooks';
import { DataTable, ItemRow, Loading, NewSupplyRow, TableCellStyled, TemplateLayout } from '../../components';
import { Box, Button, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Paper, Select, TableCell, TableContainer, TextField, Typography } from '@mui/material';
import { Assignment as AssignmentIcon, NoteAdd as NoteAddIcon } from '@mui/icons-material';
import { ColumnProps, OrderStatus, StockByLot, DepositSupplyOrder, TransformSupply, WithdrawalOrderType, WithdrawalOrder, StockCrop } from '../../types';
import { getShortDate } from '../../helpers/dates';



const columns: ColumnProps[] = [
    { text: "Deposito", align: "left" },
    { text: "Insumo", align: "left" },
    { text: "UM", align: "center" },
    { text: "Lote", align: "center" },
    { text: "Cantidad a Retirar", align: "center" },
];

const initialForm = {
    accountId: "",
    creationDate: getShortDate(),
    reason: "",
    campaignId: "",
    withdrawId: "",
    order: 0,
    state: OrderStatus.Pending,
    type: WithdrawalOrderType.Individual,
};

export const WithdrawalOrdersPage: React.FC = () => {

    const navigate = useNavigate();
    // const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { isLoading, createWithdrawalOrder } = useOrder();
    const [suppliesToAdd, setSuppliesToAdd] = useState<TransformSupply[]>([]);
    const { isLoading: supplyLoading, supplies, getSupplies } = useSupply();
    const { dataCrops, getCrops } = useCrops();
    const {
        isLoading: depositLoading,
        deposits,
        getDeposits,
        getDepositsBySupplyId,
        getDepositsByCropId } = useDeposit();
    const { campaigns, getCampaigns } = useCampaign();
    const { isLoading: loadingEntities, businesses: socialEntities, getBusinesses } = useBusiness();
    const { getStockBySupply, getStockByCrop } = useStockMovement();
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

    const addNewWithdrawalOrder = async (newOrder: WithdrawalOrder, suppliesOrder: DepositSupplyOrder[]) => {
        if (await createWithdrawalOrder(newOrder, suppliesOrder))
            navigate("/init/overview/list-orders");
    }

    const onClickGenerate = () => {
        const campaign = campaigns.find(c => c._id === campaignId);
        const withdraw = socialEntities.find(s => s._id === withdrawId);

        if (!user || !campaign || !withdraw) throw new Error("Error: debe seleccionar campaña y quien retira.");

        let newDepositSupplyOrders: DepositSupplyOrder[] = suppliesToAdd.map(s => ({
            accountId: user.accountId,
            deposit: s.deposit,
            supply: s.supply,
            crop: s.crop,
            location: s.location,
            nroLot: s.nroLot,
            order: 0, // El numero lo genera en createWithdrawalOrder()
            withdrawalAmount: 0,
            originalAmount: Number(s.amount),

        }));

        addNewWithdrawalOrder({
            type: WithdrawalOrderType.Individual,
            campaign,
            creationDate,
            withdraw,
            order: formValues.order,
            reason: formValues.reason,
            state: OrderStatus.Pending,
            accountId: "",
            field: ""
        }, newDepositSupplyOrders);
    }

    //Validamos stock del insumo o cultivo, de acuerdo a la cantidad a retirar
    const validateStock = async (newSupply: TransformSupply, isCultive: boolean) => {
        try {
            const { supply, deposit, crop } = newSupply;
            const cropId = crop?._id;
            const supplyId = supply?._id;
            const depositId = deposit?._id;

            if (!depositId) return false;
            if (isCultive && !cropId) return false;
            if (!isCultive && !supplyId) return false;

            if (isCultive && cropId) {
                let result = await getStockByCrop(cropId, depositId, newSupply.location, newSupply.nroLot);
                if (result && result.currentStock > 0) {
                    let stockCrop: StockCrop = result;
                    const newCurrentStock = (Number(stockCrop.currentStock) - Number(newSupply.amount));
                  
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
            }
            else if (supplyId) {
                let result = await getStockBySupply(supplyId, depositId, newSupply.location, newSupply.nroLot);
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
            }
        } catch (error) {
            console.log('error', error);
            return false;
        }
    }

    const addDepositSupplyToAdd = async (item: TransformSupply, isCultive: boolean) => {
        const depositId = item.deposit?._id;
        const supplyId = item.supply?._id;
        const cropId = item.crop?._id;

        if (!depositId) return;
        if (isCultive && !cropId) return;
        if (!isCultive && !supplyId) return;

        const foundSupplyOrCrop = suppliesToAdd.find(s => {
            if (isCultive)
                return s.deposit?._id === depositId && s.crop?._id === cropId;
            else
                return s.deposit?._id === depositId && s.supply?._id === supplyId;
        });

        if (foundSupplyOrCrop) {
            if (isCultive) Swal.fire('Cultivo.', 'Deposito / Cultivo existente.', 'error');
            else Swal.fire('Insumo.', 'Deposito / Insumo existente.', 'error');
            return;
        }

        if (await validateStock(item, isCultive)) setSuppliesToAdd([item, ...suppliesToAdd]);
    }

    useEffect(() => {
        getSupplies();
        getDeposits();
        getCampaigns();
        getBusinesses();
        getCrops();
    }, [])

    return (
        <TemplateLayout key="new-withdrawal-order" viewMap={true}>
            <Loading key="loading-deposit" loading={isLoading || supplyLoading || loadingEntities || depositLoading} />
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
                                    <MenuItem key={c.campaignId} value={c._id}>
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
                                {socialEntities?.map((f) => (
                                    <MenuItem key={f._id} value={f._id}>
                                        {f.nombreCompleto || f.razonSocial}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <Box sx={{ mt: 3, mb: 2, p: 1 }}>
                    <NewSupplyRow
                        key="new-supply-order"
                        crops={dataCrops}
                        supplies={supplies}
                        deposits={deposits}
                        showDueDate={false}
                        addNewSupplyOrCultive={(item, isCultive) => {
                            addDepositSupplyToAdd(item, isCultive);
                        }}
                        onChangeSupply={(item) => {
                            if (!item._id) return;
                            getDepositsBySupplyId(item._id);
                        }}
                        onChangeCrop={(item) => {
                            if (!item._id) return;
                            getDepositsByCropId(item._id);
                        }}
                    />
                </Box>
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
                        {
                            suppliesToAdd.length === 0 ? (
                                <ItemRow key="header" sx={{ backgroundColor: "#f4f4f4" }}>
                                    <TableCell align="center" colSpan={11} >
                                        <NoteAddIcon fontSize='medium' />
                                    </TableCell>
                                </ItemRow>
                            ) : suppliesToAdd.map((row) => (
                                <ItemRow key={row.id}>
                                    <TableCellStyled align="left">
                                        {row.deposit?.description}
                                    </TableCellStyled>
                                    <TableCellStyled align="left">{row.supply?.name} </TableCellStyled>
                                    <TableCellStyled align="center">{row.supply?.unitMeasurement}</TableCellStyled>
                                    <TableCellStyled align='center'>{row.nroLot || "-"}</TableCellStyled>
                                    <TableCellStyled align='center'>{row.amount}</TableCellStyled>
                                </ItemRow>
                            ))}
                    </DataTable>
                </TableContainer>
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
                            disabled={suppliesToAdd.length === 0}
                            color="primary"
                            onClick={() => onClickGenerate()}
                        >
                            Generar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </TemplateLayout>
    )
}
