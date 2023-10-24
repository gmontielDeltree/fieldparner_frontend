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
    tipo,
    insumo,
    dosisMinima,
    dosisMaxima,
    dosisRecomendada,
    principioActivo,
    mermaVolatil,
  } = formValues;

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label="Tipo"
          name="tipo"
          value={tipo}
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
          name="insumo"
          value={insumo}
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
          name="principioActivo"
          onChange={handleInputChange}
          value={principioActivo}
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
          name="mermaVolatil"
          value={mermaVolatil}
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
          name="dosisMinima"
          value={dosisMinima}
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
          name="dosisMaxima"
          value={dosisMaxima}
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
          name="dosisRecomendada"
          value={dosisRecomendada}
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
