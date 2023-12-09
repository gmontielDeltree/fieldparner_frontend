import {
    Box,
    IconButton,
    Container,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    TableCell,
    Tooltip,
    Divider,
    Button
} from '@mui/material';
import {
    Transform as TransformIcon,
    Add as AddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material'
import React, { useEffect, useState } from 'react';
import { useDeposit, useForm, useSupply } from '../hooks';
import { getShortDate } from '../helpers/dates';
import { BorderContainer, Loading, TableCellStyled } from '../components'
import { Deposit, Supply } from '@types';


interface TransformSupply {
    supply: Supply;
    deposit: Deposit,
    location: string;
    nroLot: string;
    dueDate: string;
    amount: number;
}

interface NewSupply {
    supplyId: string,
    depositId: string,
    location: string,
    nroLot: string,
    dueDate: string,
    // amount: number,
}

type OriginRowProps = {
    row: TransformSupply;
}

const today = getShortDate();
const originColumns = [
    "Insumo/cultivo",
    "Deposito",
    "Ubicacion",
    "Nro Lote",
    "Vencimiento",
    "UM",
    "Stock Actual",
    "Stock Restante",
    "Stock Disponible",
    "Cantidad",
];

const OriginRow: React.FC<OriginRowProps> = ({ row }) => {
    const { supply, deposit } = row;
    return (
        <TableRow>
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
            <TableCell>
                {supply.unitMeasurement}
            </TableCell>
            <TableCell>
                {supply.currentStock}
            </TableCell>
            <TableCell>
                {supply.reservedStock}
            </TableCell>
            <TableCell>
                {(supply.currentStock - supply.reservedStock)}
            </TableCell>
            <TableCell>
                {row.amount}
            </TableCell>

            <TableCell align="center" sx={{ p: "5px" }}>
                <Tooltip title="Eliminar">
                    <IconButton
                        onClick={() => console.log}
                        color="default"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    )
}

export const TransformPage: React.FC = () => {

    const [originSupplies, setOriginSupplies] = useState<TransformSupply[]>([]);
    const [destinationSupplies, setDestinationSupplies] = useState<TransformSupply[]>([]);
    const { isLoading, supplies, getSupplies } = useSupply();
    const { deposits, getDeposits } = useDeposit();
    const {
        operationDate,
        detail,
        supplyId,
        depositId,
        location,
        nroLot,
        dueDate,
        amount,
        handleInputChange,
        reset,
        setFormulario,
    } = useForm({
        operationDate: today,
        detail: "",
        supplyId: "",
        depositId: "",
        location: "",
        nroLot: "",
        dueDate: "",
        amount: "",
    });
    const [supplySelected, setSupplySelected] = useState<Supply | null>(null);
    const [depositSelected, setDepositSelected] = useState<Deposit | null>(null);

    const onChangeSupply = ({ target }: SelectChangeEvent) => {
        const { value } = target;
        // const supplySelected = JSON.parse(value) as Supply;
        const supplySelected = supplies.find((supply) => supply._id === value);
        if (supplySelected && supplySelected._id) {
            setFormulario((prevState) => ({
                ...prevState,
                supplyId: value,
            }));
            setSupplySelected(supplySelected);
        }
    };

    const onChangeDeposit = ({ target }: SelectChangeEvent) => {
        const { value, name } = target;
        const depositSelected = deposits.find((deposit) => deposit._id === value);

        if (depositSelected && name === "origin") {
            setFormulario((prevState) => ({ ...prevState, depositId: value }));
            setDepositSelected(depositSelected);
        }
        // if (depositSelected && name === "destination") {
        //     setDepositDestinationSelected(depositSelected);
        // }
    };

    const onChangeLocation = ({ target }: SelectChangeEvent) => {
        const { value, name } = target;
        if (name === "origin") {
            setFormulario((prevState) => ({ ...prevState, location: value }));
        }
        // else {
        //   if (!depositDestinationSelected) return;
        //   setLocationDestinationSelected(value);
        // }
    };

    const handleAddSupplyOrigin = () => {

    }

    // const handleAddSupplyDestination = () => {

    // }

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
                        sx={{ mt: 1, backgroundColor: "#f4f4f4", minHeight: "120px" }}
                        component={Paper}
                    >
                        <Table sx={{ minWidth: 350 }} aria-label="customized table">
                            <TableHead>
                                <TableRow>
                                    {
                                        originColumns.map(column => (
                                            <TableCellStyled key={column} >{column}</TableCellStyled>
                                        ))
                                    }
                                    <TableCellStyled />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {originSupplies.map((originSupply) => (
                                    <OriginRow key={originSupply.supply._id} row={originSupply} />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Grid
                        key="row-new-supply-origin"
                        container
                        spacing={1}
                        mt={5}
                        wrap="nowrap"
                    >
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel id="supply">Insumo</InputLabel>
                                <Select
                                    key="select-supply-movement"
                                    labelId="supply"
                                    value={supplyId}
                                    label="Insumo"
                                    onChange={onChangeSupply}
                                >
                                    {supplies.map((supply) => (
                                        <MenuItem key={supply._id} value={supply._id}>
                                            {supply.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel id="deposit">Deposito</InputLabel>
                                <Select
                                    labelId="deposit"
                                    name="origin"
                                    value={depositId}
                                    label="Deposito"
                                    onChange={onChangeDeposit}
                                >
                                    {deposits.map((deposit) => (
                                        <MenuItem key={deposit._id} value={deposit._id}>
                                            {deposit.description}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel id="location">Ubicacion</InputLabel>
                                <Select
                                    labelId="location"
                                    name="origin"
                                    value={location}
                                    label="Ubicacion"
                                    onChange={onChangeLocation}
                                >
                                    {depositSelected?.locations.map((loc) => (
                                        <MenuItem key={loc} value={loc}>
                                            {loc}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            {
                                supplySelected && supplySelected.stockByLot
                                    ? (
                                        <TextField
                                            key="nroLot-input"
                                            variant="outlined"
                                            type="text"
                                            label="Nro Lote"
                                            name="nroLot"
                                            value={nroLot}
                                            onChange={handleInputChange}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start" />,
                                            }}
                                            fullWidth
                                        />
                                    )
                                    : "-"
                            }
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            {
                                supplySelected && supplySelected.stockByLot
                                    ? (
                                        <TextField
                                            variant="outlined"
                                            type="date"
                                            label="Fecha vencimiento"
                                            name="dueDate"
                                            value={dueDate}
                                            onChange={handleInputChange}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start" />,
                                            }}
                                            fullWidth
                                        />
                                    )
                                    : "-"
                            }
                        </Grid>
                        <Grid item xs={12} sm={1} display="flex" justifyContent="center">
                            <IconButton
                                color="success"
                                aria-label="add"
                                size="small"
                                onClick={() => handleAddSupplyOrigin()}
                            >
                                <AddIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </BorderContainer>
                <Typography variant="h5" sx={{ my: 3 }}>
                    Nuevo Insumo Destino
                </Typography>
                <BorderContainer key="supplies-destination">
                    Insumo Destino
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
                            fullWidth>
                            Guardar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    )

};


/*
type NewSupplyProps = {
    formValues: NewSupply,
    onChangeSupply: () => void;
    onChangeDeposit: () => void;
    onChangeLocation: () => void;
}

const NewSupply = ({ formValues }: NewSupplyProps) => {

    const {
        supplyId, depositId, location, nroLot, dueDate
    } = formValues;

    return (
        <Grid
            key="row-new-supply-origin"
            container
            spacing={1}
            mt={5}
            wrap="nowrap"
        >
            <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                    <InputLabel id="supply">Insumo</InputLabel>
                    <Select
                        key="select-supply-movement"
                        labelId="supply"
                        value={supplyId}
                        label="Insumo"
                        onChange={onChangeSupply}
                    >
                        {supplies.map((supply) => (
                            <MenuItem key={supply._id} value={supply._id}>
                                {supply.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                    <InputLabel id="deposit">Deposito</InputLabel>
                    <Select
                        labelId="deposit"
                        name="origin"
                        value={depositId}
                        label="Deposito"
                        onChange={onChangeDeposit}
                    >
                        {deposits.map((deposit) => (
                            <MenuItem key={deposit._id} value={deposit._id}>
                                {deposit.description}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                    <InputLabel id="location">Ubicacion</InputLabel>
                    <Select
                        labelId="location"
                        name="origin"
                        value={location}
                        label="Ubicacion"
                        onChange={onChangeLocation}
                    >
                        {depositSelected?.locations.map((loc) => (
                            <MenuItem key={loc} value={loc}>
                                {loc}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
                {
                    supplySelected && supplySelected.stockByLot
                        ? (
                            <TextField
                                key="nroLot-input"
                                variant="outlined"
                                type="text"
                                label="Nro Lote"
                                name="nroLot"
                                value={nroLot}
                                onChange={handleInputChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" />,
                                }}
                                fullWidth
                            />
                        )
                        : "-"
                }
            </Grid>
            <Grid item xs={12} sm={2}>
                {
                    supplySelected && supplySelected.stockByLot
                        ? (
                            <TextField
                                variant="outlined"
                                type="date"
                                label="Fecha vencimiento"
                                name="dueDate"
                                value={dueDate}
                                onChange={handleInputChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" />,
                                }}
                                fullWidth
                            />
                        )
                        : "-"
                }
            </Grid>
            <Grid item xs={12} sm={1} display="flex" justifyContent="center">
                <IconButton
                    color="success"
                    aria-label="add"
                    size="small"
                    onClick={() => handleAddSupplyOrigin()}
                >
                    <AddIcon />
                </IconButton>
            </Grid>
        </Grid>
    )
}
*/