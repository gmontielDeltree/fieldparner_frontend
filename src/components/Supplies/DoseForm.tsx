import { Grid, InputAdornment, TextField } from "@mui/material";
import { Supply } from "@types";
import React, { ChangeEvent } from "react";

export interface DoseFormProps {
  formValues: Supply;
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
}

export const DoseForm: React.FC<DoseFormProps> = ({
  formValues,
  handleInputChange,
}) => {
  const {
    type,
    name,
    minimumDose,
    maximumDose,
    recommendedDose,
    activePrincipal,
    mermaVolatile,
  } = formValues;

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label="Tipo"
          name="type"
          value={type}
          disabled
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
            style: {
              backgroundColor: '#f5f5f5',
              fontWeight: 600
            }
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label="Insumo"
          name="name"
          value={name}
          disabled
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
            style: {
              backgroundColor: '#f5f5f5',
              fontWeight: 600
            }
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={8}>
        <TextField
          variant="outlined"
          type="text"
          label="Principio Activo"
          name="activePrincipal"
          onChange={handleInputChange}
          value={activePrincipal}
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
          label="Merma Volatil"
          name="mermaVolatile"
          value={mermaVolatile}
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
          label="Dosis Min."
          name="minimumDose"
          value={minimumDose}
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
          label="Dosis Max."
          name="maximumDose"
          value={maximumDose}
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
          label="Dosis Recomendada"
          name="recommendedDose"
          value={recommendedDose}
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
