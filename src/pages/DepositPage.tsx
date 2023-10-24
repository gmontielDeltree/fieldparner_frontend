import React, { useEffect, useMemo, useState } from "react";
import { Loading, TemplateLayout } from "../components";
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Warehouse as WarehouseIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useAppDispatch,
  useAppSelector,
  useBusiness,
  useDeposit,
  useForm,
} from "../hooks";
import { CountryCode, Deposit, TipoEntidad } from "../types";
import { removeDepositActive } from "../redux/deposit";
import { getLocalityAndStateByZipCode } from "../services";

const initialForm: Deposit = {
  descripcion: "",
  codigoPostal: "",
  domicilio: "",
  geolocalizacion: "",
  localidad: "",
  esNegativo: false,
  esVirtual: false,
  pais: "",
  propietario: "Propio",
  provincia: "",
};

const optionsCountry = ["Argentina", "Brasil", "Chile"];

export const DepositPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [localities, setLocalities] = useState<string[]>([]);
  const { depositActive } = useAppSelector((state) => state.deposit);
  const {
    formulario,
    setFormulario,
    handleInputChange,
    handleFormValueChange,
    handleCheckboxChange,
    handleSelectChange,
    reset,
  } = useForm(initialForm);
  const { isLoading, createDeposit, updateDeposit } = useDeposit();
  const {
    getBusinesses,
    businesses,
    isLoading: loadingBusiness,
  } = useBusiness();

  const {
    descripcion,
    propietario,
    codigoPostal,
    domicilio,
    geolocalizacion,
    localidad,
    provincia,
    pais,
    esNegativo,
    esVirtual,
  } = formulario;

  const optionsPropietario = useMemo(() => {
    return businesses
      .filter((business) => business.tipoEntidad == TipoEntidad.JURIDICA)
      .map((business) => business.razonSocial || "");
  }, [businesses]);

  const onClickCancel = () => navigate("/init/overview/deposit");

  const handleUpdateDeposit = () => {
    if (formulario._id) {
      updateDeposit(formulario);
      dispatch(removeDepositActive());
    }
  };

  const handleAddDeposit = () => {
    createDeposit(formulario);
    reset();
  };

  const getLocalityAndState = async () => {
    setLoadingZipCode(true);
    try {
      const localityAndStates = await getLocalityAndStateByZipCode(
        CountryCode.ARGENTINA,
        codigoPostal
      );

      if (localityAndStates?.length) {
        setLocalities(localityAndStates.map((x) => x.locality));
        setFormulario((prevState) => ({
          ...prevState,
          provincia: localityAndStates[0].state,
        }));
      }

      setLoadingZipCode(false);
    } catch (error) {
      setLoadingZipCode(false);
      console.log(error);
    }
  };

  const onBlurZipCode = () => {
    if (codigoPostal !== "") getLocalityAndState();
  };

  useEffect(() => {
    if (depositActive) setFormulario(depositActive);
    else setFormulario(initialForm);
  }, [depositActive]);

  useEffect(() => {
    return () => {
      dispatch(removeDepositActive());
    };
  }, [dispatch]);

  useEffect(() => {
    getBusinesses();
  }, []);

  return (
    <TemplateLayout key="overview-deposit" viewMap={true}>
      <Loading key="loading-deposit" loading={isLoading || loadingZipCode} />
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 } }}
      >
        <Box className="text-center">
          <WarehouseIcon />
        </Box>
        <Typography
          component="h1"
          variant="h4"
          align="center"
          sx={{ mt: 1, mb: 7 }}
        >
          {depositActive ? "Editar" : "Agregar Nuevo"} Deposito
        </Typography>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              type="text"
              label="Descripcion"
              name="descripcion"
              value={descripcion}
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
          <Grid item xs={12} sm={4}>
            <Box display="flex" justifyContent="center" alignItems="center">
              <Typography variant="body1" display="inline-block">
                Fisico
              </Typography>
              <Switch
                name="esVirtual"
                checked={esVirtual}
                onChange={handleCheckboxChange}
              />
              <Typography variant="body1" display="inline-block">
                Virtual
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  name="esNegativo"
                  checked={esNegativo}
                  onChange={handleCheckboxChange}
                />
              }
              label="Admite Negativo"
              labelPlacement="start"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              variant="outlined"
              type="text"
              label="Geolocalizacion"
              name="geolocalizacion"
              value={geolocalizacion}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="label-pais">Pais</InputLabel>
              <Select
                labelId="label-pais"
                name="pais"
                value={pais}
                label="Pais"
                onChange={handleSelectChange}
              >
                {optionsCountry.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4}>
            <TextField
              variant="outlined"
              type="number"
              label="CP"
              name="codigoPostal"
              value={codigoPostal}
              onBlur={() => onBlurZipCode()}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <TextField
              variant="outlined"
              type="text"
              label="Provincia"
              name="provincia"
              value={provincia}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Autocomplete
              id="localidad"
              freeSolo
              loading={loadingZipCode}
              value={localidad}
              onChange={(_event: any, newValue: string | null) => {
                newValue && handleFormValueChange("localidad", newValue);
              }}
              inputValue={localidad}
              onInputChange={(_event, newInputValue) => {
                handleFormValueChange("localidad", newInputValue);
              }}
              options={localities}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} name="localidad" label="Localidad" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              variant="outlined"
              type="text"
              label="Domicilio"
              name="domicilio"
              value={domicilio}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid
          container
          spacing={1}
          alignItems="center"
          justifyContent="space-around"
          sx={{ mt: 3 }}
        >
          <Grid item xs={12} sm={3}>
            <Button onClick={onClickCancel}>Cancelar</Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={depositActive ? handleUpdateDeposit : handleAddDeposit}
            >
              {!depositActive ? "Agregar" : "Actualizar"}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </TemplateLayout>
  );
};
