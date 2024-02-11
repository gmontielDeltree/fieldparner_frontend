import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, styled, Paper, Box, Typography, Grid, TextField, InputAdornment, TableContainer, FormControl, InputLabel, Select, MenuItem, Divider } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector, useBusiness, useDeposit, useForm, useSupply } from '../../../hooks';
import { uiCloseModal } from '../../../redux/ui';
import { ColumnProps, DisplayModals, TipoEntidad, TransformSupply } from '../../../types';
import {
    Close as CloseIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import { getShortDate } from '../../../helpers/dates';
import { DataTable, ItemRow, NewSupplyRow, TableCellStyled } from '../..';

const CustomDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const columns: ColumnProps[] = [
    { text: "Deposito", align: "left" },
    { text: "Insumo", align: "left" },
    { text: "UM", align: "center" },
    { text: "Lote", align: "center" },
    { text: "Cantidad a Retirar", align: "center" },
];
/*
    TODO: Valor fijos de la cabezera 
*/

export const LaborOrderModal = () => {
    const dispatch = useAppDispatch();
    const { showModal } = useAppSelector((state) => state.ui);
    const { businesses, getBusinesses } = useBusiness();
    //Ver de donde obtenemos los insumos y depositos:
    const { deposits, getDeposits } = useDeposit();
    const { supplies, getSupplies } = useSupply();
    const [suppliesToAdd, setSuppliesToAdd] = useState<TransformSupply[]>([]);

    const {
        creationDate,
        contractor,
        handleInputChange,
        handleSelectChange } = useForm({
            creationDate: getShortDate(),
            contractor: ""
        })

    const onCloseModal = () => {
        dispatch(uiCloseModal());
    };

    const handleAddDepositSupply = (item) => {
        setSuppliesToAdd([item, ...suppliesToAdd])
    }

    const handleGenerateLaborOrder = () => {
        console.log("generate labor order");
    }

    const handlePrint = () => {
        console.log("Imprimir orden");
    }

    useEffect(() => {
        getBusinesses();
        getSupplies();
        getDeposits();
    }, [])


    return (
        <Dialog
            open={showModal === DisplayModals.LaborOrder}
            maxWidth="md"
            fullWidth
            scroll="paper"
            onClose={onCloseModal}
        >
            <DialogTitle variant="h5" sx={{ m: 0, p: 2 }}>
                <Box className="text-center">
                    <AssignmentIcon fontSize='large' />
                </Box>
                <Typography
                    component="h1"
                    variant="h4"
                    align="center"
                    sx={{ mt: 1, mb: 7 }}
                >
                    Orden de Retiro Deposito
                </Typography>
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={onCloseModal}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent>
                <Paper
                    variant="outlined"
                    sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 } }}
                >
                    <Grid container spacing={2} mb={2}>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                variant="outlined"
                                type="text"
                                label="Campo"
                                name="field"
                                value={"German"}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" />,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                variant="outlined"
                                type="text"
                                label="Lote"
                                name="lot"
                                value={"1"}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" />,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                variant="outlined"
                                type="text"
                                label="Hectareas"
                                name="has"
                                value={"50"}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" />,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                variant="outlined"
                                type="text"
                                label="Campaña"
                                name="campaign"
                                value={"24/25"}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" />,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                variant="outlined"
                                type="text"
                                label="Cultivo"
                                name="harvest"
                                value={"Maiz"}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" />,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={8} />
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
                        <Grid item xs={12} sm={4}>
                            <TextField
                                variant="outlined"
                                type="date"
                                label="Orden Retiro"
                                name="withdrawalOrder"
                                value={20188}
                                // onChange={handleInputChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" />,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl key="contractor-select" fullWidth>
                                <InputLabel id="contractor-label">Contratista</InputLabel>
                                <Select
                                    labelId="contractor-label"
                                    name="contractor"
                                    value={contractor}
                                    label="Contratista"
                                    onChange={handleSelectChange}
                                >
                                    {businesses?.filter(s => s.tipoEntidad === TipoEntidad.FISICA).map((f) => (
                                        <MenuItem key={f._id} value={f._id}>
                                            {f.nombreCompleto || f.razonSocial}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Divider />
                    <Box sx={{ my: 3 }}>
                        <NewSupplyRow
                            key="new-supply-order"
                            supplies={supplies}
                            deposits={deposits}
                            showDueDate={false}
                            addNewSupply={handleAddDepositSupply} />
                    </Box>

                    <TableContainer
                        key="table-labor-order"
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
                            isLoading={false}
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
                </Paper>
            </DialogContent>
            <DialogActions>
                <Grid
                    container
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-around"
                    sx={{ mt: 3 }}
                >
                    <Grid item xs={12} sm={3}>
                        <Button onClick={onCloseModal}>Cancelar</Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleGenerateLaborOrder()}
                        >
                            Generar
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled
                            onClick={() => handlePrint()}
                        >
                            Inprimir
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    )
}
