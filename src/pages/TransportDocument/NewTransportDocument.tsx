

import { Button, Container, Grid, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { Loading } from '../../components';
import { useAppDispatch, useAppSelector, useBusiness, useCategory, useCompany, useCrops, useExitField, useField, useForm, useTransportDocument, useVehicle } from '../../hooks';
import { TransportDocument } from '../../interfaces/transportDocument';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ComercioGranoForm, DestinatarioForm, GranoTransportadoForm, RemitenteForm, TransportistaForm } from '../../components/TransportDocument';
import { getShortDate } from '../../helpers/dates';
import { EnumTipoFlete, EnumTransportDocumentStatus, ExitFieldItem, TipoEntidad } from '../../types';
import { uploadFile } from '../../helpers/fileUpload';
import { uiFinishLoading, uiStartLoading } from '../../redux/ui';


const steps = ["Remitente", "Granos Transportados", "Comercio Granos", "Destinatario", "Transportista"];

const initialForm: TransportDocument = {
  accountId: "",
  licenceId: "",
  contractId: "",
  nroCartaPorte: "",
  fechaEmision: getShortDate(true, "-"),
  fechaVencimiento: getShortDate(false, "-"),
  nroCTG: "",
  arancel: "",
  contrato: "",
  cuitGenerador: "",
  cuitCompania: "",
  categoriaEntidadId: "",
  salidaCampoId: "",
  nroOperadorONCCA: "",
  cpSalidaCampo: "",
  nroPlantaONCCA: "",
  cuitRemitenteComercialPrimario: "",
  cuitRemitenteComercialSecundario: "",
  cuitRemitenteComercialSecundario2: "",
  cuitMAT: "",
  cuitComercialVentaPrimaria: "",
  cuitComercialVentaSecundaria: "",
  cuitRepresentanteEntrega: "",
  cuitRepresentanteRecibidor: "",
  cpGenerador: "",
  kgEstimado: 0,
  kgBruto: 0,
  kgTara: 0,
  kgNeto: 0,
  cuitComprador: "",
  cuitAsignadorCupo: "",
  nroCupo: "",
  fechaCupo: "",
  cuitDestinatario: "",
  esCampo: false,
  campoDestinatario: "",
  loteDestinatario: "",
  cuitDestino: "",
  domicilioDestino: "",
  localidadDestino: "",
  cpDestino: "",
  provinciaDestino: "",
  cuitTransportista: "",
  razonSocialTransportista: "",
  cuitChofer: "",
  vehiculoIdChasis: "",
  vehiculoIdAcoplado1: "",
  vehiculoIdAcoplado2: "",
  razonSocialChofer: "",
  kmARecorrer: 0,
  tipoFlete: EnumTipoFlete.APAGAR,
  tarifaRef: 0,
  tarifaTT: 0,
  calidadEnvoltura: "",
  calidad: "",
  fechaPartida: "",
  cuitPagadorFlete: "",
  cuitIntermediarioFlete: "",
  status: EnumTransportDocumentStatus.GENERADA,
  observaciones: "",
  fileName: "",
};

export const NewTransportDocument: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.ui);
  const { businesses: socialEntities, getBusinesses } = useBusiness(); // Proveedores/Empleados
  const { companies, getCompanies } = useCompany(); //Compañia
  const { dataCrops: crops, getCrops } = useCrops(); // Cultivo
  const { vehicles, getVehicles } = useVehicle(); //Vehiculo
  const { categories, getCategories } = useCategory(); //Categoria Entidades
  const { fields, getFields } = useField(); // Campo
  const { exitFields, getExitFields } = useExitField();
  const { t } = useTranslation();
  const { addTransportDocument } = useTransportDocument();
  const [selectedFieldOutput, setSelectedFieldOutput] = useState<ExitFieldItem | null>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const {
    formulario,
    // setFormulario,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    reset,
    handleFormValueChange,
  } = useForm<TransportDocument>(initialForm);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleUploadDocumentFile = async () => {
    if (documentFile) {
      await uploadFile(documentFile);
    }
  }

  const onClickCancel = () => {
    // dispatch(removeCustomerActive());
    navigate("/init/overview/transport-documents");
  };

  const onClickNewTransportDocument = async () => {
    try {
      dispatch(uiStartLoading());
      await addTransportDocument(formulario);
      await handleUploadDocumentFile();
      dispatch(uiFinishLoading());
      reset();
      navigate("/init/overview/transport-documents");
    } catch (error) {
      console.log('error', error);
      dispatch(uiFinishLoading());
    }
  }

  const onClickUpdateTransportDocument = () => {
    console.log(formulario);
  }

  const changeSelectedExitField = (item: ExitFieldItem) => setSelectedFieldOutput(item);

  const getStepContent = useMemo(
    () => (step: number) => {
      switch (step) {
        case 0:
          return (
            <RemitenteForm
              formValues={formulario}
              companies={companies}
              categories={categories}
              exitFields={exitFields}
              providers={socialEntities.filter(x => x.tipoEntidad === TipoEntidad.JURIDICA)}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              changeExitField={changeSelectedExitField} />
          );
        case 1:
          return (
            <GranoTransportadoForm
              formValues={formulario}
              companies={companies}
              categories={categories}
              exitFields={exitFields}
              providers={socialEntities.filter(x => x.tipoEntidad === TipoEntidad.JURIDICA)}
              selectedFieldOutput={selectedFieldOutput}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange} />
          );
        case 2:
          return (
            <ComercioGranoForm
              formValues={formulario}
              companies={companies}
              categories={categories}
              exitFields={exitFields}
              providers={socialEntities.filter(x => x.tipoEntidad === TipoEntidad.JURIDICA)}
              selectedFieldOutput={selectedFieldOutput}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange} />
          );
        case 3:
          return (
            <DestinatarioForm
              formValues={formulario}
              companies={companies}
              categories={categories}
              exitFields={exitFields}
              providers={socialEntities.filter(x => x.tipoEntidad === TipoEntidad.JURIDICA)}
              selectedFieldOutput={selectedFieldOutput}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleCheckboxChange={handleCheckboxChange}
              handleFormValueChange={handleFormValueChange} />
          );
        case 4:
          return (
            <TransportistaForm
              formValues={formulario}
              vehicles={vehicles}
              exitFields={exitFields}
              providers={socialEntities.filter(x => x.tipoEntidad === TipoEntidad.JURIDICA)}
              selectedFieldOutput={selectedFieldOutput}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleCheckboxChange={handleCheckboxChange}
              handleFormValueChange={handleFormValueChange}
              deleteFile={() => setDocumentFile(null)}
              fileUpload={(file) => setDocumentFile(file)}
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
      companies,
      socialEntities,
      vehicles,
      crops,
      categories,
      fields,
      exitFields,
      selectedFieldOutput
    ]
  );

  useEffect(() => {
    getBusinesses();
    getCompanies();
    getCrops();
    getVehicles();
    getCategories();
    getFields();
    getExitFields();
  }, [])


  return (

    <Container maxWidth="lg" sx={{ ml: 0, borderRadius: "10px" }}>
      <Loading loading={isLoading} />
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Typography component="h1" variant="h4" align="left" sx={{ mb: 3 }}>
          Carta de Porte - {steps[activeStep]}
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 3, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <>
          <form>
            {getStepContent(activeStep)}
            <Grid
              container
              spacing={1}
              alignItems="center"
              justifyContent="space-around"
              sx={{ mt: 5 }}
            >
              <Grid item xs={12} sm={3} key="grid-back">
                <Button onClick={activeStep !== 0 ? handleBack : onClickCancel}>
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
                  hidden={activeStep !== steps.length - 1}
                  color="success"
                  onClick={
                    formulario._id ? () => onClickUpdateTransportDocument() : () => onClickNewTransportDocument()
                  }
                >
                  {!formulario._id ? t("_add") : t("id_update")} {' '}
                </Button>
              </Grid>
              {/* {formulario._id && (
                <Grid item xs={12} sm={3}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => console.log}
                  >
                    {t("icon_delete")}
                  </Button>
                </Grid>
              )} */}
            </Grid>
          </form>
        </>
      </Paper>
    </Container>
  )
}

