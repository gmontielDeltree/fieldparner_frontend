import {
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { Campaign, Deposit, FormDataTransformValue, Supply, TransformSupply } from "../../types";
import { useForm, useStockMovement } from "../../hooks";
import { getShortDate } from "../../helpers/dates";
import { Loading } from "..";
import { StockItem, TipoStock } from '../../interfaces/stock';
import {
    AutocompleteCampaign,
    AutocompleteSupply,
} from "../Autocomplete";

interface Props {
    supplies?: Supply[];
    deposits: Deposit[];
    addNewItem: (item: StockItem | null, formValues: FormDataTransformValue) => void;
    onChangeSupply?: (item: Supply) => void;
}

const today = getShortDate();
const initialStateNewSupply = {
    campaignId: "",
    zafra: "",
    supplyId: "",
    cropId: "",
    depositId: "",
    location: "",
    nroLot: "",
    dueDate: today,
    amount: 0,
};

export const NewSupplyRow: React.FC<Props> = ({
    supplies = [],
    deposits,
    addNewItem,
    onChangeSupply,
}) => {
    const {
        depositId,
        location,
        nroLot,
        dueDate,
        amount,
        formulario,
        handleInputChange,
        reset,
        setFormulario,
    } = useForm(initialStateNewSupply);
    const [supplySelected, setSupplySelected] = useState<Supply | null>(null);
    const [depositSelected, setDepositSelected] = useState<Deposit | null>(null);
    const [campaignSelected, setCampaignSelected] = useState<Campaign | null>(
        null
    );
    const [itemStockSelected, setItemStockSelected] = useState<StockItem | null>(null);
    const { isLoading, getStock } = useStockMovement();

    // Determine which input fields to show
    const showDeposit = !!supplySelected;
    const showLocation = showDeposit && depositSelected;
    const showNroLot = !!supplySelected?.stockByLot && !!showLocation;
    const showDate = !!showNroLot;
    const showAmount = showLocation && location !== "";

    const onChangeDeposit = ({ target }: SelectChangeEvent) => {
        const { value } = target;
        const selected = deposits.find((d) => d._id === value);
        if (selected) {
            setFormulario((prevState) => ({ ...prevState, depositId: value }));
            setDepositSelected(selected);
        }
    };

    const onChangeLocation = ({ target }: SelectChangeEvent) => {
        const { value } = target;
        setFormulario((prevState) => ({ ...prevState, location: value }));
    };

    const onClickAdd = () => {
        if ((!supplySelected || !depositSelected)) {
            console.log('Missing supply or deposit');
            return;
        }
        addNewItem(itemStockSelected, formulario);
        reset();
        setCampaignSelected(null);
        setDepositSelected(null);
        setSupplySelected(null);
        setItemStockSelected(null);
    };

    // Auto-fetch stock to show "amount" if you want current stock
    useEffect(() => {
        const fetchStock = async (
            id: string,
            depositId: string,
            location: string,
            nroLot: string
        ) => {
            let newAmount = 0;
            const supplyStock = await getStock({
                id,
                tipo: TipoStock.INSUMO,
                campaignId: campaignSelected?.campaignId || "",
                depositId,
                location,
                nroLot,
            });
            if (supplyStock) {
                newAmount = supplyStock[0]?.currentStock || 0;
                setItemStockSelected(supplyStock[0]);
            }

            setFormulario((prev) => ({ ...prev, amount: newAmount }));
        };

        const id = supplySelected?._id;

        if (id && location && campaignSelected && depositSelected?._id) {
            fetchStock(id, depositSelected._id, location, nroLot);
        }
    }, [
        campaignSelected,
        depositSelected,
        supplySelected,
        location,
        nroLot,
    ]);

    return (
        <Grid
            key="row-new-supply"
            container
            alignItems="center"
            spacing={1}
            borderRadius={2}
            pb={1}
            sx={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)" }}
        >
            {isLoading && <Loading loading={true} />}

            {/* 1) Campaign */}
            <Grid item xs={12} sm={3}>
                <AutocompleteCampaign
                    value={campaignSelected}
                    onChange={(newValue) => {
                        setCampaignSelected(newValue);
                        setFormulario((prev) => ({
                            ...prev,
                            campaignId: newValue?.campaignId || "",
                        }));
                    }}
                />
            </Grid>

            {/* 3) If isCrop = true => show AutocompleteCrop, otherwise AutocompleteSupply */}
            <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                    <AutocompleteSupply
                        value={supplySelected}
                        options={supplies}
                        error={false}
                        onChange={(newValue) => {
                            if (newValue) {
                                onChangeSupply?.(newValue);
                                setSupplySelected(newValue);
                                setFormulario((prev) => ({
                                    ...prev,
                                    supplyId: newValue._id || "",
                                }));
                            }
                        }}
                        // MUI will compare by _id instead of label => no duplicates
                        isOptionEqualToValue={(option, val) => option._id === val?._id}
                    />
                </FormControl>
            </Grid>

            {/* 4) Deposit dropdown */}
            {showDeposit && (
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <InputLabel id="deposit">Depósito</InputLabel>
                        <Select
                            labelId="deposit"
                            name="origin"
                            value={depositId}
                            label="Depósito"
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
            )}

            {/* 5) Location dropdown */}
            {showLocation && (
                <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                        <InputLabel id="location">Ubicación</InputLabel>
                        <Select
                            labelId="location"
                            name="origin"
                            value={location}
                            label="Ubicación"
                            onChange={onChangeLocation}
                        >
                            {/* Use index in key to avoid collisions if same loc repeats */}
                            {depositSelected?.locations.map((loc, index) => (
                                <MenuItem key={`${loc}-${index}`} value={loc}>
                                    {loc}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            )}

            {/* 6) Nro Lote input */}
            {showNroLot && (
                <Grid item xs={12} sm={2}>
                    <TextField
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
                </Grid>
            )}

            {/* 7) Due Date input */}
            {showDate && (
                <Grid item xs={12} sm={2}>
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
                </Grid>
            )}

            {/* 8) Amount input */}
            {showAmount && (
                <Grid item xs={12} sm={3}>
                    <TextField
                        variant="outlined"
                        type="number"
                        label="Cantidad"
                        name="amount"
                        value={amount}
                        onChange={handleInputChange}
                        inputProps={{ maxLength: 15, min: 1 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {supplySelected?.unitMeasurement}
                                </InputAdornment>
                            ),
                        }}
                        fullWidth
                    />
                </Grid>
            )}

            {/* 9) Add Button */}
            <Grid item xs={12} sm={1} display="flex" justifyContent="center">
                <IconButton
                    color="success"
                    aria-label="add"
                    disabled={amount <= 0}
                    size="small"
                    onClick={onClickAdd}
                >
                    <AddIcon />
                </IconButton>
            </Grid>
        </Grid>
    );
};