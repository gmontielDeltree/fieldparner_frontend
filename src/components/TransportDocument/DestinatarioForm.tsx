import React, { ChangeEvent, useState } from 'react'
import { TransportDocumentFormProps } from './type';
import { Checkbox, FormControl, FormControlLabel, Grid, InputAdornment, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { BusinessItem } from '../../interfaces/socialEntity';
import { getShortDate } from '../../helpers/dates';

interface DestinatarioFormProps {
  handleCheckboxChange: (e: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  handleFormValueChange: (key: string, value: string) => void;
}

export const DestinatarioForm: React.FC<TransportDocumentFormProps & DestinatarioFormProps> = ({
  formValues,
  companies,
  categories,
  fields,
  providers,
  handleInputChange,
  handleSelectChange,
  handleCheckboxChange,
  handleFormValueChange,
}) => {

  const [selectedDestinatario, setSelectedDestinatario] = useState<BusinessItem | null>(null);

  const onChangeDestinatario = (e: SelectChangeEvent) => {
    const value = e.target.value;
    const foundDest = providers?.find(x => x.cuit === value);
    if (foundDest)
      setSelectedDestinatario(foundDest);

    handleSelectChange(e);
  }

  const onChangeDestino = (e: SelectChangeEvent) => {
    const value = e.target.value;
    const foundDest = providers?.find(x => x.cuit === value);
    if (foundDest) {
      handleFormValueChange("domicilioDestino", foundDest.domicilio);
    }
    handleSelectChange(e);
  }


  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sm={4}>
        <FormControl key="destinatario-select" fullWidth>
          <InputLabel id="destinatario" required>Destinatario</InputLabel>
          <Select
            labelId="destinatario"
            name="cuitDestinatario"
            required
            value={formValues.cuitDestinatario}
            label="Destinatario"
            onChange={onChangeDestinatario}
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
            primary={<Typography variant='subtitle2'>CUIT</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
            secondary={
              <Typography letterSpacing={1} variant='subtitle1'>
                {formValues.cuitDestinatario || "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle2'>Domicilio</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
            secondary={
              <Typography letterSpacing={1} variant='subtitle1'>
                {selectedDestinatario ? selectedDestinatario.domicilio : "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControlLabel
          key="checkbox-true"
          control={
            <Checkbox
              name="esCampo"
              checked={formValues.esCampo}
              onChange={handleCheckboxChange}
            />
          }
          label="Es Campo?"
          labelPlacement="start"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          variant="outlined"
          type="text"
          label="Campo"
          name="campoDestinatario"
          value={formValues.campoDestinatario}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          variant="outlined"
          type="text"
          label="Lote"
          name="loteDestinatario"
          value={formValues.loteDestinatario}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl key="Destino-select" fullWidth>
          <InputLabel id="Destino" required>Destino</InputLabel>
          <Select
            labelId="Destino"
            name="cuitDestino"
            required
            value={formValues.cuitDestino}
            label="Destino"
            onChange={onChangeDestino}
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
            primary={<Typography variant='subtitle2'>CUIT</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
            secondary={
              <Typography letterSpacing={1} variant='subtitle1'>
                {formValues.cuitDestino || "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          variant="outlined"
          type="text"
          label="Domicilio Fiscal"
          name="domicilioDestino"
          value={formValues.domicilioDestino}
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
          label="Codigo Postal"
          name="cpGenerador"
          required
          value={formValues.cpGenerador}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle2'>Localidad</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
            secondary={
              <Typography letterSpacing={1} variant='subtitle1'>
                -
              </Typography>}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle2'>Partido/Departamento</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
            secondary={
              <Typography letterSpacing={1} variant='subtitle1'>
                -
              </Typography>}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={2}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle2'>Provincia</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
            secondary={
              <Typography letterSpacing={1} variant='subtitle1'>
                -
              </Typography>}
          />
        </FormControl>
      </Grid>
    </Grid>
  )
}
