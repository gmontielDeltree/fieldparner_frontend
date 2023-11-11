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
import { Supply, TipoInsumo, TypeSupplies } from "../../types";
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
  const { type, name, description, barCode, hasBatch, labors } = formValues;

  const handleChangeLabors = (
    { target }: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    const { name: newLabor } = target;
    if (checked)
      setFormValues((prevState) => ({
        ...prevState,
        labors: [...prevState.labors, newLabor],
      }));
    else {
      let laborsFiltered = formValues.labors.filter(
        (labor) => labor !== newLabor
      );
      setFormValues((prevState) => ({ ...prevState, labors: laborsFiltered }));
    }
  };

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel id="tipo-insumo">Tipo</InputLabel>
          <Select
            labelId="tipo-insumo"
            name="type"
            value={type}
            label="Tipo"
            onChange={handleSelectChange}
          >
            {TypeSupplies.map((supply) => (
              <MenuItem key={supply} value={supply}>
                {supply}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label="Insumo"
          name="name"
          value={name}
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
          name="description"
          value={description}
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
          name="barCode"
          value={barCode}
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
              name="hasBatch"
              checked={hasBatch}
              onChange={handleCheckboxChange}
              // defaultChecked
            />
          }
          label="Aplica Stock por Lotes?"
        />
      </Grid>
      <Grid item xs={12} sm={12} sx={{ my: 3 }}>
        {type.toLowerCase() === TipoInsumo.CULTIVO.toLowerCase() && (
          <>
            <Typography variant="h5" sx={{ pl: 2, mb: 2 }}>
              Labores que aplica
            </Typography>
            <FormGroup row sx={{ justifyContent: "center" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="Preparado"
                    checked={labors.includes("Preparado")}
                    onChange={handleChangeLabors}
                  />
                }
                label="Preparado"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="Siembra"
                    checked={labors.includes("Siembra")}
                    onChange={handleChangeLabors}
                  />
                }
                label="Siembra"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="Aplicacion"
                    checked={labors.includes("Aplicacion")}
                    onChange={handleChangeLabors}
                  />
                }
                label="Aplicacion"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="Arrancado"
                    checked={labors.includes("Arrancado")}
                    onChange={handleChangeLabors}
                  />
                }
                label="Arrancado"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="Cosecha"
                    checked={labors.includes("Cosecha")}
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
