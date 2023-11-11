import {
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { Supply, UnidadesDeMedida } from "../../types";
import React, { ChangeEvent } from "react";

export interface StockFormProps {
  formValues: Supply;
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: ({ target }: SelectChangeEvent) => void;
}

export const StockForm: React.FC<StockFormProps> = ({
  formValues,
  handleInputChange,
  handleSelectChange,
}) => {
  const { type, name, unitMeasurement, replenishmentPoint } = formValues;

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label="Tipo"
          value={type}
          disabled
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
            style: {
              backgroundColor: "#f5f5f5",
              fontWeight: 600,
            },
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label="Insumo"
          value={name}
          disabled
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
            style: {
              backgroundColor: "#f5f5f5",
              fontWeight: 600,
            },
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel id="unidadMedida">Unidad de medida</InputLabel>
          <Select
            labelId="unidadMedida"
            name="unitMeasurement"
            value={unitMeasurement}
            // autoWidth
            label="Unidad de medida"
            onChange={handleSelectChange}
          >
            {UnidadesDeMedida.map((um, index) => (
              <MenuItem key={`${um}-${index}`} value={um}>
                {um}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label="Punto Reposición"
          name="replenishmentPoint"
          value={replenishmentPoint}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
    </Grid>
  );
};
