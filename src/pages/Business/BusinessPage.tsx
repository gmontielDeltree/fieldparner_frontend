import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAppDispatch,
  useAppSelector,
  useBusiness,
  useCountry,
  useForm,
} from "../../hooks";
import { TipoEntidad, CountryCode } from "../../types";
import { AddressForm, CategoryTable, Loading } from "../../components";
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
import { BusinessForm } from "../../components";
import { removeBusinessActive } from "../../redux/business";
import { getLocalityAndStateByZipCode } from "../../utils/getDataZipCode";
import { useTranslation } from "react-i18next";
import { uploadFile } from "../../helpers/fileUpload";
import Swal from "sweetalert2";
import { Business } from "../../interfaces/socialEntity";


const initialForm: Business = {
  accountId: "",
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
  zipCode: "",
  provincia: "",
  pais: "",
  esEmpleado: false,
  legajo: "",
  matricula: "",
  categorias: [],
  logoBusiness: "",
  taxSituation: ""
};

export const BusinessPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { businessActive } = useAppSelector((state) => state.business);
  const [activeStep, setActiveStep] = useState(0);
  const [nameError, setNameError] = useState(false);
  const [documentError, setDocumentError] = useState(false);
  const [countryError, _] = useState(false);
  const [legajoError, setLegajoError] = useState(false);
  const [cuitError, setCuitError] = useState(false);
  const [razonSocialError, setRazonSocialError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  // const [localities, setLocalities] = useState<string[]>([]);
  const steps = [t("id_information"), t("id_category"), t("id_location"),
  ];
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const {
    formulario,
    setFormulario,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    reset,
    handleFormValueChange,
  } = useForm<Business>(initialForm);
  const {
    isLoading,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    getBusinesses,
  } = useBusiness();
  const {dataCountry, getCountries} = useCountry();

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
        // setLocalities(localityAndStates.map((x) => x.locality));
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
              countries={dataCountry}
              countryError={countryError}  
              handleFormValueChange={handleFormValueChange}  />
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
              // countries={dataCountry}
              // countryError={countryError}
              handleInputChange={handleInputChange}
              onChangeZipCode={getLocalityAndState}
              loading={isLoading || loadingZipCode}
              handleFormValueChange={handleFormValueChange}
              setFile={setLogoFile} 
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
        console.log("Error de validación: CUIT está vacío");
      } else {
        setCuitError(false);
      }
  
      if (formulario.razonSocial?.trim() === "") {
        setRazonSocialError(true);
        hasError = true;
        console.log("Error de validación: Razón Social está vacía");
      } else {
        setRazonSocialError(false);
      }
  
      if (formulario.email?.trim() === "") {
        setEmailError(true);
        hasError = true;
        console.log("Error de validación: Email está vacío");
      } else {
        setEmailError(false);
      }
  
      return !hasError;
    } else {
      let hasError = false;
  
      if (formulario.nombreCompleto?.trim() === "") {
        setNameError(true);
        hasError = true;
        console.log("Error de validación: Nombre Completo está vacío");
      } else {
        setNameError(false);
      }
  
      if (formulario.documento?.trim() === "") {
        setDocumentError(true);
        hasError = true;
        console.log("Error de validación: Documento está vacío");
      } else {
        setDocumentError(false);
      }
  
      if (formulario.esEmpleado && formulario.legajo?.trim() === "") {
        setLegajoError(true);
        hasError = true;
        console.log("Error de validación: Legajo está vacío");
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
    console.log("Agregando nuevo negocio con los siguientes datos del formulario:", formulario);
    try {
      if (formulario.zipCode?.trim() !== "") {
        console.log("Obteniendo localidad y estado...");
        await getLocalityAndState();
        console.log("Localidad y estado obtenidos.");
      }
  
      if (!validateForm()) {
        console.log("La validación del formulario falló.");
        return;
      }
  
      console.log("La validación del formulario pasó.");
  
      // if (formulario.pais?.trim() === "") {
      //   setCountryError(true);
      //   console.log("La validación del país falló.");
      //   return;
      // } else {
      //   setCountryError(false);
      // }
  
      if (logoFile) {
        console.log("Subiendo archivo de logo:", logoFile);
        await uploadFile(logoFile);
        console.log("Archivo de logo subido.");
      }
  
      console.log("Creando negocio...");
      const response = await createBusiness(formulario);
      console.log("Respuesta de creación de negocio:", response);
  
      // Mostrar un mensaje de éxito usando Swal
      Swal.fire({
        title: 'Entidad Social',
        text: 'Agregaste una entidad con éxito',
        icon: 'success',
        confirmButtonText: 'OK'
      });
  
      reset();
  
    } catch (error) {
      console.error("Error al agregar el negocio:", error);
  
      // Mostrar un mensaje de error usando Swal
      Swal.fire({
        title: 'Error',
        text: 'Error al agregar una entidad',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };
  
  
  
  const handleUpdateBusiness = async () => {
    if (!validateForm()) {
      return;
    }
    if (formulario._id) {
      if (logoFile) await uploadFile(logoFile);
      updateBusiness(formulario);
    }

  };

  const handleDelete = () => {
    if (formulario._id && formulario._rev) {
      deleteBusiness(formulario._id, formulario._rev);
      reset();
    }
  };

  useEffect(() => {
    getBusinesses();
    getCountries();
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
            {businessActive ? t("icon_edit") : t("new_famale")} {' '}
            {t("social_entities")}
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
                <Button 
                  variant="contained"
                  color="inherit"
                   onClick={activeStep !== 0 ? handleBack : onClickCancel}>
                  {activeStep !== 0 ? t("id_back") : t("id_cancel")}
                </Button>
              </Grid>
              <Grid item xs={12} sm={3} key="grid-next">
                {!(activeStep === steps.length - 1) && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                  >
                    {t("id_next")}
                  </Button>
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={
                    businessActive ? handleUpdateBusiness : addNewBusiness
                  }
                >
                  {!businessActive ? t("_add") : t("id_update")} {' '}
                </Button>
              </Grid>
              {businessActive && (
                <Grid item xs={12} sm={3}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDelete}
                  >
                    {t("icon_delete")}
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