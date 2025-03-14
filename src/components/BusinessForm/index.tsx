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
import React, { ChangeEvent, SyntheticEvent, useEffect, useRef } from "react";
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
  
  const prevDocumentoRef = useRef(documento);
  const prevCuitRef = useRef(cuit);

  const documentRegex = /^\d{8,12}$/;
  const phoneRegex = /^\d{10,}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  const validateDocument = (value: string): boolean => {
    return documentRegex.test(value);
  };

  const validatePhone = (value: string): boolean => {
    return value === '' || phoneRegex.test(value);
  };

  const validateEmail = (value: string): boolean => {
    return emailRegex.test(value);
  };

  const handleDocumentInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
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
    const value = e.target.value.replace(/\D/g, '');
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

  const handleVerifyTaxId = async (event: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    
    if (!value.trim()) {
      return;
    }

    if (name === 'documento' && value === prevDocumentoRef.current) {
      return;
    }
    if (name === 'cuit' && value === prevCuitRef.current) {
      return;
    }

    if (name === 'documento') {
      prevDocumentoRef.current = value;
    }
    if (name === 'cuit') {
      prevCuitRef.current = value;
    }

    const existingBusiness = businesses.find((business) => {
      if (name === 'documento') {
        return business.documento === value && business._id !== values._id;
      }
      if (name === 'cuit') {
        return business.cuit === value && business._id !== values._id;
      }
      return false;
    });

    if (existingBusiness) {
      const errorMessage = name === 'documento' 
        ? t('document_exists_error')
        : t('tax_id_exists_error');

      await Swal.fire({
        icon: 'error',
        title: t('error'),
        text: errorMessage,
      });

      handleInputChange({
        target: {
          name,
          value: '',
        },
      } as ChangeEvent<HTMLInputElement>);
    }
  };

  const countryOptions = countries ? countries.map(c => ({ code: c.code, label: c.descriptionEN })) : [];

  const onChangeCountry = (_event: SyntheticEvent, value: { code: string; label: string } | null) => {
    if (value) {
      handleFormValueChange("pais", value.code);
    }
  };

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <InputLabel id="label-tipo-entidad">{t("entity_type")}</InputLabel>
          <Select
            labelId="label-tipo-entidad"
            name="tipoEntidad"
            value={tipoEntidad}
            label={t("entity_type")}
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
                  ? t("field_required")
                  : documento && !validateDocument(documento)
                  ? t("document_format_error")
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
              variant="outlined"
              type="text"
              label={t("full_name")}
              name="nombreCompleto"
              value={nombreCompleto}
              error={nameError}
              onChange={handleInputChange}
              helperText={nameError ? t("field_required") : ""}
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
              helperText={legajoError ? t("field_required") : ""}
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
              helperText={cuitError ? t("field_required") : ""}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label={t("tax_situation")}
              variant="outlined"
              type="text"
              name="taxSituation"
              value={taxSituation}
              error={cuitError}
              onChange={handleInputChange}
              helperText={cuitError ? t("field_required") : ""}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label={t("legal_name")}
              variant="outlined"
              type="text"
              name="razonSocial"
              value={razonSocial}
              error={razonSocialError}
              onChange={handleInputChange}
              helperText={razonSocialError ? t("field_required") : ""}
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
          label={t("email")}
          variant="outlined"
          type="email"
          name="email"
          value={email}
          onChange={handleInputChange}
          error={emailError || (email && !validateEmail(email))}
          helperText={
            emailError 
              ? t("field_required")
              : email && !validateEmail(email)
              ? t("email_format_error")
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
          {countryError && <FormHelperText>{t("error_message")}</FormHelperText>}
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
              ? t("phone_format_error")
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
              ? t("phone_format_error")
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