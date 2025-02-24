import {
  Autocomplete,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
} from "@mui/material";
import { TipoEntidad } from "../../types";
import React, { ChangeEvent, SyntheticEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Country } from "../../interfaces/country";
import { Business } from "../../interfaces/socialEntity";
import { useBusiness } from "../../hooks";
import Swal from "sweetalert2";

export interface BusinessFormProps {
  values: Business;
  nameError: boolean;
  documentError: boolean;
  legajoError: boolean;
  cuitError: boolean;
  razonSocialError: boolean;
  emailError: boolean;
  countries: Country[];
  countryError: boolean;
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: ({ target }: SelectChangeEvent) => void;
  handleFormValueChange: (key: string, value: string) => void;
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
  countries,
  cuitError,
  emailError,
  razonSocialError,
  countryError,
  handleFormValueChange,
  handleInputChange,
  handleSelectChange,
  handleCheckboxChange,
}) => {
  const {
    tipoEntidad,
    documento,
    nombreCompleto,
    cuit,
    taxSituation,
    razonSocial,
    email,
    contactoPrincipal,
    contactoSecundario,
    esEmpleado,
    matricula,
    legajo,
    pais,
  } = values;

  const { businesses, getBusinesses } = useBusiness();
  const { t } = useTranslation();
  const countryOptions = countries ? countries.map(c => ({ code: c.code, label: c.descriptionEN })) : [];

  // Regular expressions for validation
  const documentRegex = /^\d{8,12}$/; // 8-12 digits
  const phoneRegex = /^\d{10,}$/; // At least 10 digits
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  // Custom validation functions
  const validateDocument = (value: string): boolean => {
    return documentRegex.test(value);
  };

  const validatePhone = (value: string): boolean => {
    return value === '' || phoneRegex.test(value);
  };

  const validateEmail = (value: string): boolean => {
    return emailRegex.test(value);
  };

  // Custom input handlers with validation
  const handleDocumentInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    handleInputChange({
      ...e,
      target: {
        ...e.target,
        value,
        name: 'documento'
      }
    });
  };

  const handlePhoneInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    handleInputChange({
      ...e,
      target: {
        ...e.target,
        value,
        name: e.target.name
      }
    });
  };

  useEffect(() => {
    getBusinesses();
  }, []);

  const handleVerifyTaxId = () => {
    const cuitValue = cuit ?? "";
    const documentoValue = documento ?? "";
  
    if (cuitValue.trim() === "" && documentoValue.trim() === "") {
      return false;
    }
  
    const TaxIdExists = businesses.find((business) => business.cuit === cuitValue);
    const documentoExists = businesses.find((business) => business.documento === documentoValue);
  
    if (TaxIdExists) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La Clave Tributaria ya existe',
      }).then(() => {
        handleInputChange({
          target: {
            name: "cuit",
            value: "",
          },
        } as ChangeEvent<HTMLInputElement>);
      });
      return true;
    }
  
    if (documentoExists) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El Documento ya existe',
      }).then(() => {
        handleInputChange({
          target: {
            name: "documento",
            value: "",
          },
        } as ChangeEvent<HTMLInputElement>);
      });
      return true;
    }
  
    return false;
  };
  
  const onChangeCountry = (_event: SyntheticEvent, value: { code: string; label: string } | null) => {
    if (value)
      handleFormValueChange("pais", value.code);
  }

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
              error={documentError || (documento && !validateDocument(documento))}
              onBlur={handleVerifyTaxId}
              onChange={handleDocumentInput}
              helperText={
                documentError 
                  ? "Este campo es obligatorio" 
                  : documento && !validateDocument(documento)
                  ? "El documento debe tener entre 8 y 12 dígitos"
                  : ""
              }
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          {/* Rest of the physical person fields */}
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
              label={t("tax_key")}
              variant="outlined"
              type="text"
              name="cuit"
              value={cuit}
              error={cuitError}
              onChange={handleInputChange}
              onBlur={handleVerifyTaxId}
              helperText={cuitError ? "Este campo es obligatorio" : ""}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Situacion fiscal"
              variant="outlined"
              type="text"
              name="taxSituation"
              value={taxSituation}
              error={cuitError}
              onChange={handleInputChange}
              onBlur={handleVerifyTaxId}
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
          type="email"
          name="email"
          value={email}
          onChange={handleInputChange}
          error={emailError || (email && !validateEmail(email))}
          helperText={
            emailError 
              ? "Este campo es obligatorio" 
              : email && !validateEmail(email)
              ? "Por favor ingrese un email válido"
              : ""
          }
          InputProps={{
            endAdornment: <InputAdornment position="end">@</InputAdornment>,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={5}>
        <FormControl fullWidth variant="outlined" error={countryError}>
          <Autocomplete
            value={countryOptions.find(opts => opts.code === pais) || null}
            onChange={onChangeCountry}
            options={countryOptions}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField {...params} label={t("id_country")} variant="outlined" />
            )}
            fullWidth
          />
          {countryError && <FormHelperText>Mensaje de error!</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label={t("main_contact")}
          variant="outlined"
          type="tel"
          name="contactoPrincipal"
          value={contactoPrincipal}
          onChange={handlePhoneInput}
          error={contactoPrincipal && !validatePhone(contactoPrincipal)}
          helperText={
            contactoPrincipal && !validatePhone(contactoPrincipal)
              ? "El teléfono debe tener al menos 10 dígitos"
              : ""
          }
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={5}>
        <TextField
          label={t("secondary_contact")}
          variant="outlined"
          type="tel"
          name="contactoSecundario"
          value={contactoSecundario}
          onChange={handlePhoneInput}
          error={contactoSecundario && !validatePhone(contactoSecundario)}
          helperText={
            contactoSecundario && !validatePhone(contactoSecundario)
              ? "El teléfono debe tener al menos 10 dígitos"
              : ""
          }
          InputProps={{
            startAdornment: <InputAdornment position="start" />,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={1} sm={6}></Grid>
    </Grid>
  );
};