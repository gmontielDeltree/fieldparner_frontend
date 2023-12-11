import { FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import React, { useState } from 'react';
import { Deposit, Supply, TransformSupply } from '../../types';
import { useForm } from '../../hooks';
import uuid4 from 'uuid4';
import { getShortDate } from '../../helpers/dates';


interface NewSupplyRowProps {
  supplies: Supply[],
  deposits: Deposit[],
  addNewSupply: (item: TransformSupply) => void;
}

const today = getShortDate();
const initialStateNewSupply = {
  supplyId: "",
  depositId: "",
  location: "",
  nroLot: "",
  dueDate: today,
};

export const NewSupplyRow: React.FC<NewSupplyRowProps> = ({
  supplies,
  deposits,
  addNewSupply
}) => {

  const {
    supplyId,
    depositId,
    location,
    nroLot,
    dueDate,
    handleInputChange,
    reset,
    setFormulario,
  } = useForm(initialStateNewSupply);
  const [supplySelected, setSupplySelected] = useState<Supply | null>(null);
  const [depositSelected, setDepositSelected] = useState<Deposit | null>(null);

  const onChangeSupply = ({ target }: SelectChangeEvent) => {
    const { value } = target;
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
      amount: 0,
    });
    reset();
  }

  return (
    <Grid
      key="row-new-supply-origin"
      container
      spacing={1}
      mt={5}
      mb={3}
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
          onClick={() => handleAddNewSupply()}
        >
          <AddIcon />
        </IconButton>
      </Grid>
    </Grid>
  )
}

