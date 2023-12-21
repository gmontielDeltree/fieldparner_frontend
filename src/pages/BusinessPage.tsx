import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAppDispatch,
  useAppSelector,
  useBusiness,
  useForm,
} from "../hooks";
import { Business, TipoEntidad, CountryCode } from "../types";
import { AddressForm, CategoryTable, Loading } from "../components";
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
import { getLocalityAndStateByZipCode } from "../services";

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
  zipCode:"",
  provincia: "",
  pais: "",
  esEmpleado: false,
  legajo: "",
  matricula: "",
  categorias: [],
};

export const BusinessPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessActive } = useAppSelector((state) => state.business);
  const [activeStep, setActiveStep] = useState(0);
  const [nameError, setNameError] = useState(false);
  const [documentError, setDocumentError] = useState(false);
  const [countryError, setCountryError] = useState(false);
  const [legajoError, setLegajoError] = useState(false);
  const [cuitError, setCuitError] = useState(false);
  const [razonSocialError, setRazonSocialError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [localities, setLocalities] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([
    "Informacion",
    "Categoría",
    "Ubicacion",
  ]);
  const {
    formulario,
    setFormulario,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    reset,
  } = useForm<Business>(initialForm);
  const {
    isLoading,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    getBusinesses,
  } = useBusiness();

  const { zipCode } = formulario;

  const handleDeleteCategory = (category: string) => {
    setFormulario((prevState) => ({
      ...prevState,
      categorias: prevState.categorias.filter(
        (c) => c.toLowerCase() !== category.trim().toLowerCase()
      ),
    }));
  };
  const handleAddCategory = (category: string) => {
    setFormulario((prevState) => ({
      ...prevState,
      categorias: [category.trim(), ...prevState.categorias],
    }));
  };

  const getLocalityAndState = async () => {
    setLoadingZipCode(true);
    try {
      const localityAndStates = await getLocalityAndStateByZipCode(
        CountryCode.ARGENTINA,
        zipCode
      );

      if (localityAndStates?.length) {
        setLocalities(localityAndStates.map((x) => x.locality));
        setFormulario((prevState) => ({
          ...prevState,
          province: localityAndStates[0].state,
        }));
      }

      setLoadingZipCode(false);
    } catch (error) {
      setLoadingZipCode(false);
      console.log(error);
    }
  };

  const getStepContent = useMemo(
    () => (step: number) => {
      switch (step) {
        case 0:
          return (
            <BusinessForm
              key="information-business"
              values={formulario}
              nameError={nameError}
              documentError={documentError}
              legajoError={legajoError}
              cuitError={cuitError}
              emailError={emailError}
              razonSocialError={razonSocialError}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleCheckboxChange={handleCheckboxChange}
            />
          );
        case 1:
          return (
            <CategoryTable
              key="categories"
              categories={formulario.categorias}
              handleDeleteCategory={handleDeleteCategory}
              handleAddCategory={handleAddCategory}
            />
          );
        case 2:
          return (
            <AddressForm
                key="address-customer"
                values={formulario}
                countryError={countryError}
                handleInputChange={handleInputChange}
                onChangeZipCode={getLocalityAndState}
                loading={isLoading || loadingZipCode}
              />

          );
        default:
          throw new Error("Unknown step");
      }
    },
    [
      formulario,
      handleInputChange,
      handleSelectChange,
      handleCheckboxChange,
      handleAddCategory,
      handleDeleteCategory,
    ]
  );

  const validateForm = () => {
    if (formulario.tipoEntidad === TipoEntidad.JURIDICA.toString()) {
      
      let hasError = false;
  
      if (formulario.cuit?.trim() === "") {
        setCuitError(true);
        hasError = true;
      } else {
        setCuitError(false);
      }
  
      if (formulario.razonSocial?.trim() === "") {
        setRazonSocialError(true);
        hasError = true;
      } else {
        setRazonSocialError(false);
      }
  
      if (formulario.email?.trim() === "") {
        setEmailError(true);
        hasError = true;
      } else {
        setEmailError(false);
      }
  
      return !hasError;
    } else {
      // Validaciones para otros tipos de entidad
      let hasError = false;
  
      if (formulario.nombreCompleto?.trim() === "") {
        setNameError(true);
        hasError = true;
      } else {
        setNameError(false);
      }
  
      if (formulario.documento?.trim() === "") {
        setDocumentError(true);
        hasError = true;
      } else {
        setDocumentError(false);
      }
  
      if (formulario.esEmpleado && formulario.legajo?.trim() === "") {
        setLegajoError(true);
        hasError = true;
      } else {
        setLegajoError(false);
      }
  
      return !hasError;
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!validateForm()) {
        return;
      }
    }
  
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const onClickCancel = () => {
    // dispatch(removeCustomerActive());
    navigate("/init/overview/business");
  };

  const addNewBusiness = async () => {
    try {

      if (formulario.zipCode?.trim() !== "") {
        await getLocalityAndState();
      }

      if (!validateForm()) {
        return;
      }
      if (formulario.pais?.trim() === "") {
        setCountryError(true);
        return;
      } else {
        setCountryError(false);
      }
      await createBusiness(formulario);
      reset();
    } catch (error) {
      console.error("Error al agregar el negocio:", error);
    }
  };

  const handleUpdateBusiness = () => {
    
    if (!validateForm()) {
      return;
    }
    if (formulario._id) updateBusiness(formulario);

  };

  const handleDelete = () => {
    if (formulario._id && formulario._rev) {
      deleteBusiness(formulario._id, formulario._rev);
      reset();
    }
  };

  useEffect(() => {
    getBusinesses();
  }, []);

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
            {businessActive ? "Editar" : "Nueva"} Entidad Social
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
              {businessActive && (
                <Grid item xs={12} sm={3}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDelete}
                  >
                    Eliminar
                  </Button>
                </Grid>
              )}
            </Grid>
          </>
        </Paper>
      </Container>
    </>
  );
};