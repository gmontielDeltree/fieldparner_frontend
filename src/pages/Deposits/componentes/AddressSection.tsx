import React, { useEffect, useState } from "react";
import { Grid, TextField, Autocomplete, FormControl, FormHelperText } from "@mui/material";
import { FormSection, LocalidadSelect, MultiLanguageAutocomplete, Loading } from "../../../components";
import { useTranslation } from "react-i18next";
import { useCountry } from "../../../hooks";
import { getCountryOptions } from "../../../utils/country";
import { AddressSectionProps } from "./types";
import { onBlurZipCode } from "../../../utils";




export const AddressSection: React.FC<AddressSectionProps> = ({
  formulario,
  setFormulario,
}) => {
  const { t } = useTranslation();
  const { dataCountry, getCountries } = useCountry();
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [localities, setLocalities] = useState<string[]>([]);

  const [countryError, setCountryError] = useState(false);

  const countryOptions = getCountryOptions(dataCountry);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("CAMBIO LOCALIDAD:", e.target.name, e.target.value);
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };
  const handleBlur = () => {

    console.log("ZIP:", formulario.zipCode);
    console.log("PAIS:", formulario.country);
    onBlurZipCode(
      formulario.zipCode,
      formulario.country,
      setLoadingZipCode,
      setLocalities,
      handleInputChange,
      t
    );
  };
  useEffect(() => {
    getCountries();

  }, []);


  return (
    <>
      <Loading loading={loadingZipCode} />
      <FormSection title={t("address_information")}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4}>
            <FormControl fullWidth variant="outlined" error={countryError}>
              <MultiLanguageAutocomplete
                options={countryOptions}
                value={formulario.country}
                onChange={(countryCode) => {
                  setFormulario(prev => ({ ...prev, country: countryCode }))
                }}
                label="id_country"
                name="country"
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
              {countryError && <FormHelperText>{t("error_country")}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4}>
            <TextField
              label={t("postal_code")}
              name="zipCode"
              value={formulario.zipCode}
              onBlur={handleBlur}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Autocomplete
              id="province"
              freeSolo
              loading={loadingZipCode}
              value={formulario.province}
              onChange={(_event, newValue: string | null) =>
                newValue && setFormulario(prev => ({ ...prev, province: newValue }))
              }
              inputValue={formulario.province}
              onInputChange={(_event, newInputValue) =>
                setFormulario(prev => ({ ...prev, province: newInputValue }))
              }
              options={[]}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} label={t("_state")} name="province" />
              )}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <LocalidadSelect
              name="locality"
              localidad={formulario.locality}
              handleInputChange={handleInputChange}
              localidades={localities}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t("_address")}
              name="address"
              value={formulario.address}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
        </Grid>
      </FormSection>
    </>
  );
};