import React, { useState } from 'react'
import { TransportDocumentFormProps } from './type';
import { FormControl, Grid, InputAdornment, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { BusinessItem } from '../../interfaces/socialEntity';
import { getShortDate } from '../../helpers/dates';

//TODO: CONTRATO / salidaCampoId chequear con campo de primera pantalla?

export const ComercioGranoForm: React.FC<TransportDocumentFormProps> = ({
  formValues,
  companies,
  categories,
  fields,
  providers,
  handleInputChange,
  handleSelectChange
}) => {

  const [selectedBuyer, setSelectedBuyer] = useState<BusinessItem | null>(null);
  const [selectedCupo, setSelectedCupo] = useState<BusinessItem | null>(null)

  const onChangeComprador = (e: SelectChangeEvent) => {
    const value = e.target.value;
    const foundBuyer = providers.find(x => x.cuit === value);

    if (foundBuyer)
      setSelectedBuyer(foundBuyer);

    handleSelectChange(e);
  }


  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sm={4}>
        <FormControl key="comprador-select" fullWidth>
          <InputLabel id="comprador" required>Comprador</InputLabel>
          <Select
            labelId="comprador"
            name="cuitComprador"
            required
            value={formValues.cuitComprador}
            label="Comprador"
            onChange={onChangeComprador}
          >
            {providers?.map((c) => (
              <MenuItem key={c._id} value={c.cuit}>
                {c.razonSocial || c.nombreCompleto}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle2'>Domicilio</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
            secondary={
              <Typography letterSpacing={1} variant='subtitle1'>
                {selectedBuyer ? selectedBuyer.domicilio : "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle2'>CUIT</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
            secondary={
              <Typography letterSpacing={1} variant='subtitle1'>
                {selectedBuyer ? selectedBuyer.cuit : "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl key="asig-cupo-select" fullWidth>
          <InputLabel id="cuit-cupo" >Razon Social que asigno Cupo</InputLabel>
          <Select
            labelId="cuit-cupo"
            name="cuitCupo"
            value={formValues.cuitCupo}
            label="Razon Social que asigno Cupo"
            onChange={handleSelectChange}
          >
            {providers?.map((c) => (
              <MenuItem key={c._id} value={c.cuit}>
                {c.razonSocial || c.nombreCompleto}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={2}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle2'>CUIT</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
            secondary={
              <Typography letterSpacing={1} variant='subtitle1'>
                {selectedBuyer ? selectedBuyer.cuit : "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          variant="outlined"
          type="text"
          label="Cupo N°"
          name="nroCupo"
          value={formValues.nroCupo}
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
          type="date"
          label={"Fecha Cupo"}
          required
          name="fechaCupo"
          value={formValues.fechaCupo}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          inputProps={{ min: getShortDate(false, "-") }}
          fullWidth
        />
      </Grid>
    </Grid>
  )
}
