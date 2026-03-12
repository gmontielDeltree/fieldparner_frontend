import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
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
import React, { useState } from "react";
import { Campaign, Crop, Deposit, FormDataTransformValue, Supply, } from "../../types";
import { useForm } from "../../hooks";
import { getShortDate } from "../../helpers/dates";
import { CropStockData, StockItem, TipoStock } from '../../interfaces/stock';
import {
  AutocompleteCampaign,
  AutocompleteCrop,
  AutocompleteSupply,
} from "../Autocomplete";

interface SupplyAndCropProps {
  listItemStock?: StockItem[];
  deposits: Deposit[];
  showDueDate: boolean;
  addNewItem: (item: StockItem, formValues: FormDataTransformValue) => void;
  onChangeSupply?: (item: Supply) => void;
  onChangeCrop?: (item: CropStockData) => void;
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

export const NewSupplyCropRow: React.FC<SupplyAndCropProps> = ({
  listItemStock = [],
  deposits,
  addNewItem: addNewSupplyOrCultive,
  onChangeSupply,
}) => {
  const {
    amount,
    formulario,
    reset,
    setFormulario,
  } = useForm<FormDataTransformValue>(initialStateNewSupply);
  const [isCrop, setIsCrop] = useState(false);
  const [supplySelected, setSupplySelected] = useState<Supply | null>(null);
  const [depositSelected, setDepositSelected] = useState<Deposit | null>(null);
  const [cropSelected, setCropSelected] = useState<Crop | null>(null);
  const [campaignSelected, setCampaignSelected] = useState<Campaign | null>(
    null
  );
  const [itemStockSelected, setItemStockSelected] = useState<StockItem | null>(null);
  const [availableZafras, setAvailableZafras] = useState<string[]>([]);


  const stockCrops = listItemStock
    .filter(s => s.tipo === TipoStock.CULTIVO);
  const stockSupplies = listItemStock.filter(s => s.tipo === TipoStock.INSUMO).map(s => ({ ...s, ...s.dataSupply })) as Supply[];
  const showAmount = !!itemStockSelected;

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
    if (!itemStockSelected) return;
    itemStockSelected.dataDeposit = deposits.find(d => d._id === itemStockSelected.depositId) || undefined;
    addNewSupplyOrCultive(itemStockSelected, formulario);
    reset();
    setItemStockSelected(null);
    setCampaignSelected(null);
  };

  const onChangeCheckIsCrop = (checked: boolean) => {
    setIsCrop(checked);
    if (!checked) {
      // isCrop = false => user wants an Insumo
      setSupplySelected(null);
    } else {
      // isCrop = true => user wants a Cultivo
      setCropSelected(null);
    }
  };


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
      {/* 1) Campaign */}
      <Grid item xs={12} sm={2}>
        <AutocompleteCampaign
          value={campaignSelected}
          onChange={(newValue) => {
            setCampaignSelected(newValue);
            setFormulario((prev) => ({
              ...prev,
              campaignId: newValue?.campaignId || "",
            }));
            const z = (newValue && (newValue as any).zafra)
              ? (Array.isArray((newValue as any).zafra) ? (newValue as any).zafra as string[] : [String((newValue as any).zafra)])
              : [];
            setAvailableZafras(z);
          }}
        />
      </Grid>

      {/* 1b) Zafra de la campaña (si existe) */}
      {(availableZafras.length > 0) && (
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <InputLabel id="zafra-label">Zafra</InputLabel>
            <Select
              labelId="zafra-label"
              id="zafra"
              name="zafra"
              value={formulario.zafra || ""}
              label="Zafra"
              onChange={(e) => setFormulario((prev) => ({ ...prev, zafra: e.target.value as string }))}
            >
              {availableZafras.map((z) => (
                <MenuItem key={z} value={z}>{z}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}

      {/* 2) Toggle between Crop vs. Supply */}
      <Grid item xs={12} sm={2}>
        <FormGroup row sx={{ justifyContent: "center", alignItems: "center" }}>
          {/* Show 'Cultivo' checkbox only if not forcibly disabled */}
          
            <FormControlLabel
              control={
                <Checkbox
                  name="crop"
                  checked={isCrop}
                  onChange={(e) => onChangeCheckIsCrop(e.target.checked)}
                />
              }
              label="Cultivo"
              labelPlacement="start"
            />
          
          <FormControlLabel
            control={
              <Checkbox
                name="supply"
                checked={!isCrop}
                onChange={(e) => onChangeCheckIsCrop(!e.target.checked)}
              />
            }
            label="Insumo"
            labelPlacement="start"
          />
        </FormGroup>
      </Grid>

      {/* 3) If isCrop = true => show AutocompleteCrop, otherwise AutocompleteSupply */}
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          {isCrop ? (
            <AutocompleteCrop
              value={itemStockSelected?.dataCrop || null}
              options={stockCrops.filter(s => s.campaignId === formulario.campaignId).map(s => ({ ...s, ...s.dataCrop })) as Crop[]}
              onChange={(newValue) => {
                if (newValue) {
                  console.log('newValue', newValue)
                  const stockFound = listItemStock.filter(s => s.tipo === TipoStock.CULTIVO).find(s => s.id === newValue._id);
                  // onChangeCrop?.(newValue);
                  setItemStockSelected(stockFound || null);
                  setFormulario((prev) => ({
                    ...prev,
                    cropId: newValue._id || "",
                    amount: stockFound?.currentStock || 0,
                  }));
                }
              }}
            />
          ) : (
            <AutocompleteSupply
              value={itemStockSelected?.dataSupply || null}
              options={stockSupplies}
              error={false}
              onChange={(newValue) => {
                if (newValue) {
                  const stockFound = listItemStock.filter(s => s.tipo === TipoStock.INSUMO).find(s => s.id === newValue._id);
                  onChangeSupply?.(newValue);
                  setItemStockSelected(stockFound || null);
                  setFormulario((prev) => ({
                    ...prev,
                    supplyId: newValue._id || "",
                    amount: stockFound?.currentStock || 0,
                  }));
                }
              }}
              // MUI will compare by _id instead of label => no duplicates
              isOptionEqualToValue={(option, val) => option._id === val?._id}
            />
          )}
        </FormControl>
      </Grid>

      {/* 8) Amount input */}
      {(showAmount) && (
        <Grid item xs={12} sm={2}>
          <TextField
            variant="outlined"
            type="number"
            label="Cantidad"
            name="amount"
            value={amount}
            onChange={(e) => {
              const value = Number(e.target.value);
              const maxValue = itemStockSelected ? itemStockSelected.currentStock : value;
              const safeValue = Math.max(0, Math.min(value || 0, maxValue));
              setFormulario(prev => ({ ...prev, amount: safeValue }));
            }}
            // onChange={handleInputChange}
            inputProps={{ maxLength: 15, min: 0 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {itemStockSelected?.dataSupply ? itemStockSelected.dataSupply.unitMeasurement : "KG"}
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