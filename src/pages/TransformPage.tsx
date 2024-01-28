import {
    Box,
    IconButton,
    Grid,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    TableCell,
    Tooltip,
    Button,
} from '@mui/material';
import Swal from 'sweetalert2';
import {
    Transform as TransformIcon,
    Delete as DeleteIcon
} from '@mui/icons-material'
import React, { useEffect, useState } from 'react';
import { useAppSelector, useDeposit, useForm, useStockMovement, useSupply } from '../hooks';
import { getShortDate } from '../helpers/dates';
import { BorderContainer, NewSupplyRow, ItemRow, Loading, TableCellStyledBlack } from '../components';
import { ColumnProps, StockByLot, TransformSupply } from '../types';



const today = getShortDate();
const originColumns: ColumnProps[] = [
    { text: "Insumo/cultivo", align: "left" },
    { text: "Deposito", align: "left" },
    { text: "Ubicacion", align: "left" },
    { text: "Nro Lote", align: "left" },
    { text: "Vencimiento", align: "left" },
    { text: "UM", align: "center" },
    { text: "Stock Actual", align: "left" },
    { text: "Stock Reservado", align: "left" },
    { text: "Stock Disponible", align: "left" },
    { text: "Cantidad a Utilizar", align: "center" },
];
const destinationColumns: ColumnProps[] = [
    { text: "Insumo/cultivo", align: "left" },
    { text: "Deposito", align: "left" },
    { text: "Ubicacion", align: "left" },
    { text: "Nro Lote", align: "left" },
    { text: "Vencimiento", align: "left" },
    { text: "UM", align: "center" },
    { text: "Cantidad a Crear", align: "center" },
    { text: "Horas/Empledo", align: "center" },
];


type SupplyRowProps = {
    row: TransformSupply;
    type: "origin" | "destination";
    deleteRow: (id: string) => void;
}

const SupplyRow: React.FC<SupplyRowProps> = ({ row, type, deleteRow }) => {
    const { supply, deposit } = row;

    return (
        <ItemRow>
            <TableCell>
                {supply.name}
            </TableCell>
            <TableCell>
                {deposit.description}
            </TableCell>
            <TableCell>
                {row.location || "-"}
            </TableCell>
            <TableCell>
                {row.nroLot || "-"}
            </TableCell>
            <TableCell>
                {row.dueDate || "-"}
            </TableCell>
            <TableCell align='center'>
                {supply.unitMeasurement}
            </TableCell>
            {
                type === "origin" && (
                    <>
                        <TableCell align='center'>
                            {row.currentStock}
                        </TableCell>
                        <TableCell align='center'>
                            {supply.reservedStock}
                        </TableCell>
                        <TableCell align='center'>
                            {(row.currentStock - supply.reservedStock)}
                        </TableCell>
                    </>
                )
            }
            <TableCell align='center' width="150px">
                {
                    row.amount
                }

            </TableCell>
            {
                type === "destination" && (
                    <TableCell align='center'>
                        {`${row.hours || "-"} / ${row.employee || "-"}`}
                    </TableCell>
                )
            }
            <TableCell align="center" sx={{ p: "5px" }}>
                <Tooltip title="Eliminar">
                    <IconButton
                        onClick={() => deleteRow(row.id)}
                        color="default"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </ItemRow>
    )
}

const initialStateTransform = {
    operationDate: today,
    detail: ""
};

export const TransformPage: React.FC = () => {

    const { user } = useAppSelector(state => state.auth);
    const [originSupplies, setOriginSupplies] = useState<TransformSupply[]>([]);
    const [destinationSupplies, setDestinationSupplies] = useState<TransformSupply[]>([]);
    const [stockBySupplies, setStockBySupplies] = useState<StockByLot[]>([]);
    const { isLoading, supplies, getSupplies } = useSupply();
    const { deposits, getDeposits } = useDeposit();
    const {
        operationDate,
        detail,
        handleInputChange,
        reset,
    } = useForm(initialStateTransform);
    const { isLoading: loadingTransform, transformStock, getStock } = useStockMovement();

    const validateSupplyStock = async (newSupply: TransformSupply, type: "origin" | "destination" = "origin") => {
        try {
            const { supply, deposit } = newSupply;
            if (!supply._id || !deposit._id) return false;

            const result = await getStock(supply._id, deposit._id, newSupply.location, newSupply.nroLot);

            if (type === "origin") {
                //Chequeamos que el insumo/deposito/ubicacion/lote tenga stock y que la cantidad sea menor al stock actual
                if (result && result.currentStock > 0) {
                    let supplyStock: StockByLot = result;
                    const newCurrentStock = (Number(supplyStock.currentStock) - Number(newSupply.amount));
                    if (newCurrentStock <= 0) {
                        Swal.fire('Stock insuficiente.', 'La cantidad supera al stock actual.', 'error');
                        return false;
                    }
                    setStockBySupplies([{ ...supplyStock, currentStock: newCurrentStock }, ...stockBySupplies]);
                    setOriginSupplies([...originSupplies,
                    {
                        ...newSupply,
                        amount: newSupply.amount,
                        currentStock: result.currentStock
                    }]);
                    return true;
                }
                else {
                    Swal.fire('Stock insuficiente.', 'No tiene stock del insumo.', 'error');
                    return false;
                }
            }
            else {
                if (originSupplies.length === 0) {
                    Swal.fire('Insumos Origen', 'Debe haber al menos un Insumo.', 'error');
                    return false;
                } //Poner un aler

                if (result) {
                    let supplyStock: StockByLot = result;
                    const newCurrentStock = (Number(supplyStock.currentStock) + Number(newSupply.amount));
                    setStockBySupplies([{ ...supplyStock, currentStock: newCurrentStock }, ...stockBySupplies]);
                    setDestinationSupplies([...destinationSupplies, { ...newSupply, amount: newSupply.amount }]);
                } else {
                    if (!user) throw new Error("User not found");
                    const newSupplyStock: StockByLot = {
                        accountId: user.accountId,
                        depositId: deposit._id,
                        supplyId: supply._id,
                        location: newSupply.location,
                        nroLot: newSupply.nroLot,
                        currentStock: Number(newSupply.amount),
                    };
                    setStockBySupplies([...stockBySupplies, newSupplyStock]);
                    setDestinationSupplies([...destinationSupplies, newSupply]);
                }

            }
        } catch (error) {
            console.log('error', error);
            return false;
        }
    }

    //ORIGIN
    const handleAddSupplyOrigin = (newSupply: TransformSupply) => {
        validateSupplyStock(newSupply, "origin");
    }

    const deleteRowOrigin = (id: string) => {
        const supplyToRemove = originSupplies.find(s => s.id === id);
        if (!supplyToRemove) return;
        const { supply, deposit, location, nroLot } = supplyToRemove;
        setOriginSupplies(originSupplies.filter(o => o.id !== id));
        setStockBySupplies(stockBySupplies.filter(s =>
            s.supplyId !== supply._id &&
            s.depositId !== deposit._id &&
            s.location !== location &&
            s.nroLot !== nroLot));
    }
    //* */
    //DESTINATION
    const handleAddSupplyDestination = (newSupply: TransformSupply) => {
        validateSupplyStock(newSupply, "destination");
    }

    const deleteRowDestination = (id: string) => {
        const supplyToRemove = destinationSupplies.find(s => s.id === id);
        if (!supplyToRemove) return;
        const { supply, deposit, location, nroLot } = supplyToRemove;
        setOriginSupplies(destinationSupplies.filter(o => o.id !== id));
        setStockBySupplies(stockBySupplies.filter(s =>
            s.supplyId !== supply._id &&
            s.depositId !== deposit._id &&
            s.location !== location &&
            s.nroLot !== nroLot));
    }

    const onClickCancel = () => {
        setOriginSupplies([]);
        setDestinationSupplies([]);
        setStockBySupplies([]);
        reset();
    }

    const saveTransformStock = () => {
        transformStock(
            originSupplies, //Movimientos de salida
            destinationSupplies, //Movimientos de entrada
            stockBySupplies, //Tabla auxiliar de stock
            detail,
            operationDate
        );
    }

    useEffect(() => {
        getSupplies(); getDeposits();
    }, [])

    return (
        <Box ml={2}>
            {(isLoading || loadingTransform) && <Loading loading={true} />}
            <Box
                component="div"
                display="flex"
                alignItems="center"
                sx={{ ml: { sm: 2 }, pt: 3 }}
            >
                <TransformIcon />
                <Typography variant="h5" sx={{ ml: { sm: 2 } }}>
                    Transformarción - Valor Agregado
                </Typography>
            </Box>
            <Paper variant="outlined"
                sx={{
                    mt: 3,
                    minWidth: "1200px",
                    p: { xs: 2, md: 3 },
                    maxHeight: "calc(100vh - 150px)",
                    overflow: "scroll"
                }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                    Insumos Origen
                </Typography>
                <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            variant="outlined"
                            type="date"
                            label="Fecha de la operacion:"
                            name="operationDate"
                            value={operationDate}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            inputProps={{
                                max: today, // Establece la fecha mínima permitida como la fecha actual
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            variant="outlined"
                            type="text"
                            label="Motivo:"
                            name="detail"
                            value={detail}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            fullWidth
                        />
                    </Grid>
                </Grid>
                <BorderContainer key="supplies-origin">
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
                                        originColumns.map(({ text, align }) => (
                                            <TableCellStyledBlack key={text} align={align} >
                                                {text}
                                            </TableCellStyledBlack>
                                        ))
                                    }
                                    <TableCellStyledBlack />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {originSupplies.map((originSupply) => (
                                    <SupplyRow
                                        key={originSupply.id}
                                        type='origin'
                                        row={originSupply}
                                        deleteRow={deleteRowOrigin}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <NewSupplyRow
                        key="new-supply-to-origin"
                        supplies={supplies}
                        deposits={deposits}
                        showDueDate
                        addNewSupply={handleAddSupplyOrigin} />
                </BorderContainer>
                <Typography variant="h5" sx={{ my: 3 }}>
                    Nuevo Insumo Destino
                </Typography>
                <BorderContainer key="supplies-destination">
                    <TableContainer
                        key="table-supply-destination"
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
                                        destinationColumns.map(({ text, align }) => (
                                            <TableCellStyledBlack key={text} align={align} >
                                                {text}
                                            </TableCellStyledBlack>
                                        ))
                                    }
                                    <TableCellStyledBlack />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {destinationSupplies.map((originSupply) => (
                                    <SupplyRow
                                        key={originSupply.id}
                                        type="destination"
                                        row={originSupply}
                                        deleteRow={deleteRowDestination}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <NewSupplyRow
                        key="new-supply-to-destination"
                        supplies={supplies}
                        deposits={deposits}
                        showDueDate
                        addNewSupply={handleAddSupplyDestination} />
                </BorderContainer>
                <Grid container justifyContent="end" spacing={3} mt={2}>
                    <Grid item xs={12} sm={2}>
                        <Button
                            variant='contained'
                            color="inherit"
                            onClick={() => onClickCancel()}
                            fullWidth>
                            Cancelar
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => saveTransformStock()}
                            fullWidth>
                            Guardar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    )

};
