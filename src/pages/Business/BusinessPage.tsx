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
import { uiCloseModal } from "../../redux/ui";
import { getLocalityAndStateByZipCode } from "../../utils/getDataZipCode";
import { useTranslation } from "react-i18next";
import { uploadFile } from "../../helpers/fileUpload";
// import Swal from "sweetalert2";
import { Business } from "../../interfaces/socialEntity";
import { ContractorRepository } from "../../classes/ContractorRepository";


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
  logoBusiness: { originalName: "", uniqueName: "" },
  taxSituation: ""
};

interface BusinessPageProps {
  isQuickAdd?: boolean;
}

export const BusinessPage: React.FC<BusinessPageProps> = ({ isQuickAdd = false }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
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
  const { dataCountry, getCountries } = useCountry();
  const { user } = useAppSelector(state => state.auth);
  const [contractorRepo] = useState(() => ContractorRepository.getInstance(user?.accountId));

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
              handleFormValueChange={handleFormValueChange} />
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
              setFormulario={setFormulario}
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
      dataCountry,
      handleInputChange,
      handleSelectChange,
      handleCheckboxChange,
      handleAddCategory,
      handleDeleteCategory,
    ]
  );

  const validateForm = () => {
    let hasError = false;

    const isCountryValid = !!formulario.pais?.trim();
    setCountryError(!isCountryValid);
    if (!isCountryValid) {
      hasError = true;
      console.log("Error de validación: País está vacío");
    }

    if (formulario.tipoEntidad === TipoEntidad.JURIDICA.toString()) {
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
    } else {
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
    }

    return !hasError;
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
    if (isQuickAdd) {
      // Si es un quick add desde modal, cerrar modal en lugar de navegar
      dispatch(uiCloseModal());
    } else {
      // Si es la página normal, navegar como antes
      navigate("/init/overview/business");
    }
  };

  const addNewBusiness = async () => {
    if (formulario.zipCode?.trim() !== "") {
      await getLocalityAndState();
    }
    if (!validateForm()) return;

    if (logoFile) {
      await uploadFile(logoFile);
    }
    
    // El usuario debe elegir manualmente las categorías, no se asignan automáticamente
    const createdBusiness = await createBusiness(formulario, isQuickAdd);
    
    // Si es adición rápida desde modal, actualizar el ContractorRepository y cerrar modal
    if (isQuickAdd && createdBusiness) {
      console.log("🚀 BusinessPage - Quick add successful, refreshing ContractorRepository...");
      console.log("📝 BusinessPage - Created business with categories:", createdBusiness.categorias);
      // Forzar actualización del ContractorRepository para que los autocompletes se actualicen
      await contractorRepo.refreshAndNotify();
      console.log("✅ BusinessPage - ContractorRepository refreshed, closing modal...");
      // Cerrar el modal
      dispatch(uiCloseModal());
    }
    
    reset();
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

  // La categoría por defecto se asignará solo al momento de guardar, no en el UI

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