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
import { Business, TipoEntidad } from "../../types";
import React, { ChangeEvent } from "react";
import { Phone as PhoneIcon } from "@mui/icons-material";

export interface BusinessFormProps {
  values: Business;
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: ({ target }: SelectChangeEvent) => void;
}

export const BusinessForm: React.FC<BusinessFormProps> = ({
  values,
  handleInputChange,
  handleSelectChange,
}) => {

  const {
    tipoEntidad,
    documento,
    nombreCompleto,
    cuit,
    razonSocial,
    email,
    telefono,
    contactoPrincipal,
  } = values;

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel id="label-tipo-entidad">Tipo entidad</InputLabel>
          <Select
            labelId="label-tipo-entidad"
            name="tipoEntidad"
            value={tipoEntidad}
            label="Tipo entidad"
            onChange={handleSelectChange}
          >
            <MenuItem value={TipoEntidad.FISICA.toString()}>Fisica</MenuItem>
            <MenuItem value={TipoEntidad.JURIDICA.toString()}>
              Jurídica
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      {tipoEntidad.toLowerCase() === TipoEntidad.FISICA.toLowerCase() ? (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              type="text"
              label="Documento"
              name="documento"
              value={documento}
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
              label="Nombre completo"
              name="nombreCompleto"
              value={nombreCompleto}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Cuit"
              variant="outlined"
              // disabled={disabledFields}
              type="text"
              name="cuit"
              value={cuit}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Razon Social"
              variant="outlined"
              // disabled={disabledFields}
              type="text"
              name="razonSocial"
              value={razonSocial}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
        </>
      )}
      <Grid item xs={12} sm={6}>
        <TextField
          label="Email"
          variant="outlined"
          // disabled={disabledFields}
          type="email"
          name="email"
          value={email}
          onChange={handleInputChange}
          InputProps={{
            // startAdornment: <InputAdornment position="start" />,
            endAdornment: <InputAdornment position="end">@</InputAdornment>,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Telefono"
          variant="outlined"
          // disabled={disabledFields}
          type="text"
          name="telefono"
          value={telefono}
          onChange={handleInputChange}
          InputProps={{
            // startAdornment: <InputAdornment position="start" />,
            endAdornment: (
              <InputAdornment position="end">
                <PhoneIcon />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Contacto principal"
          variant="outlined"
          // disabled={disabledFields}
          type="text"
          name="contactoPrincipal"
          value={contactoPrincipal}
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
