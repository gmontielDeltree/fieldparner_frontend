import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector, useBusiness, useForm } from "../hooks";
import { Business, TipoEntidad } from "../types";
import { AddressForm, Loading } from "../components";
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
import { BusinessForm } from "../components";
import { removeBusinessActive } from "../redux/business";

const initialForm: Business = {
  nombreCompleto: "",
  documento: "",
  telefono: "",
  email: "",
  tipoEntidad: TipoEntidad.FISICA.toString(),
  razonSocial: "",
  cuit: "",
  contactoPrincipal: "",
  contactoSecundario: "",
  sitioWeb: "",
  domicilio: "",
  localidad: "",
  cp: "",
  provincia: "",
  pais: "",
  esEmpleado: false,
  legajo: "",
  matricula: "",
};

export const BusinessPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessActive } = useAppSelector((state) => state.business);
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState<string[]>(["Informacion", "Ubicacion"]);
  const {
    formulario,
    setFormulario,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    reset,
  } = useForm<Business>(initialForm);
  const { isLoading, createBusiness, updateBusiness } = useBusiness();

  const getStepContent = useMemo(
    () => (step: number) => {
      switch (step) {
        case 0:
          return (
            <BusinessForm
              key="information-business"
              values={formulario}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleCheckboxChange={handleCheckboxChange}
            />
          );
        case 1:
          return (
            <AddressForm
              key="address-customer"
              values={formulario}
              handleInputChange={handleInputChange}
            />
          );
        default:
          throw new Error("Unknown step");
      }
    },
    [formulario, handleInputChange, handleSelectChange, handleCheckboxChange]
  );

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const onClickCancel = () => {
    // dispatch(removeCustomerActive());
    navigate("/init/overview/business");
  };

  const addNewBusiness = () => {
    createBusiness(formulario);
    reset();
    navigate("/init/overview/business");
  };

  const handleUpdateBusiness = () => {
    if (formulario.id) updateBusiness(formulario.id, formulario);
  };

  useEffect(() => {
    if (businessActive) setFormulario(businessActive);
    else setFormulario(initialForm);
  }, [businessActive]);

  useEffect(() => {
    return () => {
      dispatch(removeBusinessActive());
    };
  }, [dispatch]);

  return (
    <>
      <Loading key="loading-business" loading={isLoading} />
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            {businessActive ? "Editar" : "Nueva"} Empresa/Persona
          </Typography>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 3, mb: 2 }}>
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
              spacing={1}
              alignItems="center"
              justifyContent="space-around"
              sx={{ mt: { sm: 5 } }}
            >
              <Grid item xs={12} sm={3} key="grid-back">
                <Button onClick={activeStep !== 0 ? handleBack : onClickCancel}>
                  {activeStep !== 0 ? "Volver" : "Cancelar"}
                </Button>
              </Grid>
              <Grid item xs={12} sm={3} key="grid-next">
                {!(activeStep === steps.length - 1) && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleNext}
                  >
                    Siguiente
                  </Button>
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={
                    businessActive ? handleUpdateBusiness : addNewBusiness
                  }
                >
                  {!businessActive ? "Agregar" : "Actualizar"}
                </Button>
              </Grid>
            </Grid>
          </>
        </Paper>
      </Container>
    </>
  );
};
