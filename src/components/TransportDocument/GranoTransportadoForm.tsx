import React, { useState } from 'react'
import { TransportDocumentFormProps } from './type';
import { Box, FormControl, Grid, InputAdornment, ListItemText, styled, TextField, Typography } from '@mui/material';
import { Loading } from '../Loading';
import { getLocalityAndStateByZipCode } from '../../utils/getDataZipCode';
import { CountryCode, ItemZipCode } from '../../types';


const TextFieldGray = styled(TextField)(() => ({
  backgroundColor: "#f5f5f5",
  fontWeight: 600
}));

export const GranoTransportadoForm: React.FC<TransportDocumentFormProps> = ({
  formValues,
  selectedFieldOutput,
  handleInputChange,
}) => {

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


  return (
    <Box className="grano-transportado-form">
      <Loading loading={loadingZipCode} />
      <Grid container spacing={1}>
        <Grid item xs={12} sm={3}>
          <TextFieldGray
            variant='outlined'
            label="Campaña"
            value={selectedFieldOutput?.campaignId || "-"}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextFieldGray
            variant='outlined'
            label="Cultivo"
            value={selectedFieldOutput?.cultive || "-"}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            variant="outlined"
            type="text"
            label="Contrato"
            name="contrato"
            value={formValues.contrato}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextFieldGray
            variant='outlined'
            label="Salida de Campo"
            value={selectedFieldOutput?.field?.nombre || "-"}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <ListItemText
              primary={<Typography variant='subtitle2'>Kgs</Typography>}
              sx={{ backgroundColor: "#f4f4f4", px: 1 }}
              secondary={
                <Typography letterSpacing={1} variant='subtitle1'>
                  {selectedFieldOutput?.kgNet || "-"}
                </Typography>}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            variant="outlined"
            type="text"
            label="Codigo Postal"
            name="cpSalidaCampo"
            required
            value={formValues.cpSalidaCampo}
            onChange={handleInputChange}
            onBlur={(e) => {
              const zipCode = e.target.value;
              zipCode && getLocalityAndState(zipCode)
            }}
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
                  {"-"}
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
      <Typography variant='h6' sx={{ my: 3 }}>La carga sera pesada en Destino*</Typography>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={3}>
          <TextField
            variant="outlined"
            type="number"
            label="Kgs Estimados"
            name="kgEstimado"
            required
            inputProps={{
              min: 0, // Valor mínimo permitido
              // step: 1, // Permitir solo números enteros
              // inputMode: 'numeric', // Mostrar teclado numérico en dispositivos móviles
            }}
            value={formValues.kgEstimado}
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
            type="number"
            label="Kgs Bruto"
            name="kgBruto"
            required
            inputProps={{ min: 0 }}
            value={formValues.kgBruto}
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
            type="number"
            label="Kgs Tara"
            name="kgTara"
            required
            inputProps={{ min: 0 }}
            value={formValues.kgTara}
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
              primary={<Typography variant='subtitle2'>Neto</Typography>}
              sx={{ backgroundColor: "#f4f4f4", px: 1 }}
              secondary={
                <Typography letterSpacing={1} variant='subtitle1'>
                  {(formValues.kgBruto - formValues.kgTara)}
                </Typography>}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField
            variant="outlined"
            type="text"
            label="Observaciones"
            name="observaciones"
            multiline
            value={formValues.observaciones}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
      </Grid>
    </Box>
  )
}
