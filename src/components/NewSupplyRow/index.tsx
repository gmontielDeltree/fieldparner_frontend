import { Autocomplete, Checkbox, FormControl, FormControlLabel, FormGroup, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { Crop, Deposit, Supply, TransformSupply } from '../../types';
import { useForm, useStockMovement } from '../../hooks';
import uuid4 from 'uuid4';
import { getShortDate } from '../../helpers/dates';
import { Loading } from '..';


interface SupplyAndCropProps {
  supplies: Supply[],
  deposits: Deposit[],
  crops: Crop[],
  showDueDate: boolean,
  addNewSupplyOrCultive: (item: TransformSupply, isCultive: boolean) => void;
  onChangeSupply: (item: Supply) => void;
  onChangeCrop: (item: Crop) => void;
}

const today = getShortDate();
const initialStateNewSupply = {
  supplyId: "",
  cropId: "",
  depositId: "",
  location: "",
  nroLot: "",
  dueDate: today,
  amount: 0
};

export const NewSupplyCropRow: React.FC<SupplyAndCropProps> = ({
  supplies,
  crops,
  deposits,
  showDueDate = true,
  addNewSupplyOrCultive,
  onChangeSupply,
  onChangeCrop
}) => {

  const {
    depositId,
    location,
    nroLot,
    dueDate,
    amount,
    handleInputChange,
    reset,
    setFormulario,
  } = useForm(initialStateNewSupply);

  const [isCrop, setIsCrop] = useState(false);
  const [supplySelected, setSupplySelected] = useState<Supply | null>(null);
  const [depositSelected, setDepositSelected] = useState<Deposit | null>(null);
  const [cropSelected, setCropSelected] = useState<Crop | null>(null);
  const { isLoading, getStockBySupply, getStockByCrop } = useStockMovement();

  const showDeposit = !!supplySelected || !!cropSelected;
  const showLocation = showDeposit && depositSelected;
  const showNroLot = !!supplySelected?.stockByLot && !!showLocation;
  const showDate = !!showDueDate && !!showNroLot;
  const showAmount = showLocation && location !== "";

  const onChangeDeposit = ({ target }: SelectChangeEvent) => {
    const { value } = target;
    const depositSelected = deposits.find((deposit) => deposit._id === value);

    if (depositSelected) {
      setFormulario((prevState) => ({ ...prevState, depositId: value }));
      setDepositSelected(depositSelected);
    }
  };

  const onChangeLocation = ({ target }: SelectChangeEvent) => {
    const { value } = target;
    setFormulario((prevState) => ({ ...prevState, location: value }));
  };

  const onClickAdd = () => {

    if (isCrop && !cropSelected && !depositSelected) return;
    if (!isCrop && !supplySelected && !depositSelected) return;

    addNewSupplyOrCultive({
      id: uuid4(),
      deposit: depositSelected,
      supply: supplySelected,
      crop: cropSelected,
      location,
      nroLot,
      dueDate,
      amount: Number(amount),
      currentStock: 0,
    }, isCrop);
    reset();
  }

  const onChangeCheckIsCrop = (isCultive: boolean) => {
    setIsCrop(isCultive);
    if (!isCultive) setSupplySelected(null);
    else setCropSelected(null);
  }

  useEffect(() => {
    const getAmount = async (id: string, depositId: string, location: string, nroLot: string) => {
      let amount = 0;

      if (isCrop) {
        const cropStock = await getStockByCrop(id, depositId, location, nroLot);
        if (cropStock) amount = cropStock.currentStock;
      }
      else {
        const supplyStock = await getStockBySupply(id, depositId, location, nroLot);
        if (supplyStock) amount = supplyStock.currentStock;
      }

      setFormulario(prevState => ({ ...prevState, amount }));
    }
    const id = isCrop ? cropSelected?._id : supplySelected?._id;

    if (id && depositSelected?._id && location) {
      getAmount(id, depositSelected._id, location, nroLot);
    }

  }, [depositSelected, supplySelected, cropSelected, location, nroLot, isCrop])


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
      <Grid item xs={12} sm={3}>
        <FormGroup row sx={{ alignItems: "center" }}>
          <FormControlLabel
            key="yes"
            control={
              <Checkbox
                name="crop"
                checked={isCrop}
                onChange={() => onChangeCheckIsCrop(true)}
              />
            }
            label={"Cultivo"}
            labelPlacement="start"
          />
          <FormControlLabel
            control={
              <Checkbox
                name="supply"
                checked={!isCrop}
                onChange={() => onChangeCheckIsCrop(false)}
              />
            }
            label={"Insumo"}
            labelPlacement="start"
          />
        </FormGroup>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          {
            isCrop ? (
              <Autocomplete
                value={{ label: cropSelected?.descriptionEN || "", value: cropSelected?._id || "" }}
                onChange={(_event, newValue) => {
                  const value = newValue?.value || "null";
                  const cropSelected = crops.find((crop) => crop._id === value);
                  if (cropSelected && cropSelected._id) {
                    onChangeCrop(cropSelected); //Evento donde vamos a ir a buscar los depositos de ese cultivo
                    setFormulario((prevState) => ({
                      ...prevState,
                      cropId: value,
                    }));
                    setCropSelected(cropSelected);
                  }
                }}
                options={crops.map((option) => ({ label: option.descriptionEN, value: option._id || "" }))}
                getOptionLabel={(option) => option.label}
                renderInput={(params) => (
                  <TextField {...params} label={"Cultivo"} variant="outlined" />
                )}
                fullWidth
                ListboxProps={{
                  style: {
                    maxHeight: 248,
                    overflow: "auto",
                  },
                }}
              />
            ) : (
              <Autocomplete
                value={{ label: supplySelected?.name || "", value: supplySelected?._id || "" }}
                onChange={(_event, newValue) => {
                  const value = newValue?.value || "null";
                  const supplySelected = supplies.find((supply) => supply._id === value);
                  if (supplySelected && supplySelected._id) {
                    onChangeSupply(supplySelected); //Evento donde vamos a ir a buscar los depositos de ese insumo
                    setFormulario((prevState) => ({
                      ...prevState,
                      supplyId: value,
                    }));
                    setSupplySelected(supplySelected);
                  }
                }}
                options={supplies.map((option) => ({ label: option.name, value: option._id || "" }))}
                getOptionLabel={(option) => option.label}
                renderInput={(params) => (
                  <TextField {...params} label={"Insumo"} variant="outlined" />
                )}
                fullWidth
                ListboxProps={{
                  style: {
                    maxHeight: 248,
                    overflow: "auto",
                  },
                }}
              />
            )
          }
        </FormControl>
      </Grid>
      {
        showDeposit && (
          <Grid item xs={12} sm={4}>
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
        )
      }
      {
        showLocation && (
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
        )
      }
      {showNroLot && (
        <Grid item xs={12} sm={2}>
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
        </Grid>
      )}
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
              endAdornment: <InputAdornment position="end" >{supplySelected?.unitMeasurement}</InputAdornment>,
            }}
            fullWidth
          />
        </Grid>
      )}
      <Grid item xs={12} sm={1} display="flex" justifyContent="center">
        <IconButton
          color="success"
          aria-label="add"
          disabled={amount <= 0}
          size="small"
          onClick={() => onClickAdd()}
        >
          <AddIcon />
        </IconButton>
      </Grid>
    </Grid>
  )
}

