import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { TipoEntidad, Vehicle } from "../../types";
import { useAppSelector, useBusiness } from "../../hooks";
import {
  FolderOpen as FolderOpenIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import {
  createTypeVehicles,
  getTypeVehicles as getTypeVehiclesService,
} from "../../services";

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
  const { vehiculoActivo } = useAppSelector((state) => state.vehiculo);
  const disabledFields = !!vehiculoActivo;
  const {
    tipoVehiculo,
    patente,
    marca,
    modelo,
    año,
    propietario,
    nroPoliza,
    seguro,
    seguroFechaInicio,
    seguroFechaVencimiento,
    tipoCobertura,
    ubicacion,
  } = vehiculo;
  const [typeVehicles, setTypeVehicles] = useState<string[]>([]);
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
      tV.toLowerCase().trim() === tipoVehiculo.toString().toLowerCase().trim();

    if (tipoVehiculo !== "" && !typeVehicles.some(checkTipoVehiculo)) {
      await createTypeVehicles(tipoVehiculo);
    }
  };

  useEffect(() => {
    const getTypeVehicles = async (): Promise<string[]> => {
      const response = await getTypeVehiclesService();
      const types: string[] = response.map((v: any) => v.name);

      setTypeVehicles(types);
      return types;
    };

    getTypeVehicles();
  }, []);

  useEffect(() => {
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
            id="tipoVehiculo"
            value={tipoVehiculo}
            freeSolo
            options={typeVehicles}
            disabled={disabledFields}
            onBlur={() => handleOnBlurTipoVehiculo()}
            onChange={(_event: any, newValue: string | null) => {
              newValue && handleFormValueChange("tipoVehiculo", newValue);
            }}
            inputValue={tipoVehiculo}
            onInputChange={(_event, newInputValue) => {
              handleFormValueChange("tipoVehiculo", newInputValue);
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
            name="marca"
            value={marca}
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
            name="modelo"
            value={modelo}
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
            name="año"
            value={año}
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
            name="patente"
            value={patente}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start" />,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            id="propietario"
            freeSolo
            loading={loadingBusiness}
            value={propietario}
            onChange={(_event: any, newValue: string | null) => {
              newValue && handleFormValueChange("propietario", newValue);
            }}
            inputValue={propietario}
            onInputChange={(_event, newInputValue) => {
              handleFormValueChange("propietario", newInputValue);
            }}
            options={["Propio", ...optionsPropietario]}
            fullWidth
            renderInput={(params) => (
              <TextField {...params} name="propietario" label="Propietario" />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Ubicacion"
            variant="outlined"
            type="text"
            name="ubicacion"
            placeholder="Ubicacion"
            value={ubicacion}
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
            name="seguro"
            value={seguro}
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
            name="tipoCobertura"
            value={tipoCobertura}
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
            name="nroPoliza"
            value={nroPoliza}
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
            name="seguroFechaInicio"
            value={seguroFechaInicio}
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
            name="seguroFechaVencimiento"
            value={seguroFechaVencimiento}
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