
import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
    useBusiness,
    useForm,
    useSupply,
    userPurchaseOrder,
} from '../hooks';
import { DataTable, ItemRow, Loading, TableCellStyled, TemplateLayout } from '../components';
import { Box, Button, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, TableContainer, TextField, Typography } from '@mui/material';
import {
    Add as AddIcon,
    Close as CloseIcon,
    Edit as EditIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { Icon } from 'semantic-ui-react';
import { ColumnProps, DetailPurchaseOrderItem, PurchaseOrder, Supply } from '../types';

import { getShortDate } from '../helpers/dates';
import { useTranslation } from 'react-i18next';
import uuid4 from 'uuid4';
import { Helper } from '../helpers/helper';
import { styled } from '@mui/material/styles';

const GridStyled = styled(Grid)`
    border-bottom: 1px solid;
`;



interface NewOrderItemRowProps {
    supplies: Supply[];
    addNewItem: (newItem: DetailPurchaseOrderItem) => void;
}

export const NewOrderRow = ({ supplies, addNewItem }: NewOrderItemRowProps) => {

    const {
        formulario: formValues,
        unitPrice,
        supplyAmount,
        handleInputChange,
        setFormulario: setFormValues,
        reset,
    } = useForm<DetailPurchaseOrderItem>({
        id: uuid4(),
        nroOrder: "",
        supplyAmount: 0,
        supplyId: "",
        unitMeasurement: "",
        unitPrice: 0,
        supply: null
    });

    //TODO: continuar aca agregando items en la orden
    const onClickPlus = () => {
        if (!formValues.supply?._id) throw new Error("Error: item not found.");
        addNewItem({
            ...formValues,
            supplyAmount: Number(supplyAmount),
            unitPrice: Number(unitPrice)
        });
        reset();
    }

    const handleOnChangeSupply = ({ target }: SelectChangeEvent) => {
        const supplyId = target.value;
        const supplyDto = supplies.find(x => x._id === supplyId);

        if (supplyDto)
            setFormValues({
                ...formValues,
                supplyId,
                supply: supplyDto,
                unitMeasurement: supplyDto.unitMeasurement
            });
    }

    return (
        <Grid
            key="row-new-supply"
            container
            alignItems="center"
            spacing={1}
            borderRadius={1}
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
                <Typography variant='body2'>
                    {formValues.unitMeasurement}
                </Typography>
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
            <Grid item xs={12} sm={2}>
                <TextField
                    variant="outlined"
                    type="number"
                    label="Precio Unitario"
                    name="unitPrice"
                    value={formValues.unitPrice}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 15, min: 1 }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={2}>
                <TextField
                    variant="outlined"
                    type="text"
                    label="Precio Total"
                    disabled
                    // name="supplyAmount"
                    value={Helper.parseDecimalPointToComaWithCurrency((Number(supplyAmount) * Number(unitPrice)), "$", 2)}
                    // onChange={handleInputChange}
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

interface EditOrderRowProps {
    order: DetailPurchaseOrderItem;
    editRowItem: (newItem: DetailPurchaseOrderItem) => void;
    deleteRowItem: (newItem: DetailPurchaseOrderItem) => void;
}
export const EditOrderRow = ({
    order,
    editRowItem,
    deleteRowItem
}: EditOrderRowProps) => {

    const { formulario: formValues, supplyAmount, unitPrice, handleInputChange } = useForm<DetailPurchaseOrderItem>({ ...order });
    const totalPrice = (Number(order.unitPrice) * Number(order.supplyAmount));
    const [isEdit, setIsEdit] = useState(false);

    const onClickEdit = () => {
        setIsEdit(true);
    }
    const handleSaveEdit = () => {
        editRowItem({
            ...formValues,
            supplyAmount: Number(supplyAmount),
            unitPrice: Number(unitPrice)
        });
        setIsEdit(false);
    }
    const handleCancelEdit = () => {
        setIsEdit(false);
    }
    return (
        <ItemRow key={order._id}>
            <TableCellStyled align="left">{order.supply?.name} </TableCellStyled>
            <TableCellStyled align="center">{order.supply?.unitMeasurement}</TableCellStyled>
            <TableCellStyled align='center'>
                {
                    isEdit ? (
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
                    ) : order.supplyAmount
                }
            </TableCellStyled>
            <TableCellStyled align='center'>{
                isEdit ? (
                    <TextField
                        variant="outlined"
                        type="number"
                        label="Precio Unitario"
                        name="unitPrice"
                        value={formValues.unitPrice}
                        onChange={handleInputChange}
                        inputProps={{ maxLength: 15, min: 1 }}
                        fullWidth
                    />
                ) : Helper.parseDecimalPointToComaWithCurrency(order.unitPrice, "$", 2)
            }</TableCellStyled>
            <TableCellStyled align='center'>{Helper.parseDecimalPointToComaWithCurrency(totalPrice, "$", 2)}</TableCellStyled>
            <TableCellStyled align='center'>
                {
                    isEdit ? (
                        <>
                            <IconButton
                                color="primary"
                                aria-label="save"
                                onClick={handleSaveEdit}
                            >
                                <SaveIcon />
                            </IconButton>
                            <IconButton
                                color="secondary"
                                aria-label="cancel"
                                onClick={handleCancelEdit}
                            >
                                <CloseIcon />
                            </IconButton>
                        </>
                    ) :
                        <>
                            <IconButton
                                onClick={onClickEdit}
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => deleteRowItem(order)}
                                style={{ fontSize: '1rem' }}
                            >
                                <Icon name="trash alternate" />
                            </IconButton>
                        </>
                }
            </TableCellStyled>
        </ItemRow>
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
    businessLogo: ""
}

//TODO: Chequear el tipo de moneda

export const PurchaseOrderPage: React.FC = () => {

    const { order } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    // const { withdrawalOrderActive } = useAppSelector(state => state.order);
    const [listItemToPurchase, setListItemToPurchase] = useState<DetailPurchaseOrderItem[]>([]);
    const { businesses: socialEntities, getBusinesses } = useBusiness();
    const { supplies, getSupplies } = useSupply();
    const {
        isLoading,
        createPurchaseOrder,
        getPurchaseOrderByOrder,
        updatePurchaseOrder
    } = userPurchaseOrder();

    const {
        formulario: formValues,
        taxPercentage,
        anotherPercentage,
        handleInputChange,
        setFormulario: setFormValues,
    } = useForm(initialForm);

    const subtotal = listItemToPurchase.reduce((accumulator, { supplyAmount, unitPrice }) =>
        accumulator + (Number(supplyAmount) * Number(unitPrice)), 0);
    const taxValue = (Number(taxPercentage) * subtotal) / 100;
    const otherValue = (Number(anotherPercentage) * subtotal) / 100;
    const totalValue = (subtotal + taxValue + otherValue);

    const columnsDepositSupply: ColumnProps[] = React.useMemo(() => {
        return [
            { text: t("_supply"), align: "center" },
            { text: "UM", align: "center" },
            { text: t("_quantity"), align: "center" },
            { text: t("_unit_price"), align: "center" },
            { text: t("total_price"), align: "center" },
            { text: "", align: "center" },
        ]
    }, [t]);

    const onClickCancel = () => navigate("/init/overview/purchase-order");


    const deleteRowSupply = (item: DetailPurchaseOrderItem) => {
        setListItemToPurchase(listItemToPurchase.filter(x => x.id !== item.id));
    }

    const editRowSupply = (item: DetailPurchaseOrderItem) => {
        setListItemToPurchase(listItemToPurchase.map(x => x.id === item.id ? item : x));
    }

    const onClickSave = async () => {
        if (listItemToPurchase.length) {
            const details = listItemToPurchase.map(x => {
                const { supply, ...dto } = x;
                return { ...dto };
            });
            const order: PurchaseOrder = {
                ...formValues,
                subtotal,
                taxValue,
                anotherValue: otherValue,
                totalValue
            }
            
            if (formValues.nroOrder === "")
                await createPurchaseOrder(order, details);
            else
                await updatePurchaseOrder(order, details);

            navigate("/init/overview/purchase-order");
        }
    }

    const onChangeProvider = ({ target }: SelectChangeEvent) => {
        const businessId = target.value;
        const providerFound = socialEntities.find(x => x._id === businessId);

        if (providerFound) {
            setFormValues({
                ...formValues,
                businessId,
                businessName: providerFound.nombreCompleto || providerFound.razonSocial || "-",
                country: providerFound.pais,
                zipCode: providerFound.cp,
                locality: providerFound.localidad,
                address: providerFound.domicilio,
                businessLogo: providerFound.logoBusiness || ".",
                contact: providerFound.contactoPrincipal || "-"
            });
        }
    }

    const addNewSupply = (item: DetailPurchaseOrderItem) => {
        setListItemToPurchase(prevState => [item, ...prevState]);
    }

    useEffect(() => {
        getSupplies();
        getBusinesses();
    }, [])

    useEffect(() => {
        const getPurchaseOrder = async (order: string) => {
            getPurchaseOrderByOrder(order).then(result => {
                if (result) {
                    setFormValues(result.purchaseOrder);
                    setListItemToPurchase(result.details)
                }
            }).catch(error => {
                console.log('error', error)
                setFormValues(initialForm);
            })
        }

        if (order)
            getPurchaseOrder(order);
        else
            setFormValues(initialForm);

    }, [order])



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
                    {formValues.nroOrder === "" ? t("new_famale") : t("icon_edit")} {t("purchase_order")}
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
                <NewOrderRow
                    key="new-item-row"
                    supplies={supplies}
                    addNewItem={addNewSupply} />
                <TableContainer
                    key="purchase-orders"
                    sx={{
                        minHeight: "120px",
                        maxHeight: "440",
                        overflow: "scroll",
                        mb: 3,
                        mt: 2
                    }}
                    component={Paper}
                >
                    <DataTable
                        key="datatable-orders"
                        columns={columnsDepositSupply}
                        isLoading={isLoading}
                    >
                        {
                            listItemToPurchase.map(item => (
                                <EditOrderRow
                                    key={`${item._id}-${item.supplyId}`}
                                    order={item}
                                    deleteRowItem={deleteRowSupply}
                                    editRowItem={editRowSupply} />
                            ))
                        }
                    </DataTable>
                </TableContainer>
                <Grid
                    container
                    alignItems="center"
                    justifyContent="flex-end"
                    sx={{ mt: 2, mb: 1 }}>
                    <Grid spacing={1} container width="45%" alignItems="center">
                        <GridStyled item xs={4}>
                            <Typography variant='body1' textAlign="start">Subtotales:</Typography>
                        </GridStyled>
                        <GridStyled item xs={8}>
                            <Typography variant='body1' textAlign="end"> {Helper.parseDecimalPointToComaWithCurrency(subtotal, "$", 2)}</Typography>
                        </GridStyled>
                        <GridStyled item xs={4}>
                            <Typography variant='body1' display="inline-block" textAlign="start">Impuesto </Typography>
                        </GridStyled>
                        <GridStyled item xs={3}>
                            <TextField
                                variant="standard"
                                type="number"
                                name="taxPercentage"
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">%</InputAdornment>,
                                }}
                                value={formValues.taxPercentage}
                                onChange={handleInputChange}
                                inputProps={{ maxLength: 15, min: 1 }}
                            />
                        </GridStyled>
                        <GridStyled item xs={5}>
                            <Typography variant='body1' textAlign="end" >{Helper.parseDecimalPointToComaWithCurrency(taxValue, "$", 2)}</Typography>
                        </GridStyled>
                        <GridStyled item xs={4}>
                            <Typography variant='body1' textAlign="start">Otros </Typography>
                        </GridStyled>
                        <GridStyled item xs={3}>
                            <TextField
                                variant="standard"
                                type="number"
                                name="anotherPercentage"
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">%</InputAdornment>,
                                }}
                                value={formValues.anotherPercentage}
                                onChange={handleInputChange}
                            />
                        </GridStyled>
                        <GridStyled item xs={5}>
                            <Typography variant='body1' textAlign="end" >{Helper.parseDecimalPointToComaWithCurrency(otherValue, "$", 2)}</Typography>
                        </GridStyled>
                        <GridStyled item xs={4}>
                            <Typography variant='body1' textAlign="start">Total:</Typography>
                        </GridStyled>
                        <GridStyled item xs={8}>
                            <Typography variant='body1' textAlign="end">{Helper.parseDecimalPointToComaWithCurrency(totalValue, "$", 2)}</Typography>
                        </GridStyled>
                    </Grid>
                </Grid>
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
