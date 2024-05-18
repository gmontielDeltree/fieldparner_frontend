import React, { ChangeEvent, SetStateAction, useState } from "react";
import { Grid, TextField, InputAdornment, Button, Input, Card, CardMedia, Box, Paper, IconButton } from "@mui/material";
import { getLocalityAndStateByZipCode } from "../../services";
import { Autocomplete } from "@mui/material";
import { Loading } from "../../components";
import { useTranslation } from "react-i18next";
import { CloudUpload as CloudUploadIcon, DoDisturb as DoDisturbIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { Business } from "../../types";
import uuid4 from "uuid4";
import { urlImg } from "../../config";

// export interface Address {
//   domicilio: string;
//   localidad: string;
//   cp: string;
//   provincia: string;
//   pais: string;
// }

export interface AddressFormProps {
  values: Business;
  countryError: boolean;
  loading: boolean;
  onChangeZipCode: () => Promise<void>;
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleFormValueChange: (key: string, value: string) => void;
  setFile: React.Dispatch<SetStateAction<File | null>>;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  values,
  handleInputChange,
  countryError,
  setFile,
  handleFormValueChange,
}) => {
  const { domicilio, localidad, cp, provincia, pais, logoBusiness } = values;
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [localities, setLocalities] = useState<string[]>([]);
  const [urlFile, setUrlFile] = useState('');
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      let fileNameOriginal = file.name;
      let extensionPos = fileNameOriginal.lastIndexOf(".");
      let fileType = fileNameOriginal.substring(extensionPos, fileNameOriginal.length);

      const newFileName = `business-logo-${uuid4()}${fileType}`;
      const renamedFile = new File([file], newFileName, { type: file.type });
      const fileURL = URL.createObjectURL(renamedFile);

      setUrlFile(fileURL);
      setFile(renamedFile);
      handleFormValueChange("logoBusiness", newFileName);
    }
  };

  const handleCancelFile = () => {
    setUrlFile("");
    setFile(null);
    handleFormValueChange("logoBusiness", "");
  }

  return (
    <>
      <Loading key="loading-business" loading={loadingZipCode} />
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
            label={t("_address")}
            variant="outlined"
            type="text"
            name="domicilio"
            value={domicilio}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={12} sx={{
          marginTop: "10px",
          display: "flex",
          flexDirection: "column-reverse",
          justifyContent: "center",
          alignItems: "center"
        }}>
          {
            !(urlFile || logoBusiness) ? (
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
              >
                Logo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileUpload} />
              </Button>
            ) :
              <IconButton onClick={handleCancelFile} color="error" sx={{ p: 0, pl: 1 }}>
                <CancelIcon fontSize="large" />
              </IconButton>
          }

          <Box display="inline-block" component={Paper} sx={{ mb: 1 }}>
            {
              (urlFile || logoBusiness) ? (
                <Card sx={{ maxWidth: "220px", height: "120px" }}>
                  <CardMedia
                    component="img"
                    sx={{ objectFit: "contain" }}
                    image={urlFile || `${urlImg}/${logoBusiness}`}
                    alt="Logo"
                  />
                </Card>
              ) :
                <Box sx={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DoDisturbIcon fontSize="large" color="disabled" />
                </Box>
            }
          </Box>
        </Grid>
      </Grid>
    </>
  );
};
