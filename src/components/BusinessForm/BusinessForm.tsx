import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import { TipoEntidad } from "../../types";
import React, {  useEffect} from "react";
import { useTranslation } from "react-i18next";
import { useBusiness } from "../../hooks";
import {MultiLanguageSelect} from ".."
import { useBusinessForm, BusinessFormProps } from "./useBusinessForm";




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

  const { getBusinesses } = useBusiness();
  const { t } = useTranslation();
  const {
    validateDocument,
    validatePhone,
    validateEmail,
    handleVerifyTaxId,
    handleDocumentInput,
    handlePhoneInput,
  } = useBusinessForm(values, handleInputChange);
  


  useEffect(() => {
    getBusinesses();
  }, []);



  const countryOptions = countries.map(c => ({
    code: c.code,
    descriptionES: c.descriptionES,
    descriptionEN: c.descriptionEN,
    descriptionPT: c.descriptionPT,
  }));


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
        <MultiLanguageSelect
          options={countryOptions}
          value={pais}
          onChange={(event) => handleFormValueChange("pais", event.target.value)}
          label="id_country"
          name="pais"
          error={countryError}
          getOptionLabel={(option, language) => {
            switch (language) {
              case "es":
                return option.descriptionES;
              case "pt":
                return option.descriptionPT;
              case "en":
              default:
                return option.descriptionEN;
            }
          }}
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