import React, { ChangeEvent } from 'react'
import { TransportDocumentFormProps } from './type';
import { Button, Checkbox, FormControl, FormControlLabel, FormGroup, Grid, IconButton, Input, InputAdornment, InputLabel, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import { getShortDate } from '../../helpers/dates';
import { EnumCalidad, EnumEnvoltura, EnumTipoFlete } from '../../types';
import { Cancel as CancelIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';


interface TransportistaFormProps {
  handleCheckboxChange: (e: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  handleFormValueChange: (key: string, value: string) => void;
  fileUpload: (file: File) => void;
  deleteFile: () => void;
}

export const TransportistaForm: React.FC<TransportDocumentFormProps & TransportistaFormProps> = ({
  formValues,
  providers,
  vehicles,
  handleInputChange,
  handleSelectChange,
  handleFormValueChange,
  fileUpload,
  deleteFile
}) => {

  const removeFile = () => {
    handleFormValueChange("fileName", "");
    deleteFile();
  }

  const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      let fileNameOriginal = file.name;
      let extensionPos = fileNameOriginal.lastIndexOf(".");
      let fileType = fileNameOriginal.substring(extensionPos, fileNameOriginal.length);

      const newFileName = `carta-porte_${formValues.nroCartaPorte}${fileType}`;
      const renamedFile = new File([file], newFileName, { type: file.type });
      fileUpload(renamedFile);
      handleFormValueChange("fileName", newFileName);
    }
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sm={4}>
        <FormControl key="transportista-select" fullWidth>
          <InputLabel id="transportista" required>Transportista</InputLabel>
          <Select
            labelId="transportista"
            name="cuitTransportista"
            required
            value={formValues.cuitTransportista}
            label="Transportista"
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
                {formValues.cuitTransportista || "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl key="chofer-select" fullWidth>
          <InputLabel id="chofer" required>Chofer</InputLabel>
          <Select
            labelId="chofer"
            name="cuitChofer"
            required
            value={formValues.cuitChofer}
            label="Chofer"
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
                {formValues.cuitChofer || "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl key="chasis-select" fullWidth>
          <InputLabel id="chasis" required>Chasis</InputLabel>
          <Select
            labelId="chasis"
            name="vehiculoIdChasis"
            value={formValues.vehiculoIdChasis}
            label="Chasis"
            required
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 248 }//Tamaño para 5 opciones
              }
            }}
            onChange={handleSelectChange}
          >
            {vehicles?.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.chassisNumber}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={2}>
        <FormControl key="acoplado1-select" fullWidth>
          <InputLabel id="acoplado1">Acoplado 1</InputLabel>
          <Select
            labelId="acoplado1"
            name="vehiculoIdAcoplado1"
            value={formValues.vehiculoIdAcoplado1}
            label="Acoplado 1"
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 248 }//Tamaño para 5 opciones
              }
            }}
            onChange={handleSelectChange}
          >
            {vehicles?.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.patent}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={2}>
        <FormControl key="acoplado2-select" fullWidth>
          <InputLabel id="acoplado2" >Acoplado 2</InputLabel>
          <Select
            labelId="acoplado2"
            name="vehiculoIdAcoplado2"
            value={formValues.vehiculoIdAcoplado2}
            label="Acoplado 2"
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 248 }//Tamaño para 5 opciones
              }
            }}
            onChange={handleSelectChange}
          >
            {vehicles?.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.patent}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={2}>
        <TextField
          variant="outlined"
          type="text"
          label="Kms"
          name="kmARecorrer"
          value={formValues.kmARecorrer}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormGroup row>
          <FormControlLabel
            key="checkbox-true"
            control={
              <Checkbox
                name="tipoFlete"
                checked={formValues.tipoFlete === EnumTipoFlete.PAGO}
                onChange={() => handleFormValueChange("tipoFlete", EnumTipoFlete.PAGO)}
              />
            }
            label={EnumTipoFlete.PAGO}
            labelPlacement="start"
          />
          <FormControlLabel
            key="checkbox-false"
            control={
              <Checkbox
                name="APAGAR"
                checked={formValues.tipoFlete === EnumTipoFlete.APAGAR}
                onChange={() => handleFormValueChange("tipoFlete", EnumTipoFlete.APAGAR)}
              />
            }
            label={EnumTipoFlete.APAGAR}
            labelPlacement="start"
          />
        </FormGroup>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          variant="outlined"
          type="number"
          label="Tarifa Ref"
          name="tarifaRef"
          value={formValues.tarifaRef}
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
          type="number"
          label="Tarifa TT"
          name="tarifaTT"
          value={formValues.tarifaTT}
          onChange={handleInputChange}
          inputProps={{
            inputMode: 'numeric', // Modo de entrada solo para números
            pattern: '[0-9]*', // Patrón para aceptar solo dígitos
            min: 0, // Mínimo valor permitido (0 o más)
            step: 1 // Paso de incremento
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          variant="outlined"
          type="date"
          label="Fecha Partida"
          name="fechaPartida"
          value={formValues.fechaPartida}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          inputProps={{
            min: getShortDate(false, "-"), // Establece la fecha mínima permitida como la fecha actual
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant='h6' sx={{ my: 1 }}>Declaración de Calidad</Typography>
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormGroup row>
          <FormControlLabel
            key="EMBOLSADO"
            control={
              <Checkbox
                name="calidadEnvoltura"
                checked={formValues.calidadEnvoltura === EnumEnvoltura.EMBOLSADO}
                onChange={() => handleFormValueChange("calidadEnvoltura", EnumEnvoltura.EMBOLSADO)}
              />
            }
            label={EnumEnvoltura.EMBOLSADO}
            labelPlacement="start"
          />
          <FormControlLabel
            key="GRANEL"
            control={
              <Checkbox
                name="GRANEL"
                checked={formValues.calidadEnvoltura === EnumEnvoltura.GRANEL}
                onChange={() => handleFormValueChange("calidadEnvoltura", EnumEnvoltura.GRANEL)}
              />
            }
            label={EnumEnvoltura.GRANEL}
            labelPlacement="start"
          />
        </FormGroup>
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormGroup row>
          <FormControlLabel
            key="CONFORME"
            control={
              <Checkbox
                name="CONFORME"
                checked={formValues.calidad === EnumCalidad.CONFORME}
                onChange={() => handleFormValueChange("calidad", EnumCalidad.CONFORME)}
              />
            }
            label={EnumCalidad.CONFORME}
            labelPlacement="start"
          />
          <FormControlLabel
            key="CONDICIONAL"
            control={
              <Checkbox
                name="CONDICIONAL"
                checked={formValues.calidad === EnumCalidad.CONDICIONAL}
                onChange={() => handleFormValueChange("calidad", EnumCalidad.CONDICIONAL)}
              />
            }
            label={EnumCalidad.CONDICIONAL}
            labelPlacement="start"
          />
        </FormGroup>
      </Grid>
      <Grid item xs={12} sm={6} />
      <Grid item xs={12} sm={4}>
        <FormControl key="cuitPagadorFlete-select" fullWidth>
          <InputLabel id="cuitPagadorFlete" required>Pagador Flete</InputLabel>
          <Select
            labelId="cuitPagadorFlete"
            name="cuitPagadorFlete"
            required
            value={formValues.cuitPagadorFlete}
            label="Pagador Flete"
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
                {formValues.cuitPagadorFlete || "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl key="cuitIntermediarioFlete-select" fullWidth>
          <InputLabel id="cuitIntermediarioFlete">Intermediario Flete</InputLabel>
          <Select
            labelId="cuitIntermediarioFlete"
            name="cuitIntermediarioFlete"
            value={formValues.cuitIntermediarioFlete}
            label="Intermediario Flete"
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
                {formValues.cuitIntermediarioFlete || "-"}
              </Typography>}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={12} sx={{ my: 2, display: "flex", alignItems: "center", justifyContent: "center" }} >
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
        >
          Documento
          <Input
            type="file"
            hidden
            inputProps={{ accept: 'application/pdf' }}
            onChange={onChangeFile} />
        </Button>
        {formValues.fileName ? (
          <>
            <label
              title={formValues.fileName}
              style={{
                margin: "10px",
                width: "240px",
                display: "inline-block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
              {formValues.fileName}
            </label>
            <IconButton onClick={() => removeFile()} color="error">
              <CancelIcon fontSize="medium" />
            </IconButton>
          </>
        ) :
          <Typography variant="body1" sx={{ ml: 1, display: "inline-block" }}>
            Ningún archivo seleccionado
          </Typography>
        }
      </Grid>
    </Grid>
  )
}
