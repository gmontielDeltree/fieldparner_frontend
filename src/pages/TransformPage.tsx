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
    Button
} from '@mui/material';
import {
    Transform as TransformIcon,
    Delete as DeleteIcon
} from '@mui/icons-material'
import React, { useEffect, useState } from 'react';
import { useDeposit, useForm, useSupply } from '../hooks';
import { getShortDate } from '../helpers/dates';
import { BorderContainer, NewSupplyRow, ItemRow, Loading, TableCellStyledBlack } from '../components';
import { ColumnProps, Deposit, Supply } from '../types';


interface TransformSupply {
    id: string;
    supply: Supply;
    deposit: Deposit,
    location: string;
    nroLot: string;
    dueDate: string;
    amount: number;
    hours?: string;
    employee?: string;
}

const today = getShortDate();
const originColumns: ColumnProps[] = [
    { text: "Insumo/cultivo", align: "left" },
    { text: "Deposito", align: "left" },
    { text: "Ubicacion", align: "left" },
    { text: "Nro Lote", align: "left" },
    { text: "Vencimiento", align: "left" },
    { text: "UM", align: "center" },
    { text: "Stock Actual", align: "left" },
    { text: "Stock Restante", align: "left" },
    { text: "Stock Disponible", align: "left" },
    { text: "Cantidad a Utilizar", align: "center" },
];

///TODO: revisar columnas
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
    onBlurAmount: (id: string, amount: number) => void;
}

const SupplyRow: React.FC<SupplyRowProps> = ({ row, type, deleteRow, onBlurAmount }) => {
    const { supply, deposit } = row;
    const { amount, handleInputChange } = useForm({ amount: 0 });

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
                            {supply.currentStock}
                        </TableCell>
                        <TableCell align='center'>
                            {supply.reservedStock}
                        </TableCell>
                        <TableCell align='center'>
                            {(supply.currentStock - supply.reservedStock)}
                        </TableCell>
                    </>
                )
            }
            <TableCell align='center' width="150px">
                <TextField
                    variant="outlined"
                    size='small'
                    type="number"
                    name="amount"
                    value={amount}
                    onChange={handleInputChange}
                    onBlur={() => onBlurAmount(row.id, amount)}
                    inputProps={{ maxLength: 10 }}
                    fullWidth
                />
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

const initialStateNewSupply = {
    operationDate: today,
    detail: "",
    supplyId: "",
    depositId: "",
    location: "",
    nroLot: "",
    dueDate: "",
};

export const TransformPage: React.FC = () => {

    const [originSupplies, setOriginSupplies] = useState<TransformSupply[]>([]);
    const [destinationSupplies, setDestinationSupplies] = useState<TransformSupply[]>([]);
    const { isLoading, supplies, getSupplies } = useSupply();
    const { deposits, getDeposits } = useDeposit();
    const {
        operationDate,
        detail,
        handleInputChange,
    } = useForm(initialStateNewSupply);

    //ORIGIN
    const handleAddSupplyOrigin = (newSupply: TransformSupply) => {
        setOriginSupplies(prevState => [...prevState, newSupply]);
    }

    const onBlurAmountOrigin = (id: string, newValue: number) => {
        setOriginSupplies((prevState) => (
            prevState.map(obj => obj.id === id ? { ...obj, amount: Number(newValue) } : obj)
        ));
    }

    const deleteRowOrigin = (id: string) => {
        setOriginSupplies(prevState => [...prevState.filter(o => o.id !== id)]);
    }
    //* */
    //DESTINATION
    const handleAddSupplyDestination = (newSupply: TransformSupply) => {
        setDestinationSupplies(prevState => [...prevState, newSupply]);
    }

    const onBlurAmountDestination = (id: string, newValue: number) => {
        setDestinationSupplies((prevState) => (
            prevState.map(obj => obj.id === id ? { ...obj, amount: Number(newValue) } : obj)
        ));
    }

    const deleteRowDestination = (id: string) => {
        setDestinationSupplies(prevState => [...prevState.filter(o => o.id !== id)]);
    }

    const saveTransformStock = () => {
        //TODO: crear createTransformStock
        console.log('originSupplies', originSupplies);
        console.log('destinationSupplies', destinationSupplies);
    }

    useEffect(() => {
        getSupplies(); getDeposits();
    }, [])


    return (
        <Box ml={2}>
            {isLoading && <Loading loading={true} />}
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
                        sx={{ minHeight: "120px", maxHeight: "440", overflow: "scroll" }}
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
                                        onBlurAmount={onBlurAmountOrigin}
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
                        addNewSupply={handleAddSupplyOrigin} />
                </BorderContainer>
                <Typography variant="h5" sx={{ my: 3 }}>
                    Nuevo Insumo Destino
                </Typography>
                <BorderContainer key="supplies-destination">
                    <TableContainer
                        key="table-supply-destination"
                        sx={{ minHeight: "120px", maxHeight: "440", overflow: "scroll" }}
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
                                        onBlurAmount={onBlurAmountDestination}
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
                        addNewSupply={handleAddSupplyDestination} />
                </BorderContainer>
                <Grid container justifyContent="end" spacing={3} mt={2}>
                    <Grid item xs={12} sm={2}>
                        <Button
                            variant='contained'
                            color="inherit"
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
