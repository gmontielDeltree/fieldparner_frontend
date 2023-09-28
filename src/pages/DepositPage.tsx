import React, { useEffect } from "react";
import { Loading, TemplateLayout } from "../components";
import {
  Box,
  Button,
  Container,
  FormControlLabel,
  Grid,
  InputAdornment,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Warehouse as WarehouseIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector, useDeposit, useForm } from "../hooks";
import { Deposit } from "@types";
import { removeDepositActive } from "../redux/deposit";

const initialForm: Deposit = {
  descripcion: "",
  codigoPostal: "",
  domicilio: "",
  geolocalizacion: "",
  localidad: "",
  esNegativo: false,
  esVirtual: false,
  pais: "",
  propietario: "",
  provincia: "",
};

export const DepositPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { depositActive } = useAppSelector((state) => state.deposit);
  const {
    formulario,
    setFormulario,
    handleInputChange,
    // handleSelectChange,
    handleCheckboxChange,
    reset,
  } = useForm(initialForm);
  const { isLoading, createDeposit, updateDeposit } = useDeposit();

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

  const onClickCancel = () => navigate("/init/overview/supply");

  const handleUpdateDeposit = () => {
    if (formulario._id) {
      updateDeposit(formulario);
      dispatch(removeDepositActive());
      navigate("/init/overview/deposit");
    }
  };

  const handleAddDeposit = () => {
    createDeposit(formulario);
    navigate("/init/overview/deposit");
    reset();
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

  return (
    <TemplateLayout key="overview-deposit" viewMap={true}>
      <Loading key="loading-deposit" loading={isLoading} />
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 } }}
      >
        <Box className="text-center">
          <WarehouseIcon />
        </Box>
        <Typography component="h1" variant="h4" align="center" sx={{ my: 3 }}>
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
            <TextField
              variant="outlined"
              type="text"
              label="Propietario"
              name="propietario"
              value={propietario}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              // className="d-flex justify-content-center"
              control={
                <Switch
                  name="esVirtual"
                  checked={esVirtual}
                  onChange={handleCheckboxChange}
                />
              }
              label="Fisico / Virtual"
              labelPlacement="start"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              // className="d-flex justify-content-end"
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
            <TextField
              variant="outlined"
              type="text"
              label="Pais"
              name="pais"
              value={pais}
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
            <TextField
              variant="outlined"
              type="text"
              label="Localidad"
              name="localidad"
              value={localidad}
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
          <Grid item xs={6} sm={3}>
            <TextField
              variant="outlined"
              type="number"
              label="CP"
              name="codigoPostal"
              value={codigoPostal}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start" />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={3}></Grid>
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
