import React from "react";
import { Grid, TextField, InputAdornment, Button, Card, CardMedia, Box, Paper, IconButton } from "@mui/material";
import { Phone as PhoneIcon } from "@mui/icons-material";
import { Loading } from "..";
import { CloudUpload as CloudUploadIcon, DoDisturb as DoDisturbIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { AddressFormProps, useAddressForm } from "./useAddressForm";
import { useTranslation} from "react-i18next";
import { LocalidadSelect } from "../LocalidadSelect/LocalidadSelect";

export const AddressForm: React.FC<AddressFormProps> = ({
  values,
  handleInputChange,
  setFile,
  handleFormValueChange,
}) => {
  const { domicilio, localidad, cp, provincia, pais: _, logoBusiness, telefono } = values;
  const {t} = useTranslation();
  const {
    loadingZipCode,
    urlFile,
    handleBlur,
    handleFileUpload,
    handleCancelFile,
    localities,
  } = useAddressForm(values, handleInputChange, handleFormValueChange, setFile);



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
            variant="outlined"
            type="text"
            label={t("postal_code")}
            name="cp"
            value={cp}
            onBlur={handleBlur}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
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
        <LocalidadSelect
            localidad={localidad}
            handleInputChange={handleInputChange}
            localidades={localities}
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
                {t("_logo")}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileUpload} />
              </Button>
            ) : (
              <IconButton onClick={handleCancelFile} color="error" sx={{ p: 0, pl: 1 }}>
                <CancelIcon fontSize="large" />
              </IconButton>
            )
          }
          <Box display="inline-block" component={Paper} sx={{ mb: 1 }}>
            {
              (urlFile || logoBusiness) ? (
                <Card sx={{ maxWidth: "220px", height: "120px" }}>
                  <CardMedia
                    component="img"
                    sx={{ objectFit: "contain" }}
                    image={urlFile}
                    alt="Logo"
                  />
                </Card>
              ) : (
                <Box sx={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DoDisturbIcon fontSize="large" color="disabled" />
                </Box>
              )
            }
          </Box>
        </Grid>
      </Grid>
    </>
  );
};
