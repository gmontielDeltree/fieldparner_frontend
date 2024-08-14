import React from 'react'
import { TransportDocumentFormProps } from './type';
import { Box, FormControl, Grid, InputAdornment, InputLabel, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';

//TODO: CONTRATO / salidaCampoId chequear con campo de primera pantalla?

export const GranoTransportadoForm: React.FC<TransportDocumentFormProps> = ({
  formValues,
  companies,
  categories,
  fields,
  providers,
  handleInputChange,
  handleSelectChange
}) => {


  return (
    <Box className="grano-transportado-form">
      <Grid container spacing={1}>
        <Grid item xs={12} sm={3}>
          <FormControl key="campaign-select" fullWidth>
            <InputLabel id="campaign" required>Campaña</InputLabel>
            <Select
              labelId="campaign"
              name="campaniaId"
              required
              value={formValues.campaniaId}
              label="Campaña"
              onChange={handleSelectChange}
            >
              {fields?.map((c) => (
                <MenuItem key={c._id} value={c.campaignId}>
                  {c.campaignId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl key="cultivo-select" fullWidth>
            <InputLabel id="cultive" required>Cultivo</InputLabel>
            <Select
              labelId="cultive"
              name="cultivoId"
              required
              value={formValues.cultivoId}
              label="Cultivo"
              onChange={handleSelectChange}
            >
              {fields?.map((c) => (
                <MenuItem key={c._id} value={c.cropId}>
                  {c.cultive}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            variant="outlined"
            type="text"
            label="Contrato"
            name="contratoId"
            value={formValues.contratoId}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl key="exit-field-select" fullWidth>
            <InputLabel id="salida" required>Salida de Campo</InputLabel>
            <Select
              labelId="salida"
              name="salidaCampoId"
              required
              value={formValues.salidaCampoId}
              label="Salida de Campo"
              onChange={handleSelectChange}
            >
              {fields?.map((c) => (
                <MenuItem key={c._id} value={c.campaignId}>
                  {c.cultive}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <ListItemText
              primary={<Typography variant='subtitle2'>Kgs</Typography>}
              sx={{ backgroundColor: "#f4f4f4", px: 1 }}
              secondary={
                <Typography letterSpacing={1} variant='subtitle1'>
                  {213000}
                </Typography>}
            />
          </FormControl>
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
