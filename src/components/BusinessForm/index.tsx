import {
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
} from "@mui/material";
import { Business, TipoEntidad } from "../../types";
import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Phone as PhoneIcon } from "@mui/icons-material";

export interface BusinessFormProps {
  values: Business;
  nameError: boolean;
  documentError: boolean;
  legajoError: boolean;
  cuitError: boolean;
  razonSocialError: boolean;
  emailError: boolean;
  // setFormValues: React.Dispatch<React.SetStateAction<Business>>;
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: ({ target }: SelectChangeEvent) => void;
  handleCheckboxChange: (
    { target }: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}

export const BusinessForm: React.FC<BusinessFormProps> = ({
  values,
  nameError,
  documentError,
  legajoError,
  cuitError,
  emailError,
  razonSocialError,
  handleInputChange,
  handleSelectChange,
  handleCheckboxChange,
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
    contactoSecundario,
    esEmpleado,
    matricula,
    legajo,
  } = values;

  const { t } =useTranslation ();

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <InputLabel id="label-tipo-entidad">{t("entity_type")}</InputLabel>
          <Select
            labelId="label-tipo-entidad"
            name="tipoEntidad"
            value={tipoEntidad}
            label="Tipo entidad"
            onChange={handleSelectChange}
          >
            <MenuItem value={TipoEntidad.FISICA.toString()}>{t("_physical")}</MenuItem>
            <MenuItem value={TipoEntidad.JURIDICA.toString()}>
            {t("_legal")}
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      {tipoEntidad.toLowerCase() === TipoEntidad.FISICA.toLowerCase() ? (
        <>
          <Grid item xs={12} sm={4}>
            <TextField
              variant="outlined"
              type="text"
              label={t("_document")}
              name="documento"
              value={documento}
              error={documentError}
              onChange={handleInputChange}
              helperText={documentError ? "Este campo es obligatorio" : ""}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              variant="outlined"
              type="text"
              label={t("full_name")}
              name="nombreCompleto"
              value={nombreCompleto}
              error={nameError}
              onChange={handleInputChange}
              helperText={nameError ? "Este campo es obligatorio" : ""}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControlLabel
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
              control={
                <Switch
                  name="esEmpleado"
                  checked={esEmpleado}
                  onChange={handleCheckboxChange}
                  defaultChecked
                />
              }
              label={t("_employee")}

            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              variant="outlined"
              type="text"
              label={t("employee_file")}
              name="legajo"
              value={legajo}
              error={legajoError}
              onChange={handleInputChange}
              helperText={legajoError ? "Este campo es obligatorio" : ""}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              variant="outlined"
              type="text"
              label={t("professional_registration")}
              name="matricula"
              value={matricula}
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
          <Grid item xs={12} sm={4}>
            <TextField
              label={t("tax_id_cuit_cnpj")}
              variant="outlined"
              // disabled={disabledFields}
              type="text"
              name="cuit"
              value={cuit}
              error={cuitError}
              onChange={handleInputChange}
              helperText={cuitError ? "Este campo es obligatorio" : ""}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label={t("name_negal_name")}
              variant="outlined"
              // disabled={disabledFields}
              type="text"
              name="razonSocial"
              value={razonSocial}
              error={razonSocialError}
              onChange={handleInputChange}
              helperText={razonSocialError ? "Este campo es obligatorio" : ""}
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
          error={emailError}
          helperText={emailError ? "Este campo es obligatorio" : ""}
          InputProps={{
            // startAdornment: <InputAdornment position="start" />,
            endAdornment: <InputAdornment position="end">@</InputAdornment>,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label={t("_phone")}
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
          label={t("main_contact")}
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
      <Grid item xs={12} sm={6}>
        <TextField
          label={t("secondary_contact")}
          variant="outlined"
          // disabled={disabledFields}
          type="text"
          name="contactoSecundario"
          value={contactoSecundario}
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
