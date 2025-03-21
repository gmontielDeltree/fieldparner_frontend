import React, { useEffect, ChangeEvent, useState } from 'react'
import { TransportDocumentFormProps } from './type';
import { Checkbox, FormControl, FormControlLabel, FormHelperText, Grid, InputAdornment, InputLabel, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import { BusinessItem } from '../../interfaces/socialEntity';
import { CountryCode, ItemZipCode } from '../../types';
import { getLocalityAndStateByZipCode } from '../../utils/getDataZipCode';
import { Loading } from '../Loading';


interface DestinatarioFormProps {
  handleCheckboxChange: (e: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  handleFormValueChange: (key: string, value: string) => void;
}

export const DestinatarioForm: React.FC<TransportDocumentFormProps & DestinatarioFormProps> = ({
  formValues,
  providers,
  handleInputChange,
  handleSelectChange,
  handleCheckboxChange,
  handleFormValueChange,
}) => {

  const { cuitDestinatario, cuitDestino, cpDestino } = formValues;
  const [selectedDestinatario, setSelectedDestinatario] = useState<BusinessItem | null>(null);
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [dataZipCode, setDataZipCode] = useState<ItemZipCode | null>(null);

  const getLocalityAndState = async (zipCode: string) => {
    setLoadingZipCode(true);
    try {
      const localityAndStates = await getLocalityAndStateByZipCode(
        CountryCode.ARGENTINA,
        zipCode
      );

      if (localityAndStates?.length) setDataZipCode(localityAndStates[0]);

      setLoadingZipCode(false);
    } catch (error) {
      setLoadingZipCode(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (cuitDestinatario.value !== "" && providers) {
      const foundDest = providers?.find(x => x.cuit === cuitDestinatario.value);
      if (foundDest) setSelectedDestinatario(foundDest);
    }
  }, [cuitDestinatario, providers]);

  useEffect(() => {
    if (cuitDestino.value !== "" && providers) {
      const foundDest = providers?.find(x => x.cuit === cuitDestino.value);
      if (foundDest) handleFormValueChange("domicilioDestino", foundDest.domicilio);
    }
  }, [cuitDestino, providers]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (cpDestino.value !== "")
        getLocalityAndState(cpDestino.value);
      else
        setDataZipCode(null);

    }, 1000); // 1000 ms = 1 segundo

    return () => clearTimeout(delayDebounceFn);
  }, [cpDestino]);


  return (
    <Grid container spacing={1}>
      <Loading loading={loadingZipCode} />
      <Grid item xs={12} sm={4}>
        <FormControl
          key="destinatario-select"
          error={formValues.cuitDestinatario.isError}
          fullWidth>
          <InputLabel id="destinatario" required>Destinatario</InputLabel>
          <Select
            labelId="destinatario"
            name="cuitDestinatario"
            value={formValues.cuitDestinatario.value}
            label="Destinatario"
            onChange={handleSelectChange}
          >
            {providers?.map((c) => (
              <MenuItem key={c._id} value={c.cuit}>
                {c.razonSocial}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formValues.cuitDestinatario.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle2'>CUIT</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
            secondary={
              <Typography letterSpacing={1} variant='subtitle1'>
                {formValues.cuitDestinatario.value || "-"}
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
              checked={formValues.esCampo.value}
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
          value={formValues.campoDestinatario.value}
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
          value={formValues.loteDestinatario.value}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl
          key="Destino-select"
          error={formValues.cuitDestino.isError}
          fullWidth>
          <InputLabel id="Destino" required>Destino</InputLabel>
          <Select
            labelId="Destino"
            name="cuitDestino"
            value={formValues.cuitDestino.value}
            label="Destino"
            onChange={handleSelectChange}
          >
            {providers?.map((c) => (
              <MenuItem key={c._id} value={c.cuit}>
                {c.razonSocial}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formValues.cuitDestino.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <ListItemText
            primary={<Typography variant='subtitle2'>CUIT</Typography>}
            sx={{ backgroundColor: "#f4f4f4", px: 1 }}
            secondary={
              <Typography letterSpacing={1} variant='subtitle1'>
                {formValues.cuitDestino.value || "-"}
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
          value={formValues.domicilioDestino.value}
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
          name="cpDestino"
          value={formValues.cpDestino.value}
          error={formValues.cpDestino.isError}
          helperText={formValues.cpDestino.isError ? formValues.cpDestino.message : "Solo valores numéricos"}
          onChange={(e) => {
            // Validar que solo se ingresen números
            const numericRegex = /^[0-9]*$/;
            if (numericRegex.test(e.target.value) || e.target.value === '') {
              handleInputChange(e);
            }
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
            inputProps: {
              pattern: '[0-9]*', // HTML5 validation
              maxLength: 4 // Los códigos postales en Argentina suelen tener 4 dígitos
            }
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
                {dataZipCode ? dataZipCode.locality : "-"}
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
                {dataZipCode ? dataZipCode.state : "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>
    </Grid>
  )
}
