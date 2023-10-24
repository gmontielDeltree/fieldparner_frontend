import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {  Supply, TipoInsumo } from "../../types";
import React, { ChangeEvent } from "react";

export interface LaborsFormProps {
  formValues: Supply;
  setFormValues: React.Dispatch<React.SetStateAction<Supply>>;
  handleSelectChange: ({ target }: SelectChangeEvent) => void;
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (
    { target }: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}

export const LaborsForm: React.FC<LaborsFormProps> = ({
  formValues,
  handleSelectChange,
  handleInputChange,
  handleCheckboxChange,
  setFormValues,
}) => {
  const {
    tipo,
    insumo,
    descripcion,
    codigoBarra,
    tieneLotes,
    labores,
  } = formValues;

  const handleChangeLabors = (
    { target }: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    const { name: newLabor } = target;
    if (checked)
      setFormValues((prevState) => ({
        ...prevState,
        labores: [...prevState.labores, newLabor],
      }));
    else {
      let laborsFiltered = formValues.labores.filter(
        (labor) => labor !== newLabor
      );
      setFormValues((prevState) => ({ ...prevState, labores: laborsFiltered }));
    }
  };

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel id="tipo-insumo">Tipo</InputLabel>
          <Select
            labelId="tipo-insumo"
            name="tipo"
            value={tipo}
            label="Tipo"
            onChange={handleSelectChange}
          >
            <MenuItem value={"Varios"}>Varios</MenuItem>
            <MenuItem value={"Semillas"}>Semillas</MenuItem>
            <MenuItem value={"Cultivo"}>Cultivo</MenuItem>
            <MenuItem value={"Fertilizantes"}>Fertilizantes</MenuItem>
            <MenuItem value={"Fitosanitarios"}>Fitosanitarios</MenuItem>
            <MenuItem value={"Repuestos"}>Repuestos</MenuItem>
            <MenuItem value={"Materiales"}>Materiales</MenuItem>
            <MenuItem value={"Combustible"}>Combustible</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label="Insumo"
          name="insumo"
          value={insumo}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={12}>
        <TextField
          variant="outlined"
          type="text"
          label="Descripcion"
          name="descripcion"
          value={descripcion}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label="Codigo de Barra"
          name="codigoBarra"
          value={codigoBarra}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Switch
              name="tieneLotes"
              checked={tieneLotes}
              onChange={handleCheckboxChange}
              // defaultChecked
            />
          }
          label="Aplica Stock por Lotes?"
        />
      </Grid>
      <Grid item xs={12} sm={12} sx={{ my: 3 }}>
        {tipo.toLowerCase() === TipoInsumo.CULTIVO.toLowerCase() && (
          <>
            <Typography variant="h5" sx={{ pl: 2, mb: 2 }}>
              Labores que aplica
            </Typography>
            <FormGroup row sx={{ justifyContent: "center" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="Preparado"
                    checked={labores.includes("Preparado")}
                    onChange={handleChangeLabors}
                  />
                }
                label="Preparado"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="Siembra"
                    checked={labores.includes("Siembra")}
                    onChange={handleChangeLabors}
                  />
                }
                label="Siembra"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="Aplicacion"
                    checked={labores.includes("Aplicacion")}
                    onChange={handleChangeLabors}
                  />
                }
                label="Aplicacion"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="Arrancado"
                    checked={labores.includes("Arrancado")}
                    onChange={handleChangeLabors}
                  />
                }
                label="Arrancado"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="Cosecha"
                    checked={labores.includes("Cosecha")}
                    onChange={handleChangeLabors}
                  />
                }
                label="Cosecha"
              />
            </FormGroup>
          </>
        )}
      </Grid>
    </Grid>
  );
};
