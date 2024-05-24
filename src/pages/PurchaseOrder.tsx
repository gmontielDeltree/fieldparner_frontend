import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
    useAppSelector,
    useBusiness,
    useForm,
    useOrder,
    userPurchaseOrder,
} from '../hooks';
import { DataTable, ItemRow, Loading, TableCellStyled, TemplateLayout } from '../components';
import { Box, Button, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, TableContainer, TextField, Tooltip, Typography } from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { Icon } from 'semantic-ui-react';
import { ColumnProps, DetailPurchaseOrder, DetailPurchaseOrderItem, PurchaseOrder, Supply } from '../types';

import { getShortDate } from '../helpers/dates';
import { useTranslation } from 'react-i18next';


const columnsDepositSupply: ColumnProps[] = [
    { text: "Insumo", align: "center" },
    { text: "UM", align: "center" },
    { text: "Cantidad", align: "center" },
    { text: "Precio Unitario", align: "center" },
    { text: "Precio Total", align: "center" },
    { text: "", align: "center" },
];
// const columnsWithdrawals: ColumnProps[] = [
//     { text: "Deposito", align: "left" },
//     { text: "Insumo", align: "left" },
//     { text: "Lote", align: "center" },
//     // { text: "UM", align: "center" },
//     // { text: "Saldo", align: "center" },
//     { text: "Ubicacion", align: "center" },
//     { text: "Cantidad", align: "center" },
//     { text: "", align: "center" },
// ];

interface NewOrderItemRowProps {
    supplies: Supply[];
    addNewItem: (newItem: DetailPurchaseOrderItem) => void;
}

export const NewWithdrawalRow = ({ supplies, addNewItem }: NewOrderItemRowProps) => {

    const {
        formulario: formValues,
        handleInputChange,
        setFormulario: setFormValues,
        reset,
    } = useForm<DetailPurchaseOrderItem>({
        nroOrder: "",
        supplyAmount: 0,
        supplyId: "",
        unitMeasurement: "",
        unitPriceSupply: 0,
    });

    //TODO: continuar aca agregando items en la orden
    const onClickPlus = () => {
        if (!formValues.supply?._id) throw new Error("Error: item not found.");
        addNewItem({
            ...formValues,
            supplyAmount: Number(formValues.supplyAmount),
        });
        reset();
    }

    const handleOnChangeSupply = () => {

    }

    return (
        <Grid
            key="row-new-supply"
            container
            alignItems="center"
            spacing={1}
            borderRadius={2}
            pb={1}
            wrap="nowrap"
            sx={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)" }}
        // bgcolor="#f3f3f3"
        >
            <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                    <InputLabel id="supply">Insumo</InputLabel>
                    <Select
                        key="select-supply-movement"
                        labelId="supply"
                        value={formValues.supplyId}
                        name='supplyId'
                        label="Insumo"
                        onChange={handleOnChangeSupply}
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
                <TextField
                    variant="outlined"
                    type="text"
                    label="UM"
                    name="unitMeasurement"
                    value={formValues.unitMeasurement}
                    InputProps={{
                        startAdornment: <InputAdornment position="start" />,
                    }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={2}>
                <TextField
                    variant="outlined"
                    type="number"
                    label="Cantidad"
                    name="supplyAmount"
                    value={formValues.supplyAmount}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 15, min: 1 }}
                    fullWidth
                />
            </Grid>
         
            <Grid item xs={12} sm={1} display="flex" justifyContent="center">
                <IconButton
                    color="success"
                    aria-label="add"
                    size="small"
                    onClick={() => onClickPlus()}
                >
                    <AddIcon />
                </IconButton>
            </Grid>
        </Grid>
    )
}

const initialForm: PurchaseOrder = {
    accountId: "",
    nroOrder: "",
    creationDate: getShortDate(false, "-"),
    address: "",
    businessId: "",
    businessName: "",
    zipCode: "",
    country: "",
    locality: "",
    commercialTerms: "",
    contact: "",
    sent: false,
    subtotal: 0,
    taxPercentage: 0,
    taxValue: 0,
    totalValue: 0,
    anotherPercentage: 0,
    anotherValue: 0,
}

export const PurchaseOrderPage: React.FC = () => {

    // const { order } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    // const { withdrawalOrderActive } = useAppSelector(state => state.order);
    const [listItemToPurchase, setListItemToPurchase] = useState<DetailPurchaseOrderItem[]>([]);
    const { businesses: socialEntities, getBusinesses } = useBusiness();
    const {
        isLoading, createPurchaseOrder
    } = userPurchaseOrder();

    const {
        formulario: formValues,
        handleInputChange,
        handleSelectChange,
        setFormulario: setFormValues,
    } = useForm(initialForm);

    const onClickCancel = () => navigate("/init/overview/purchase-order");


    const onClickDelete = (e: any) => {
        // let existWithdrawal = listWithdrawals.find(w => w._id === newWithdrawal._id);
        // if (existWithdrawal) {
        //     Swal.fire('Deposito/Insumo', 'No se puede duplicar deposito/insumo a retirar.', 'error');
        //     return;
        // }

        // setListWithdrawals([newWithdrawal, ...listWithdrawals]);
    };

    // const handleDeleteWithdrawals = (row: DepositSupplyOrderItem) => {
    //     setListWithdrawals(listWithdrawals.filter(w => w._id !== row._id));
    // }

    const onClickSave = () => {
        console.log("onClickSave");
        console.log('formValues', formValues);
    }

    const onChangeProvider = ({ target }: SelectChangeEvent) => {
        const businessId = target.value;
        const providerFound = socialEntities.find(x => x._id === businessId);
        console.log('proveedor encontrado:', providerFound);

        if (providerFound) {
            setFormValues({
                ...formValues,
                businessId,
                businessName: providerFound.nombreCompleto || providerFound.razonSocial || "-",
                country: providerFound.pais,
                zipCode: providerFound.cp,
                locality: providerFound.localidad,
                address: providerFound.domicilio,
                contact: providerFound.contactoPrincipal || "-"
            });
        }
    }

    useEffect(() => {
        getBusinesses();
    }, [])


    return (
        <TemplateLayout key="new-purchase-order" viewMap={true}>
            <Loading key="loading-purchase" loading={isLoading} />
            <Paper
                variant="outlined"
                sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 } }}
            >
                <Box className="text-center">
                    <Icon name="list alternate outline" size="large" />
                </Box>
                <Typography
                    component="h1"
                    variant="h4"
                    align="center"
                    sx={{ mt: 1, mb: 7 }}
                >
                    {t("purchase_order")}
                </Typography>
                <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            variant="outlined"
                            type="date"
                            label={t("_date")}
                            name="creationDate"
                            value={formValues.creationDate}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            inputProps={{
                                min: getShortDate(false, "-"), // Establece la fecha mínima permitida como la fecha actual
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl key="trucker-select" fullWidth>
                            <InputLabel id="proveedor">{t("provider")}</InputLabel>
                            <Select
                                labelId="proveedor"
                                name="businessId"
                                value={formValues.businessId}
                                label={t("provider")}
                                onChange={onChangeProvider}
                            >
                                {socialEntities?.map((f) => (
                                    <MenuItem key={f._id} value={f._id}>
                                        {f.nombreCompleto || f.razonSocial}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label={t("_address")}
                            variant="outlined"
                            type="text"
                            name="address"
                            value={formValues.address}
                            // onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label={t("_locality")}
                            variant="outlined"
                            name="locality"
                            value={formValues.locality}
                            // onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label={t("id_country")}
                            variant="outlined"
                            type="text"
                            name="country"
                            value={formValues.country}
                            // error={countryError}
                            // onChange={handleInputChange}
                            // helperText={countryError ? "Este campo es obligatorio" : ""}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label={t("main_contact")}
                            variant="outlined"
                            type="text"
                            name="contact"
                            value={formValues.contact}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            type="text"
                            label={t("postal_code")}
                            name="zipCode"
                            value={formValues.zipCode}
                            // onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            variant="outlined"
                            type="text"
                            label={t("commercial_terms")}
                            name="commercialTerms"
                            value={formValues.commercialTerms}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />
                            }}
                            fullWidth
                        />
                    </Grid>
                </Grid>
                <NewWithdrawalRow
                    key={row._id}
                    row={row}
                    addNewWithdrawal={addNewSupply} />
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
                        {/* {depositsSuppliesOrder.map((row) => (
                            <NewWithdrawalRow
                                key={row._id}
                                row={row}
                                addNewWithdrawal={addNewSupply} />
                        ))} */}
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
                            onClick={() => onClickSave()}
                        >
                            Guardar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </TemplateLayout>
    )
}
