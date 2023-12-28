import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Container,
  Grid,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { TemplateLayout } from "../components";
import { Vehicle } from "@types";
import { useAppDispatch, useAppSelector, useForm, useVehicle } from "../hooks";
import {
  removerVehiculoActivo,
} from "../redux/vehicle";
import {
  DatosGenerales,
  Especificaciones,
  Mantenimientos,
} from "../components/NuevoVehiculo";

const initialState: Vehicle = {
  vehicleType: "",
  patent: "",
  make: "",
  model: "",
  modelYear: "",
  tara: 0,
  net: 0,
  fuelType: "",
  fuelCapacity: 0,
  unitMeasurement: "",
  connectivity: "",
  policyNumber: "",
  insurence: "",
  coverageType: "",
  owner: "",
  lastMaintenance: "",
  insurenceStartDate: "",
  insurenceDueDate: "",
  gross: 0,
  location: "",
  technialSpecifications: [],
  maintenances: [],
  chassis: "",
  truckTrailer: ""
};

const steps = [
  "Datos Generales",
  "Especificaciones Tecnicas",
  "Mantenimientos",
];

export const VehiclePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { vehiculoActivo } = useAppSelector((state) => state.vehiculo);
  const [activeStep, setActiveStep] = useState(0);
  const {
    formulario,
    setFormulario,
    handleInputChange,
    handleSelectChange,
    handleYearChange,
    handleFormValueChange,
  } = useForm(initialState);
  const { createVehicle, updateVehicle } = useVehicle();

  const getStepContent = useMemo(
    () => (step: number) => {
      switch (step) {
        case 0:
          return (
            <DatosGenerales
              vehiculo={formulario}
              handleInputChange={handleInputChange}
              handleFormValueChange={handleFormValueChange}
              handleYearChange={handleYearChange}
            />
          );
        case 1:
          return (
            <Especificaciones
              vehiculo={formulario}
              setVehiculo={setFormulario}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
            />
          );
        case 2:
          return (
            <Mantenimientos vehiculo={formulario} setVehiculo={setFormulario} />
          );
        default:
          throw new Error("Step no encontrado.");
      }
    },
    [
      formulario,
      setFormulario,
      handleInputChange,
      handleSelectChange,
      handleYearChange,
      handleFormValueChange,
    ]
  );

  const onClickCancelar = useCallback(() => {
    dispatch(removerVehiculoActivo());
    navigate("/init/overview/vehicle");
  }, []);

  const onClickAddVehiculo = useCallback(
    (e: any) => {
      e.preventDefault();

      const { vehicleType: tipoVehiculo, make: marca, model: modelo } = formulario;
      if (!tipoVehiculo || !marca || !modelo) return;

      createVehicle(formulario);

      navigate("/init/overview/vehicle");
    },
    [formulario, dispatch]
  );

  const onClickUpdateVehicle = useCallback(
    (e: any) => {
      e.preventDefault();
      
      if (formulario._id)
        updateVehicle(formulario);

      navigate("/init/overview/vehicle");
    },
    [formulario, dispatch]
  );

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  useEffect(() => {
    if (vehiculoActivo) setFormulario(vehiculoActivo);
    else setFormulario(initialState);
  }, [vehiculoActivo, setFormulario]);

  return (
    <TemplateLayout key="vehicle-page" viewMap={true}>
      <Container
        maxWidth="lg"
        sx={{
          margin: 0,
          p: { sm: 0, md: 0 },
          mb: 1,
        }}
      >
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 1 } }}
        >
          <Typography
            component="h2"
            align="center"
            variant="h4"
            sx={{ ml: { sm: 2 } }}
          >
            {!vehiculoActivo ? "Nuevo Vehiculo" : "Actualizar Vehiculo"}
          </Typography>
          <Stepper activeStep={activeStep} sx={{ pt: 5, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <>
            {getStepContent(activeStep)}
            <Grid
              container
              spacing={2}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mt: { sm: 5 } }}
            >
              <Grid item xs={12} sm={3}>
                <Button
                  variant="contained"
                  color="inherit"
                  onClick={activeStep !== 0 ? handleBack : onClickCancelar}
                  sx={{ ml: 1 }}
                >
                  {activeStep !== 0 ? "Volver" : "Cancelar"}
                </Button>
              </Grid>
              <Grid item xs={12} sm={3}>
                {!(activeStep === steps.length - 1) && (
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    fullWidth
                  >
                    Siguiente
                  </Button>
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  onClick={
                    vehiculoActivo ? onClickUpdateVehicle : onClickAddVehiculo
                  }
                  fullWidth
                >
                  {!vehiculoActivo ? "Guardar" : "Actualizar"}
                </Button>
              </Grid>
            </Grid>
          </>
        </Paper>
      </Container>
    </TemplateLayout>
  );
};