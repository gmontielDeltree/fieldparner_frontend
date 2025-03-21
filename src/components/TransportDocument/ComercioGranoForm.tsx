import React, { useState, useEffect } from 'react'
import { TransportDocumentFormProps } from './type';
import { Alert, FormControl, FormHelperText, Grid, InputAdornment, InputLabel, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import { BusinessItem } from '../../interfaces/socialEntity';
import { validateEntityRoles } from '../../helpers/roles-validation';

export const ComercioGranoForm: React.FC<TransportDocumentFormProps> = ({
  formValues,
  providers,
  handleInputChange,
  handleSelectChange
}) => {
  const { cuitComprador } = formValues;
  const [selectedBuyer, setSelectedBuyer] = useState<BusinessItem | null>(null);
  const [roleWarning, setRoleWarning] = useState("");

  useEffect(() => {
    if (cuitComprador.value !== "" && providers) {
      const foundBuyer = providers?.find(x => x.cuit === cuitComprador.value);
      if (foundBuyer) setSelectedBuyer(foundBuyer);

      // Validar si este CUIT está siendo usado en otros roles incompatibles
      const validation = validateEntityRoles(formValues, "cuitComprador", cuitComprador.value);
      setRoleWarning(validation.warningMessage);
    } else {
      setRoleWarning("");
    }
  }, [cuitComprador, providers, formValues]);

  // Manejador personalizado para el cambio de comprador
  const handleBuyerChange = (e) => {
    // Primero aplicamos el cambio normal
    handleSelectChange(e);

    // Luego validamos roles (se ejecutará después de que formValues se actualice en useEffect)
    const newCuitValue = e.target.value;
    if (newCuitValue) {
      const validation = validateEntityRoles(
        { ...formValues, [e.target.name]: { value: newCuitValue } },
        e.target.name,
        newCuitValue
      );
      setRoleWarning(validation.warningMessage);
    } else {
      setRoleWarning("");
    }
  };

  return (
    <Grid container spacing={1}>
      {roleWarning && (
        <Grid item xs={12}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {roleWarning}
          </Alert>
        </Grid>
      )}
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
            onChange={handleBuyerChange}
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
          fullWidth
        />
      </Grid>
    </Grid>
  )
}