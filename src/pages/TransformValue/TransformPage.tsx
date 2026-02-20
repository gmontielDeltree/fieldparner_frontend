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
    Delete as DeleteIcon
} from '@mui/icons-material'
import React, { useEffect, useState } from 'react';
import { useAppSelector, useDeposit, useForm, useStockMovement, useSupply, useTransformStock } from '../../hooks';
import { getShortDate } from '../../helpers/dates';
import { BorderContainer, NewSupplyCropRow, ItemRow, Loading, TableCellStyledBlack, NewSupplyRow } from '../../components';
import { ColumnProps, FormDataTransformValue, TransformSupply } from '../../types';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CropStockData, ListStockCropOrSupply, Stock, StockItem, TipoStock } from '../../interfaces/stock';


const today = getShortDate();

type SupplyRowProps = {
    row: TransformSupply;
    // stockOfSupply: StockByLot;
    // stockOfCrop: StockCrop;
    type: "origin" | "destination";
    deleteRow: (id: string) => void;
}

const SupplyRow: React.FC<SupplyRowProps> = ({ row, type, deleteRow }) => {
    const { supply, crop, deposit } = row;
    const isCrop = !!crop;
    console.log('row', row)
    return (
        <ItemRow>
            <TableCell>
                {isCrop ? crop.descriptionEN : supply?.name}
            </TableCell>
            <TableCell>
                {deposit?.description}
            </TableCell>
            <TableCell>
                {row.location || deposit?.locations[0] || "-"}
            </TableCell>
            <TableCell>
                {row.nroLot || "-"}
            </TableCell>
            <TableCell>
                {row.dueDate || "-"}
            </TableCell>
            <TableCell align='center'>
                {isCrop ? "-" : supply?.unitMeasurement}
            </TableCell>
            {
                type === "origin" && (
                    <>
                        <TableCell align='center'>
                            {row.currentStock}
                        </TableCell>
                        <TableCell align='center'>

                            {row.pending}
                        </TableCell>
                        <TableCell align='center'>
                            {row.available}
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
    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.auth);
    const [itemsOrigin, setItemsOrigin] = useState<TransformSupply[]>([]);
    const [itemsDestination, setItemsDestination] = useState<TransformSupply[]>([]);
    const [currentStockCropOrSupplies, setCurrentStockCropOrSupplies] = useState<ListStockCropOrSupply | null>({ stockByCrops: [], stockBySupplies: [] });

    const { isLoading, supplies, stockBySupplies: dataStockCropOrSupply, getSupplies, getStockData } = useSupply();

    const { isLoading: depositLoading,
        deposits,
        getDeposits,
        getDepositsBySupplyId,
    } = useDeposit();
    const { t } = useTranslation();
    const {
        operationDate,
        detail,
        handleInputChange,
        reset,
    } = useForm(initialStateTransform);
    const { isLoading: loadingTransform } = useStockMovement();
    const { transformStock } = useTransformStock();

    const originColumns: ColumnProps[] = [
        { text: t("supply_crop"), align: "left" },
        { text: t("_warehouse"), align: "left" },
        { text: t("id_location"), align: "left" },
        { text: t("lot_number"), align: "left" },
        { text: t("expiration_date"), align: "left" },
        { text: "UM", align: "center" },
        { text: t("current_stock"), align: "left" },
        { text: t("reserved_stock"), align: "left" },
        { text: t("available_stock"), align: "left" },
        { text: t("quantity_to_use"), align: "center" },
    ];
    const destinationColumns: ColumnProps[] = [
        { text: t("_supplies"), align: "left" },
        { text: t("_warehouse"), align: "left" },
        { text: t("id_location"), align: "left" },
        { text: t("lot_number"), align: "left" },
        { text: t("expiration_date"), align: "left" },
        { text: "UM", align: "center" },
        { text: t("quantity_to_create"), align: "center" },
        { text: t("hours_per_employee"), align: "center" },
    ];


    //ORIGIN
    const addSupplyOrCropOrigin = (itemSelected: StockItem, formValues: FormDataTransformValue) => {

        if (itemSelected.tipo === TipoStock.INSUMO) {
            if (itemsOrigin?.some(item => item?.supply?._id === itemSelected.id)) {
                Swal.fire('Item ya agregado', 'El insumo ya fue agregado en la lista de origen.', 'error');
                return;
            }
            let supplyStock = {
                ...itemSelected,
                currentStock: (Number(itemSelected.currentStock) - Number(formValues.amount)),
            };
            delete supplyStock.dataCampaign;
            delete supplyStock.dataField;
            delete supplyStock.dataCrop;
            delete supplyStock.dataDeposit;
            delete supplyStock.dataSupply;

            if (currentStockCropOrSupplies) {
                setCurrentStockCropOrSupplies({
                    ...currentStockCropOrSupplies,
                    stockBySupplies: [...currentStockCropOrSupplies?.stockBySupplies, supplyStock]
                });
                setItemsOrigin([...itemsOrigin, {
                    id: supplyStock.id,
                    campaignId: formValues.campaignId,
                    zafra: "",
                    deposit: itemSelected.dataDeposit,
                    supply: itemSelected.dataSupply,
                    crop: null,
                    location: formValues.location || itemSelected.location,
                    nroLot: formValues.nroLot || itemSelected.nroLot,
                    dueDate: formValues.dueDate,
                    amount: Number(formValues.amount),
                    currentStock: itemSelected.currentStock,
                    available: (Number(itemSelected.currentStock) - Number(formValues.amount)),
                    pending: itemSelected.reservedStock || 0,
                }]);
            }
        } else {
            if (itemsOrigin?.some(item => item?.crop?._id === itemSelected.id)) {
                Swal.fire('Item ya agregado', 'El cultivo ya fue agregado en la lista de origen.', 'error');
                return;
            }

            if (currentStockCropOrSupplies) {
                let cropStock = {
                    _rev: itemSelected._rev,
                    _id: itemSelected._id || "",
                    accountId: itemSelected.accountId || "",
                    campaignId: itemSelected.campaignId || "",
                    cropId: itemSelected.dataCrop?._id || "",
                    currentStock: (Number(itemSelected.currentStock) - Number(formValues.amount)),
                    committedStock: itemSelected.reservedStock || 0,
                    deliveredStock: itemSelected.reservedStock || 0,
                    lastUpdate: today,
                    available: (Number(itemSelected.currentStock) - Number(formValues.amount)) - (itemSelected.reservedStock || 0),
                    pending: (itemSelected.reservedStock || 0) - (itemSelected.reservedStock || 0),
                    zafra: formValues.zafra,
                    campaign: formValues.campaignId,
                } as CropStockData;
                setCurrentStockCropOrSupplies({
                    ...currentStockCropOrSupplies,
                    stockByCrops: [...currentStockCropOrSupplies?.stockByCrops, { ...cropStock }]
                });
                setItemsOrigin([...itemsOrigin, {
                    id: cropStock._id,
                    campaignId: formValues.campaignId,
                    zafra: formValues.zafra,
                    deposit: null,
                    supply: null,
                    crop: itemSelected.dataCrop || null,
                    location: formValues.location || itemSelected.location,
                    nroLot: formValues.nroLot || itemSelected.nroLot,
                    dueDate: formValues.dueDate,
                    amount: Number(formValues.amount),
                    currentStock: cropStock.currentStock,
                    available: cropStock.available,
                    pending: cropStock.pending
                }]);
            }
        }
    }

    const deleteRowOrigin = (id: string) => {
        const itemRemove = itemsOrigin.find(s => s.id === id);
        if (!itemRemove) return;

        if (currentStockCropOrSupplies)
            setCurrentStockCropOrSupplies({
                ...currentStockCropOrSupplies,
                stockBySupplies: currentStockCropOrSupplies?.stockBySupplies.filter(s => s.id !== id),
                stockByCrops: currentStockCropOrSupplies?.stockByCrops.filter(s => s._id !== id)
            });
        setItemsOrigin(itemsOrigin.filter(o => o.id !== id));
    }

    const addSupplyDestination = (itemSelected: StockItem | null, formValues: FormDataTransformValue) => {
        let supplyStock: Stock;

        //Stock existente, lo actualizamos
        if (itemSelected) {
            supplyStock = { ...itemSelected };
            supplyStock.currentStock = (Number(supplyStock.currentStock) + Number(formValues.amount));
            supplyStock.lastUpdate = new Date().toLocaleDateString();

        } else {
            //Stock nuevo
            supplyStock = {
                id: formValues.supplyId,
                tipo: TipoStock.INSUMO,
                campaignId: formValues.campaignId,
                accountId: user?.accountId || "",
                depositId: formValues.depositId,
                location: formValues.location || "",
                nroLot: formValues.nroLot || "",
                currentStock: Number(formValues.amount),
                fieldId: "",
                fieldLot: "",
                reservedStock: 0,
                lastUpdate: new Date().toLocaleDateString(),
            };
        }
        if (currentStockCropOrSupplies)
            setCurrentStockCropOrSupplies({ ...currentStockCropOrSupplies, stockBySupplies: [...currentStockCropOrSupplies?.stockBySupplies, supplyStock] });

        setItemsDestination([...itemsDestination, {
            id: supplyStock.id,
            campaignId: formValues.campaignId,
            zafra: "",
            deposit: deposits.find(d => d._id === formValues.depositId) || null,
            supply: supplies.find(s => s._id === formValues.supplyId) || null,
            crop: null,
            location: "",
            nroLot: "",
            dueDate: formValues.dueDate,
            amount: Number(formValues.amount),
            currentStock: itemSelected?.currentStock || 0,
            available: (Number(itemSelected?.currentStock || 0) - Number(formValues.amount)),
            pending: itemSelected?.reservedStock || 0,
        }]);
    }

    const deleteRowDestination = (id: string) => {
        const itemRemove = itemsDestination.find(s => s.id === id);
        if (!itemRemove) return;

        if (currentStockCropOrSupplies)
            setCurrentStockCropOrSupplies({
                ...currentStockCropOrSupplies,
                stockBySupplies: currentStockCropOrSupplies?.stockBySupplies.filter(s => s.id !== id),
                stockByCrops: currentStockCropOrSupplies?.stockByCrops.filter(s => s._id !== id)
            });
        setItemsDestination(itemsDestination.filter(o => o.id !== id));
    }

    const onClickCancel = () => {
        setItemsOrigin([]);
        setItemsDestination([]);
        setCurrentStockCropOrSupplies({ stockByCrops: [], stockBySupplies: [] });
        reset();
        navigate("/init/overview/value-transform");
    }

    const createTransform = async () => {
        if (!currentStockCropOrSupplies) return;
        await transformStock(
            itemsOrigin,
            itemsDestination,
            currentStockCropOrSupplies,
            detail,
            operationDate
        );
        reset();
        navigate("/init/overview/value-transform");
    }

    const saveTransformStock = () => createTransform();

    useEffect(() => {
        getSupplies();
        getDeposits();
        getStockData();
    }, [])

    return (
        <Box ml={2}>
            {(isLoading || loadingTransform || depositLoading) && <Loading loading={true} />}
            <Box
                component="div"
                display="flex"
                alignItems="center"
                sx={{ ml: { sm: 2 }, pt: 3 }}
            >
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
                    {t("source_supplies")}
                </Typography>
                <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            variant="outlined"
                            type="date"
                            label={t("operation_date")}
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
                    <Grid item xs={12} sm={9}>
                        <TextField
                            variant="outlined"
                            type="text"
                            label={t("_reason")}
                            name="detail"
                            value={detail}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" />,
                            }}
                            fullWidth
                        />
                    </Grid>
                    {/* <Grid item xs={12} sm={3}>
                        <TextField
                            variant="outlined"
                            type="text"
                            label="Zafra"
                            name="zafra"
                            onChange={() => { }}
                            placeholder={t('select_campaign_first')}
                            fullWidth
                            disabled
                        />
                    </Grid> */}
                </Grid>
                <BorderContainer key="supplies-origin">
                    <Box sx={{ mb: 3, mt: 1 }}>
                        <NewSupplyCropRow
                            key="new-supply-to-origin"
                            listItemStock={dataStockCropOrSupply}
                            deposits={deposits}
                            showDueDate
                            addNewItem={addSupplyOrCropOrigin}
                            onChangeSupply={(item) => {
                                if (!item._id) return;
                                getDepositsBySupplyId(item._id);
                            }}
                        />
                    </Box>
                    <TableContainer
                        key="table-supply-origin"
                        sx={{
                            minHeight: "120px",
                            maxHeight: "440",
                            overflow: "scroll",
                            // mb: 5
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
                                {itemsOrigin.map((originSupply) => (
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

                </BorderContainer>
                <Typography variant="h5" sx={{ my: 3 }}>
                    {t("new_supply_destination")}
                </Typography>
                <BorderContainer key="supplies-destination">
                    <Box sx={{ mb: 3, mt: 1 }}>
                        <NewSupplyRow
                            key="new-supply-to-destination"
                            supplies={supplies}
                            deposits={deposits}
                            addNewItem={addSupplyDestination}
                            onChangeSupply={(_item) => {
                                getDeposits();
                                //Cada vez q cambie el insumo/cultivo en destino, volvemos a buscar los depositos para q pueda "ubicarlos" en sus depositos.
                            }}

                        />
                    </Box>
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
                                {itemsDestination.map((originSupply) => (
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
                </BorderContainer>
                <Grid container justifyContent="end" spacing={3} mt={2}>
                    <Grid item xs={12} sm={2}>
                        <Button
                            variant='contained'
                            color="inherit"
                            onClick={() => onClickCancel()}
                            fullWidth>
                            {t("id_cancel")}
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            variant="contained"
                            disabled={itemsDestination.length === 0}
                            color="success"
                            onClick={() => saveTransformStock()}
                            fullWidth>
                            {t("_save")}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    )

};
