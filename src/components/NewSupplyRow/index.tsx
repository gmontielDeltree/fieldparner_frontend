import { FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { Deposit, Supply, TransformSupply } from '../../types';
import { useForm, useStockMovement } from '../../hooks';
import uuid4 from 'uuid4';
import { getShortDate } from '../../helpers/dates';
import { Loading } from '..';


interface NewSupplyRowProps {
  supplies: Supply[],
  deposits: Deposit[],
  showDueDate: boolean,
  addNewSupply: (item: TransformSupply) => void;
  onChangeSupply: (item: Supply) => void;
}

const today = getShortDate();
const initialStateNewSupply = {
  supplyId: "",
  depositId: "",
  location: "",
  nroLot: "",
  dueDate: today,
  amount: 0
};

export const NewSupplyRow: React.FC<NewSupplyRowProps> = ({
  supplies,
  deposits,
  addNewSupply,
  showDueDate = true,
  onChangeSupply
}) => {

  const {
    supplyId,
    depositId,
    location,
    nroLot,
    dueDate,
    amount,
    handleInputChange,
    reset,
    setFormulario,
  } = useForm(initialStateNewSupply);
  const [supplySelected, setSupplySelected] = useState<Supply | null>(null);
  const [depositSelected, setDepositSelected] = useState<Deposit | null>(null);
  const { isLoading, getStock } = useStockMovement();

  const handleOnChangeSupply = ({ target }: SelectChangeEvent) => {
    const { value } = target;
    const supplySelected = supplies.find((supply) => supply._id === value);
    if (supplySelected && supplySelected._id) {
      onChangeSupply(supplySelected); //Evento donde vamos a ir a buscar los depositos de ese insumo
      setFormulario((prevState) => ({
        ...prevState,
        supplyId: value,
      }));
      setSupplySelected(supplySelected);
    }
  };

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

  const handleAddNewSupply = () => {
    if (!depositSelected || !supplySelected) return;
    addNewSupply({
      id: uuid4(),
      deposit: depositSelected,
      supply: supplySelected,
      location,
      nroLot,
      dueDate,
      amount: Number(amount),
      currentStock: 0
    });
    reset();
  }

  useEffect(() => {
    const getAmount = async (supplyId: string, depositId: string, location: string, nroLot: string) => {
      const supplyStock = await getStock(supplyId, depositId, location, nroLot);
      
      if (supplyStock)
        setFormulario(prevState => ({ ...prevState, amount: supplyStock.currentStock }));
    }

    if (supplySelected?._id && depositSelected?._id && location) {
      getAmount(supplySelected._id, depositSelected._id, location, nroLot);
    }

  }, [depositSelected, supplySelected, location, nroLot])


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
      {isLoading && <Loading loading={true} />}
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <InputLabel id="supply">Insumo</InputLabel>
          <Select
            key="select-supply-movement"
            labelId="supply"
            value={supplyId}
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
        {
          supplySelected && (
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
          )
        }
      </Grid>
      <Grid item xs={12} sm={2}>
        {
          supplySelected && (
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
          )
        }
      </Grid>
      {
        (supplySelected && supplySelected.stockByLot && depositSelected)
        && (
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
        )
      }
      {
        (supplySelected && supplySelected.stockByLot && depositSelected && showDueDate)
        && (
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
        )
      }
      <Grid item xs={12} sm={3}>
        {
          (supplySelected && depositSelected && location) && (
            <TextField
              variant="outlined"
              type="number"
              label="Cantidad"
              name="amount"
              value={amount}
              onChange={handleInputChange}
              inputProps={{ maxLength: 15, min: 1 }}
              InputProps={{
                endAdornment: <InputAdornment position="end" >{supplySelected.unitMeasurement}</InputAdornment>,
              }}
              fullWidth
            />
          )
        }
      </Grid>
      <Grid item xs={12} sm={1} display="flex" justifyContent="center">
        <IconButton
          color="success"
          aria-label="add"
          size="small"
          onClick={() => handleAddNewSupply()}
        >
          <AddIcon />
        </IconButton>
      </Grid>
    </Grid>
  )
}

