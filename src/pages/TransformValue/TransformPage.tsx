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
import { useAppSelector, useCrops, useDeposit, useForm, useStockMovement, useSupply, useTransformStock } from '../../hooks';
import { getShortDate } from '../../helpers/dates';
import { BorderContainer, NewSupplyCropRow, ItemRow, Loading, TableCellStyledBlack } from '../../components';
import { ColumnProps, TransformSupply } from '../../types';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Stock, StockItem, TipoStock } from '../../interfaces/stock';

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

    return (
        <ItemRow>
            <TableCell>
                {isCrop ? crop.descriptionEN : supply?.name}
            </TableCell>
            <TableCell>
                {deposit?.description}
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
                {isCrop ? "-" : supply?.unitMeasurement}
            </TableCell>
            {
                type === "origin" && (
                    <>
                        <TableCell align='center'>
                            {row.currentStock}
                        </TableCell>
                        <TableCell align='center'>
                            {/* {supply?.reservedStock} */}
                            -
                        </TableCell>
                        <TableCell align='center'>
                            {/* {(row.currentStock - supply.reservedStock)} */}
                            -
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
    const [originTransformValues, setOriginTransformValues] = useState<TransformSupply[]>([]);
    const [destinationTransformValue, setDestinationTransformValue] = useState<TransformSupply[]>([]);
    const [stockBySupplies, setStockBySupplies] = useState<StockItem[]>([]);
    const [stockByCrops, setStockByCrops] = useState<StockItem[]>([]);
    const { isLoading, supplies, getSupplies } = useSupply();
    const { dataCrops, getCrops } = useCrops();
    const { isLoading: depositLoading,
        deposits,
        getDeposits,
        getDepositsBySupplyId,
        getDepositsByCropId } = useDeposit();
    const { t } = useTranslation();
    const {
        operationDate,
        detail,
        handleInputChange,
        reset,
    } = useForm(initialStateTransform);
    const { isLoading: loadingTransform, getStock } = useStockMovement();
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

    const validateSupplyStock = async (newSupply: TransformSupply, type: "origin" | "destination" = "origin") => {
        try {
            const { supply, deposit } = newSupply;
            const supplyId = supply?._id || "";
            const depositId = deposit?._id || "";

            if (!supplyId && !depositId) return false;

            let currentStock = 0;
            const result = await getStock({
                id: supplyId,
                tipo: TipoStock.INSUMO,
                campaignId: newSupply.campaignId,
                depositId,
                location: newSupply.location,
                nroLot: newSupply.nroLot
            });
            currentStock = result ? result[0].currentStock : 0;

            if (type === "origin") {
                //Chequeamos que el insumo/deposito/ubicacion/lote tenga stock y que la cantidad sea menor al stock actual
                if (result && currentStock > 0) {
                    let supplyStock: StockItem = result[0];
                    supplyStock.currentStock = (Number(supplyStock.currentStock) - Number(newSupply.amount));
                    supplyStock.lastUpdate = new Date().toLocaleDateString();
                    if (supplyStock.currentStock <= 0) {
                        Swal.fire('Stock insuficiente.', 'La cantidad supera al stock actual.', 'error');
                        return false;
                    }
                    setStockBySupplies([{ ...supplyStock }, ...stockBySupplies]);
                    setOriginTransformValues([...originTransformValues,
                    {
                        ...newSupply,
                        amount: newSupply.amount,
                        currentStock: result[0].currentStock
                    }]);
                    return true;
                }
                else {
                    Swal.fire('Stock insuficiente.', 'No tiene stock del insumo.', 'error');
                    return false;
                }
            }
            else {
                if (originTransformValues.length === 0) {
                    Swal.fire('Insumos Origen', 'Debe haber al menos un Insumo.', 'error');
                    return false;
                }
                if (result) {
                    let supplyStock: Stock = result[0];
                    supplyStock.currentStock = (Number(supplyStock.currentStock) + Number(newSupply.amount));
                    supplyStock.lastUpdate = new Date().toLocaleDateString();
                    setStockBySupplies([{ ...supplyStock }, ...stockBySupplies]);
                    setDestinationTransformValue([...destinationTransformValue, { ...newSupply, amount: newSupply.amount }]);
                } else {
                    if (!user) throw new Error("User not found");
                    const newSupplyStock: Stock = {
                        id: supplyId,
                        tipo: TipoStock.INSUMO,
                        campaignId: newSupply.campaignId,
                        accountId: user.accountId,
                        depositId: depositId,
                        location: newSupply.location,
                        nroLot: newSupply.nroLot,
                        currentStock: Number(newSupply.amount),
                        fieldId: "",
                        fieldLot: "",
                        reservedStock: 0,
                        lastUpdate: new Date().toLocaleDateString(),

                    };
                    setStockBySupplies([...stockBySupplies, newSupplyStock]);
                    setDestinationTransformValue([...destinationTransformValue, newSupply]);
                }

            }
        } catch (error) {
            console.log('error', error);
            return false;
        }
    }

    const validateCropStock = async (newTransformValue: TransformSupply, type: "origin" | "destination" = "origin") => {
        try {
            const { deposit, crop } = newTransformValue;
            const cropId = crop?._id || "";
            const depositId = deposit?._id || "";

            if (!cropId && !depositId) return false;

            let currentStock = 0;
            const result = await getStock({
                id: cropId,
                tipo: TipoStock.CULTIVO,
                campaignId: newTransformValue.campaignId,
                depositId,
                location: newTransformValue.location,
                nroLot: newTransformValue.nroLot
            }
                // cropId, depositId, newTransformValue.location, newTransformValue.nroLot
            );
            currentStock = result ? result[0].currentStock : 0;

            if (type === "origin") {
                //Chequeamos que el insumo/deposito/ubicacion/lote tenga stock y que la cantidad sea menor al stock actual
                if (result && currentStock > 0) {
                    let cropStock: Stock = result[0];
                    cropStock.currentStock = (Number(cropStock.currentStock) - Number(newTransformValue.amount));
                    cropStock.lastUpdate = new Date().toLocaleDateString();
                    if (cropStock.currentStock <= 0) {
                        Swal.fire('Stock insuficiente.', 'La cantidad supera al stock actual.', 'error');
                        return false;
                    }
                    setStockByCrops([{ ...cropStock }, ...stockByCrops]);
                    setOriginTransformValues([...originTransformValues,
                    {
                        ...newTransformValue,
                        amount: newTransformValue.amount,
                        currentStock: result[0].currentStock
                    }]);
                    return true;
                }
                else {
                    Swal.fire('Stock insuficiente.', 'No tiene stock del cultivo.', 'error');
                    return false;
                }
            }
            else {
                if (originTransformValues.length === 0) {
                    Swal.fire('Insumos Origen', 'Debe haber al menos un cultivo.', 'error');
                    return false;
                }
                if (result) {
                    let cropStock: Stock = result[0];
                    cropStock.currentStock = (Number(cropStock.currentStock) + Number(newTransformValue.amount));
                    cropStock.lastUpdate = new Date().toLocaleDateString();
                    setStockByCrops([{ ...cropStock }, ...stockByCrops]);
                    setDestinationTransformValue([...destinationTransformValue, { ...newTransformValue, amount: newTransformValue.amount }]);
                } else {
                    if (!user) throw new Error("User not found");
                    const newCropStock: Stock = {
                        accountId: user.accountId,
                        depositId: depositId,
                        campaignId: newTransformValue.campaignId,
                        id: cropId,
                        tipo: TipoStock.CULTIVO,
                        fieldId: "",
                        fieldLot: "",
                        reservedStock: 0,
                        lastUpdate: new Date().toLocaleDateString(),
                        location: newTransformValue.location,
                        nroLot: newTransformValue.nroLot,
                        currentStock: Number(newTransformValue.amount),
                    };
                    setStockByCrops([...stockByCrops, newCropStock]);
                    setDestinationTransformValue([...destinationTransformValue, newTransformValue]);
                }

            }
        } catch (error) {
            console.log('error', error);
            return false;
        }
    }

    //ORIGIN
    const addSupplyOrCropOrigin = (newSupply: TransformSupply, isCrop: boolean) => {
        if (isCrop) validateCropStock(newSupply, "origin");
        else validateSupplyStock(newSupply, "origin");
    }

    const deleteRowOrigin = (id: string) => {
        const supplyToRemove = originTransformValues.find(s => s.id === id);
        if (!supplyToRemove) return;
        const { supply, crop, deposit, location, nroLot } = supplyToRemove;
        setOriginTransformValues(originTransformValues.filter(o => o.id !== id));
        if (crop) {
            setStockByCrops(stockByCrops.filter(s =>
                s.id !== crop?._id &&
                s.depositId !== deposit?._id &&
                s.location !== location &&
                s.nroLot !== nroLot));
        } else {
            setStockBySupplies(stockBySupplies.filter(s =>
                s.id !== supply?._id &&
                s.depositId !== deposit?._id &&
                s.location !== location &&
                s.nroLot !== nroLot));
        }
    }

    const addSupplyOrCropDestination = (newSupply: TransformSupply, isCrop: boolean) => {
        if (isCrop) validateCropStock(newSupply, "destination");
        else validateSupplyStock(newSupply, "destination");
    }

    const deleteRowDestination = (id: string) => {
        const supplyToRemove = destinationTransformValue.find(s => s.id === id);
        if (!supplyToRemove) return;
        const { supply, crop, deposit, location, nroLot } = supplyToRemove;
        setOriginTransformValues(destinationTransformValue.filter(o => o.id !== id));
        if (crop) {
            setStockByCrops(stockByCrops.filter(s =>
                s.id !== crop?._id &&
                s.depositId !== deposit?._id &&
                s.location !== location &&
                s.nroLot !== nroLot));
        } else {
            setStockBySupplies(stockBySupplies.filter(s =>
                s.id !== supply?._id &&
                s.depositId !== deposit?._id &&
                s.location !== location &&
                s.nroLot !== nroLot));
        }
    }

    const onClickCancel = () => {
        setOriginTransformValues([]);
        setDestinationTransformValue([]);
        setStockBySupplies([]);
        setStockByCrops([]);
        reset();
        navigate("/init/overview/value-transform");
    }

    const createTransform = async () => {
        await transformStock(
            originTransformValues,
            destinationTransformValue,
            stockBySupplies,
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
        getCrops();
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
                <TransformIcon />
                <Typography variant="h5" sx={{ ml: { sm: 2 } }}>
                    {t("transformation_added_value")}
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
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={3}>
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
                    </Grid>
                </Grid>
                <BorderContainer key="supplies-origin">
                    <Box sx={{ mb: 3, mt: 1 }}>
                        <NewSupplyCropRow
                            key="new-supply-to-origin"
                            crops={dataCrops}
                            supplies={supplies}
                            deposits={deposits}
                            disabledCrops={false}
                            showDueDate
                            addNewSupplyOrCultive={addSupplyOrCropOrigin}
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
                                {originTransformValues.map((originSupply) => (
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
                        <NewSupplyCropRow
                            key="new-supply-to-destination"
                            supplies={supplies}
                            deposits={deposits}
                            crops={dataCrops}
                            disabledCrops
                            showDueDate
                            addNewSupplyOrCultive={addSupplyOrCropDestination}
                            onChangeSupply={(_item) => {
                                getDeposits();
                                //Cada vez q cambie el insumo/cultivo en destino, volvemos a buscar los depositos para q pueda "ubicarlos" en sus depositos.
                            }}
                            onChangeCrop={(_item) => {
                                getDeposits();
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
                                {destinationTransformValue.map((originSupply) => (
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
                            disabled={destinationTransformValue.length === 0}
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
