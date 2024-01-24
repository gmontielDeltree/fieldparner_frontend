import React, { ChangeEvent, useEffect, useMemo } from "react";
import {
  Autocomplete,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { TipoEntidad, TypeVehicle, Vehicle } from "../../types";
import { useAppSelector, useBusiness, useVehicle } from "../../hooks";
import {
  FolderOpen as FolderOpenIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";


export interface DatosGeneralesProps {
  vehiculo: Vehicle;
  handleInputChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
  handleFormValueChange: (key: string, value: string) => void;
  handleYearChange: ({ target }: ChangeEvent<HTMLInputElement>) => void;
}

export const DatosGenerales: React.FC<DatosGeneralesProps> = ({
  vehiculo,
  handleInputChange,
  handleFormValueChange,
  handleYearChange,
}) => {

  const { vehicleTypes, getTypeVehicles, createVehicleType } = useVehicle();
  const typeVehicles = vehicleTypes.map(t => t.name);
  const { vehiculoActivo } = useAppSelector((state) => state.vehiculo);
  const disabledFields = !!vehiculoActivo;
const {t} = useTranslation();
  const {
    vehicleType,
    patent,
    make,
    model,
    modelYear,
    owner,
    policyNumber,
    insurence,
    insurenceStartDate,
    insurenceDueDate,
    coverageType,
    location,
    chassisNumber,
  } = vehiculo;
  const {
    getBusinesses,
    businesses,
    isLoading: loadingBusiness,
  } = useBusiness();

  const optionsPropietario = useMemo(() => {
    return businesses
      .filter((business) => business.tipoEntidad == TipoEntidad.JURIDICA)
      .map((business) => business.razonSocial || "");
  }, [businesses]);

  const handleOnBlurTipoVehiculo = async () => {
    const checkTipoVehiculo = (tV: string) =>
      tV.toLowerCase().trim() === vehicleType.toString().toLowerCase().trim();

    if (vehicleType !== "" && !typeVehicles.some(checkTipoVehiculo)) {
      const newVehicleType: TypeVehicle = { name: vehicleType };
      createVehicleType(newVehicleType);
    }
  };

  useEffect(() => {
    getTypeVehicles();
    getBusinesses();
  }, []);

  return (
    <>
      <Grid
        container
        spacing={1}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item xs={12} display="flex" alignItems="center">
          <FolderOpenIcon sx={{ mx: 1 }} />
          <Typography variant="h5">{t("general_data")}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            id="vehicleType"
            value={vehicleType}
            freeSolo
            options={typeVehicles}
            disabled={disabledFields}
            onBlur={() => handleOnBlurTipoVehiculo()}
            onChange={(_event: any, newValue: string | null) => {
              newValue && handleFormValueChange("vehicleType", newValue);
            }}
            inputValue={vehicleType}
            onInputChange={(_event, newInputValue) => {
              handleFormValueChange("vehicleType", newInputValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label={t("vehicle_type")} required />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label={t("_brand")}
            required
            variant="outlined"
            disabled={disabledFields}
            type="text"
            name="make"
            value={make}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t("_model")}
            required
            disabled={disabledFields}
            variant="outlined"
            type="text"
            name="model"
            value={model}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            type="text"
            label={t("_year")}
            name="modelYear"
            value={modelYear}
            onChange={handleYearChange}
            inputProps={{
              maxLength: 4,
              pattern: "[0-9]*",
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label={t("_patent")}
            variant="outlined"
            type="text"
            name="patent"
            value={patent}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t("_chassis")}
            variant="outlined"
            type="text"
            name="chassisNumber"
            value={chassisNumber}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            id="owner"
            freeSolo
            loading={loadingBusiness}
            value={owner}
            onChange={(_event: any, newValue: string | null) => {
              newValue && handleFormValueChange("owner", newValue);
            }}
            inputValue={owner}
            onInputChange={(_event, newInputValue) => {
              handleFormValueChange("owner", newInputValue);
            }}
            options={["Propio", ...optionsPropietario]}
            fullWidth
            renderInput={(params) => (
              <TextField {...params} name="owner" label={t("_owner")} />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField
            label={t("id_location")}
            variant="outlined"
            type="text"
            name="location"
            placeholder={t("id_location")}
            value={location}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} display="flex" alignItems="center">
          <SecurityIcon sx={{ mx: 1 }} />
          <Typography variant="h5">{t("_insurance")}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t("insurance_company")}
            variant="outlined"
            type="text"
            name="insurence"
            value={insurence}
            fullWidth
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label={t("coverage_type")}
            variant="outlined"
            type="text"
            name="coverageType"
            value={coverageType}
            fullWidth
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label={t("policy_number")}
            variant="outlined"
            type="text"
            name="policyNumber"
            value={policyNumber}
            fullWidth
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            variant="outlined"
            type="date"
            label={t("insurance_start_date")}
            name="insurenceStartDate"
            value={insurenceStartDate}
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
            type="date"
            label={t("insurance_expiry_date")}
            name="insurenceDueDate"
            value={insurenceDueDate}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
      </Grid>
    </>
  );
};