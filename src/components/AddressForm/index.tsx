import React, { ChangeEvent, useState } from "react";
import { Grid, TextField, InputAdornment } from "@mui/material";
import { getLocalityAndStateByZipCode } from "../../services";
import { Autocomplete } from "@mui/material";
import { Loading } from "../../components";
import { useTranslation } from "react-i18next";

export interface Address {
  domicilio: string;
  localidad: string;
  cp: string;
  provincia: string;
  pais: string;
}

export interface AddressFormProps {
  values: Address;
  countryError: boolean;
  loading: boolean;
  onChangeZipCode: () => Promise<void>;
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  values,
  handleInputChange,
  countryError,
  loading
}) => {
  const { domicilio, localidad, cp, provincia, pais } = values;
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [localities, setLocalities] = useState<string[]>([]);
  const [isLoading] = useState(false);
  const { t } = useTranslation();

  const onBlurZipCode = async () => {
    if (cp !== "") {
      setLoadingZipCode(true);
      try {
        const localityAndStates = await getLocalityAndStateByZipCode("ARG", cp);

        if (localityAndStates?.length) {
          const firstLocality = localityAndStates[0].locality;
          const firstProvince = localityAndStates[0].state;

          setLocalities(localityAndStates.map((x) => x.locality));

          handleInputChange({
            target: {
              name: "localidad",
              value: firstLocality
            }
          } as React.ChangeEvent<HTMLInputElement>);

          handleInputChange({
            target: {
              name: "provincia",
              value: firstProvince
            }
          } as React.ChangeEvent<HTMLInputElement>);
        }

        setLoadingZipCode(false);
      } catch (error) {
        setLoadingZipCode(false);
      }
    }
  };

  return (
    <>
      <Loading key="loading-business" loading={isLoading || loadingZipCode} />
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
            label={t("id_country")}
            variant="outlined"
            type="text"
            name="pais"
            value={pais}
            error={countryError}
            onChange={handleInputChange}
            helperText={countryError ? "Este campo es obligatorio" : ""}
            InputProps={{
              startAdornment: <InputAdornment position="start" />
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            variant="outlined"
            type="text"
            label={t("postal_code")}
            name="cp"
            value={cp}
            onBlur={onBlurZipCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange(e)
            }
            InputProps={{
              startAdornment: <InputAdornment position="start" />
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t("_state")}
            variant="outlined"
            type="text"
            name="provincia"
            value={provincia}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={localities}
            getOptionLabel={(option) => option}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("_locality")}
                variant="outlined"
                name="localidad"
                value={localidad}
                onChange={handleInputChange}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <InputAdornment position="start" />
                }}
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField
            label={t("_locality")}
            variant="outlined"
            type="text"
            name="_address"
            value={domicilio}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />
            }}
            fullWidth
          />
        </Grid>
      </Grid>
    </>
  );
};
