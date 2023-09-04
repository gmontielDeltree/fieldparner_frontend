import React, { ChangeEvent } from "react";
import { Grid, TextField, InputAdornment } from "@mui/material";


export interface Address {
  domicilio: string;
  localidad: string;
  cp: string;
  provincia: string;
  pais: string;
}

export interface AddressFormProps {
  values: Address;
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  values,
  handleInputChange,
}) => {
  const { domicilio, localidad, cp, provincia, pais } = values;

  return (
    <Grid
      container
      margin="auto"
      maxWidth="700px"
      spacing={2}
      alignItems="center"
      justifyContent="center"
    >
      <Grid item xs={12} sm={6}>
        <TextField
          label="Pais"
          variant="outlined"
          // disabled={disabledFields}
          type="text"
          name="pais"
          value={pais}
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
          label="Codigo postal"
          name="cp"
          value={cp}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Provincia"
          variant="outlined"
          // disabled={disabledFields}
          type="text"
          name="provincia"
          value={provincia}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Localidad"
          variant="outlined"
          type="text"
          name="localidad"
          value={localidad}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={12}>
        <TextField
          label="Domicilio"
          variant="outlined"
          type="text"
          name="domicilio"
          value={domicilio}
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
