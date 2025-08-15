import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
    useAppSelector,
    useForm,
    useOrder,
} from '../../hooks';
import { DataTable, ItemRow, Loading, TableCellStyled, TemplateLayout } from '../../components';
import { Box, Button, Grid, IconButton, InputAdornment, Paper, TableContainer, TextField, Tooltip, Typography } from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Add as AddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { ColumnProps, DepositSupplyOrder } from '../../types';
import { getShortDate } from '../../helpers/dates';
import { DepositSupplyOrderItem } from '../../types/index';
import { useTranslation } from 'react-i18next';


interface NewWithdrawalRowProps {
    row: DepositSupplyOrderItem;
    addNewWithdrawal: (newWithdrawal: DepositSupplyOrderItem) => void;
}

export const NewWithdrawalRow = ({ row, addNewWithdrawal }: NewWithdrawalRowProps) => {

    const {
        formulario: formValues,
        handleInputChange,
        reset,
    } = useForm({ amount: 0 });

    const handleAddNewWithdrawal = (item: DepositSupplyOrder) => {
        if (!item._id) throw new Error("Error: item not found.");
        addNewWithdrawal({
            ...item,
            amount: Number(formValues.amount)
        });
        reset();
    }

    return (
        <ItemRow key={row._id}>
            <TableCellStyled align="left">{row.supply?.name} </TableCellStyled>
            <TableCellStyled align="left">
                {row.deposit?.description}
            </TableCellStyled>
            <TableCellStyled align='center'>{row.location}</TableCellStyled>
            <TableCellStyled align='center'>{row.nroLot || "-"}</TableCellStyled>
            <TableCellStyled align="center">{row.supply?.unitMeasurement}</TableCellStyled>
            <TableCellStyled align='center'>{row.originalAmount}</TableCellStyled>
            <TableCellStyled align='center'>{(row.originalAmount - row.withdrawalAmount)}</TableCellStyled>
            <TableCellStyled align='center'>{
                <TextField
                    variant="outlined"
                    type="number"
                    size='small'
                    name="amount"
                    value={formValues.amount}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 15, min: 1 }}
                    sx={{ width: "120px" }}
                />
            }
            </TableCellStyled>
            <TableCellStyled key="head-actions" align='center'>
                <IconButton
                    color="success"
                    aria-label="add"
                    size="small"
                    onClick={() => handleAddNewWithdrawal(row)}
                >
                    <AddIcon />
                </IconButton>
            </TableCellStyled>
        </ItemRow>
    )
}

const initialForm = {
    withdrawalDate: getShortDate(),
}

export const ConfirmWithdrawalOrderPage: React.FC = () => {

    const { orderId } = useParams();
    const navigate = useNavigate();
    const { withdrawalOrderActive } = useAppSelector(state => state.order);
    const [listWithdrawals, setListWithdrawals] = useState<DepositSupplyOrderItem[]>([]);
    const { isLoading,
        depositsSuppliesOrder,
        getOrderDetailByNumber,
        confirmWithdrawalOrder } = useOrder();
    const { t } = useTranslation();

    const {
        formulario: formValues,
        handleInputChange,
    } = useForm(initialForm);

    const columnsDepositSupply: ColumnProps[] = [
        { text: t("_supply"), align: "left" },
        { text: t("_warehouse"), align: "left" },
        { text: t("_location"), align: "left" },
        { text: t("batchNumber"), align: "center" },
        { text: t("measurementUnit"), align: "center" },
        { text: t("original_quantity"), align: "center" },
        { text: t("balance"), align: "center" },
        { text: t("withdrawal_fem"), align: "center" },
        { text: "", align: "center" },
    ];
    const columnsWithdrawals: ColumnProps[] = [
        { text: t("_supply"), align: "left" },
        { text: t("_warehouse"), align: "left" },
        { text: t("_location"), align: "left" },
        { text: t("batchNumber"), align: "center" },
        { text: t("amount"), align: "center" },
        { text: "", align: "center" },
    ];


    const onClickCancel = () => navigate("/init/overview/list-orders");

    const onClickConfirmOrder = () => {
        confirmWithdrawalOrder(listWithdrawals, formValues.withdrawalDate);
    }

    const addNewWithdrawal = (newWithdrawal: DepositSupplyOrderItem) => {
        let existWithdrawal = listWithdrawals.find(w => w._id === newWithdrawal._id);
        if (existWithdrawal) {
            Swal.fire('Deposito/Insumo', 'No se puede duplicar insumo/deposito a retirar.', 'error');
            return;
        }

        setListWithdrawals([newWithdrawal, ...listWithdrawals]);
    };

    const handleDeleteWithdrawals = (row: DepositSupplyOrderItem) => {
        setListWithdrawals(listWithdrawals.filter(w => w._id !== row._id));
    }

    useEffect(() => {
        if (orderId) {
            getOrderDetailByNumber(Number(orderId));
        }
    }, [orderId])


    return (
        <TemplateLayout key="new-withdrawal-order" viewMap={false}>
            <Loading key="loading-deposit" loading={isLoading} />
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
                    {t("withdrawals")}
                </Typography>
                <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            variant="outlined"
                            type="text"
                            label={t("order_number")}
                            value={withdrawalOrderActive?.order}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            variant="outlined"
                            type="text"
                            label={t("_reason")}
                            value={withdrawalOrderActive?.reason}
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
                            label={t("_campaign")}
                            value={withdrawalOrderActive?.campaign?.name || withdrawalOrderActive?.campaign?.campaignId}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            variant="outlined"
                            type="text"
                            label={t("withdrawal_fem")}
                            value={withdrawalOrderActive?.withdraw?.nombreCompleto || withdrawalOrderActive?.withdraw?.razonSocial}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            variant="outlined"
                            type="date"
                            label={t("withdrawal_date")}
                            name="withdrawalDate"
                            value={formValues.withdrawalDate}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            inputProps={{
                                max: getShortDate(), // Establece la fecha mínima permitida como la fecha actual
                            }}
                            fullWidth
                        />
                    </Grid>
                </Grid>
                <TableContainer
                    key="taable-orders-1"
                    sx={{
                        minHeight: "120px",
                        maxHeight: "440",
                        overflow: "scroll",
                        mb: 3
                    }}
                    component={Paper}
                >
                    <Typography
                        component="h1"
                        variant="h6"
                        align="left"
                        sx={{ mt: 1, mb: 1 }}
                    >
                        {t("order_details")}
                    </Typography>
                    <DataTable
                        key="datatable-orders"
                        columns={columnsDepositSupply}
                        isLoading={isLoading}
                    >
                        {depositsSuppliesOrder.map((row) => (
                            <NewWithdrawalRow
                                key={row._id}
                                row={row}
                                addNewWithdrawal={addNewWithdrawal} />
                        ))}
                    </DataTable>
                </TableContainer>
                <TableContainer
                    key="taable-orders-2"
                    sx={{
                        minHeight: "120px",
                        maxHeight: "440",
                        overflow: "scroll",
                        mb: 5
                    }}
                    component={Paper}
                >
                    <Typography
                        component="h1"
                        variant="h6"
                        align="left"
                        sx={{ mt: 1, mb: 1 }}
                    >
                        {t("suppliesToWithdraw")}
                    </Typography>
                    <DataTable
                        key="datatable-withdrawals"
                        columns={columnsWithdrawals}
                        isLoading={isLoading}
                    >
                        {listWithdrawals.map((row) => (
                            <ItemRow key={`withdrawal-${row._id}`} >
                                <TableCellStyled align="left">{row.supply?.name} </TableCellStyled>
                                <TableCellStyled align="left">
                                    {row.deposit?.description}
                                </TableCellStyled>
                                <TableCellStyled align='center'>{row.location}</TableCellStyled>
                                <TableCellStyled align='center'>{row.nroLot || "-"}</TableCellStyled>
                                <TableCellStyled align='center'>{row.amount}</TableCellStyled>
                                <TableCellStyled align='center'>
                                    <Tooltip title="Eliminar">
                                        <IconButton
                                            onClick={() => handleDeleteWithdrawals(row)}
                                            sx={{ fontSize: '1.5rem' }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCellStyled>
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
                        <Button
                            variant="contained"
                            color="inherit"
                            onClick={onClickCancel}>
                            {t("id_cancel")}
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                            disabled={listWithdrawals.length === 0}
                            onClick={() => onClickConfirmOrder()}
                        >
                            {t("confirm")}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </TemplateLayout>
    )
}
