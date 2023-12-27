import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
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
// import {
//   createTypeVehicles,
//   // getTypeVehicles as getTypeVehiclesService,
// } from "../../services";

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
  } = vehiculo;
  // const [typeVehicles, setTypeVehicles] = useState<string[]>([]);
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

  // useEffect(() => {
  //   const getTypeVehicles = async (): Promise<string[]> => {
  //     const response = await getTypeVehiclesService();
  //     const types: string[] = response.map((v: any) => v.name);

  //     setTypeVehicles(types);
  //     return types;
  //   };

  //   getTypeVehicles();
  // }, []);

  useEffect(() => {
    getTypeVehicles();
    getBusinesses();
  }, []);

  return (
    <>
      <Grid
        container
        spacing={3}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item xs={12} display="flex" alignItems="center">
          <FolderOpenIcon sx={{ mx: 1 }} />
          <Typography variant="h5">Datos Generales</Typography>
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
              <TextField {...params} label="Tipo de Vehiculo" required />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Marca"
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
            label="Modelo"
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
            label="Año"
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
            label="Patente"
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
              <TextField {...params} name="owner" label="Propietario" />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Ubicacion"
            variant="outlined"
            type="text"
            name="location"
            placeholder="Ubicacion"
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
          <Typography variant="h5">Seguro</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Compañía de seguro"
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
            label="Tipo de Cobertura"
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
            label="Numero de Póliza"
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
            label="Fecha de Inicio del Seguro"
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
            label="Fecha Vencimiento del Seguro"
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