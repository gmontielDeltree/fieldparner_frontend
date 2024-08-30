import React, { useState, useEffect } from 'react'
import { TransportDocumentFormProps } from './type';
import { FormControl, FormHelperText, Grid, InputAdornment, InputLabel, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import { BusinessItem } from '../../interfaces/socialEntity';
// import { getShortDate } from '../../helpers/dates';



export const ComercioGranoForm: React.FC<TransportDocumentFormProps> = ({
  formValues,
  providers,
  handleInputChange,
  handleSelectChange
}) => {
  const { cuitComprador } = formValues;
  const [selectedBuyer, setSelectedBuyer] = useState<BusinessItem | null>(null);

  // const onChangeComprador = (e: SelectChangeEvent) => {
  //   const cuit = e.target.value;
  //   const foundBuyer = providers?.find(x => x.cuit === cuit);
  //   if (foundBuyer) setSelectedBuyer(foundBuyer);
  //   handleSelectChange(e);
  // }

  useEffect(() => {
    if (cuitComprador.value !== "" && providers) {
      const foundBuyer = providers?.find(x => x.cuit === cuitComprador.value);
      if (foundBuyer) setSelectedBuyer(foundBuyer);
    }
  }, [cuitComprador, providers]);


  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sm={4}>
        <FormControl
          key="comprador-select"
          fullWidth
          error={formValues.cuitComprador.isError}
        >
          <InputLabel id="comprador" required>Comprador</InputLabel>
          <Select
            labelId="comprador"
            name="cuitComprador"
            value={formValues.cuitComprador.value}
            label="Comprador"
            onChange={handleSelectChange}
          >
            {providers?.map((c) => (
              <MenuItem key={c._id} value={c.cuit}>
                {c.razonSocial}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formValues.cuitComprador.message}</FormHelperText>
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
            name="cuitAsignadorCupo"
            value={formValues.cuitAsignadorCupo.value}
            label="Razon Social que asigno Cupo"
            onChange={handleSelectChange}
          >
            {providers?.map((c) => (
              <MenuItem key={c._id} value={c.cuit}>
                {c.razonSocial}
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
                {formValues.cuitAsignadorCupo.value ? formValues.cuitAsignadorCupo.value : "-"}
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
          value={formValues.nroCupo.value}
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
          name="fechaCupo"
          value={formValues.fechaCupo.value}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          // inputProps={{ min: getShortDate(false, "-") }} 
          fullWidth
        />
      </Grid>
    </Grid>
  )
}
