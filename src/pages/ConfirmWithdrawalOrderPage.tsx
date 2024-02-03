import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
    useAppSelector,
    useForm,
    useOrder,
} from '../hooks';
import { DataTable, ItemRow, Loading, TableCellStyled, TemplateLayout } from '../components';
import { Box, Button, Grid, IconButton, InputAdornment, Paper, TableContainer, TextField, Tooltip, Typography } from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { Icon } from 'semantic-ui-react';
import { ColumnProps, WithdrawalsByDepositSupply } from '../types';
import { getShortDate } from '../helpers/dates';
import { DepositSupplyOrderItem } from '../types/index';


const columnsDepositSupply: ColumnProps[] = [
    { text: "Deposito", align: "left" },
    { text: "Insumo", align: "left" },
    { text: "Lote", align: "center" },
    { text: "UM", align: "center" },
    { text: "Cantidad Original", align: "center" },
    { text: "Saldo", align: "center" },
    { text: "Ubicacion", align: "center" },
    { text: "Retira", align: "center" },
    { text: "", align: "center" },
];
const columnsWithdrawals: ColumnProps[] = [
    { text: "Deposito", align: "left" },
    { text: "Insumo", align: "left" },
    { text: "Lote", align: "center" },
    // { text: "UM", align: "center" },
    // { text: "Saldo", align: "center" },
    { text: "Ubicacion", align: "center" },
    { text: "Cantidad", align: "center" },
    { text: "", align: "center" },
];

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

    const handleAddNewWithdrawal = (item: DepositSupplyOrderItem) => {
        if (!item._id) throw new Error("Error: item not found.");
        addNewWithdrawal({
            ...item,
            withdrawalAmount: Number(formValues.amount)
        });
        reset();
    }

    return (
        <ItemRow key={row._id}>
            <TableCellStyled align="left">
                {row.deposit.description}
            </TableCellStyled>
            <TableCellStyled align="left">{row.supply.name || "-"} </TableCellStyled>
            <TableCellStyled align='center'>{row.nroLot || "-"}</TableCellStyled>
            <TableCellStyled align="center">{row.supply.unitMeasurement}</TableCellStyled>
            <TableCellStyled align='center'>{row.originalAmount}</TableCellStyled>
            <TableCellStyled align='center'>{(row.originalAmount - row.withdrawalAmount)}</TableCellStyled>
            <TableCellStyled align='center'>{row.location}</TableCellStyled>
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
        getOrderWithDepositsAndSuppliesByOrder,
        confirmWithdrawalOrder } = useOrder();

    const {
        formulario: formValues,
        handleInputChange,
    } = useForm(initialForm);

    const onClickCancel = () => navigate("/init/overview/list-orders");

    const handleConfirmOrder = () => {

        const newList: WithdrawalsByDepositSupply[] = listWithdrawals.map(w => ({
            accountId: w.accountId,
            amount: Number(w.withdrawalAmount),
            depositSupplyOrderId: w._id,
            order: w.order,
            withdrawalDate: formValues.withdrawalDate,
        } as WithdrawalsByDepositSupply));

        confirmWithdrawalOrder(newList);

    }
    //Validar q no se duplique para mismo depo/insu
    const addNewWithdrawal = (newWithdrawal: DepositSupplyOrderItem) => {
        let existWithdrawal = listWithdrawals.find(w => w._id === newWithdrawal._id);
        if (existWithdrawal) {
            Swal.fire('Deposito/Insumo', 'No se puede duplicar deposito/insumo a retirar.', 'error');
            return;
        }

        setListWithdrawals([newWithdrawal, ...listWithdrawals]);
    };

    const handleDeleteWithdrawals = (row: DepositSupplyOrderItem) => {
        setListWithdrawals(listWithdrawals.filter(w => w._id !== row._id));
    }

    useEffect(() => {
        if (orderId) {
            getOrderWithDepositsAndSuppliesByOrder(Number(orderId));
        }
    }, [orderId])


    return (
        <TemplateLayout key="new-withdrawal-order" viewMap={true}>
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
                    Retiros
                </Typography>
                <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            variant="outlined"
                            type="text"
                            label="Nro Orden"
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
                            label="Motivo"
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
                            label="Campaña"
                            value={withdrawalOrderActive?.campaign?.description}
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
                            label="Retira"
                            value={withdrawalOrderActive?.withdraw?.nombreCompleto}
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
                            label="Fecha Retiro"
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
                        Deposito e Insumos de la Orden:
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
                        Insumos a Retirar:
                    </Typography>
                    <DataTable
                        key="datatable-withdrawals"
                        columns={columnsWithdrawals}
                        isLoading={isLoading}
                    >
                        {listWithdrawals.map((row) => (
                            <ItemRow key={`withdrawal-${row._id}`} >
                                <TableCellStyled align="left">
                                    {row.deposit?.description}
                                </TableCellStyled>
                                <TableCellStyled align="left">{row.supply?.name || "-"} </TableCellStyled>
                                <TableCellStyled align='center'>{row.nroLot || "-"}</TableCellStyled>
                                <TableCellStyled align='center'>{row.location}</TableCellStyled>
                                <TableCellStyled align='center'>{row.withdrawalAmount}</TableCellStyled>
                                <TableCellStyled align='center'>
                                    <Tooltip title="Eliminar">
                                        <IconButton
                                            onClick={() => handleDeleteWithdrawals(row)}
                                            sx={{ fontSize: '1.5rem' }}
                                        >
                                            <Icon name="trash alternate" />
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
                        <Button onClick={onClickCancel}>Cancelar</Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleConfirmOrder()}
                        >
                            Confirmar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </TemplateLayout>
    )
}
