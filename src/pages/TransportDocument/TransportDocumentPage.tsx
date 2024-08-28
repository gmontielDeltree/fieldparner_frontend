

import { Button, Container, Grid, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { Loading } from '../../components';
import { FormValueState, useAppDispatch, useAppSelector, useBusiness, useCategory, useCompany, useCrops, useExitField, useField, useFormValue, useTransportDocument, useVehicle } from '../../hooks';
import { TransportDocument } from '../../interfaces/transportDocument';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ComercioGranoForm, DestinatarioForm, GranoTransportadoForm, RemitenteForm, TransportistaForm } from '../../components/TransportDocument';
// import { getShortDate } from '../../helpers/dates';
import { EnumTipoFlete, EnumTransportDocumentStatus, ExitFieldItem, TipoEntidad } from '../../types';
import { uploadFile } from '../../helpers/fileUpload';
import { uiFinishLoading, uiStartLoading } from '../../redux/ui';

type LabelProps = {
  text: string;
  error?: boolean;
  optional?: React.ReactNode;
};


const initialForm: FormValueState<TransportDocument> = {
  accountId: { value: "", required: true, isError: false, message: "" },
  licenceId: { value: "", required: true, isError: false, message: "" },
  contractId: { value: "", required: true, isError: false, message: "" },
  nroCartaPorte: { value: "", required: true, isError: false, message: "" },
  fechaEmision: { value: "", required: true, isError: false, message: "" },
  fechaVencimiento: { value: "", required: true, isError: false, message: "" },
  nroCTG: { value: "", required: false, isError: false, message: "" },
  arancel: { value: "", required: false, isError: false, message: "" },
  contrato: { value: "", required: false, isError: false, message: "" },
  cuitGenerador: { value: "", required: true, isError: false, message: "" },
  cuitCompania: { value: "", required: true, isError: false, message: "" },
  categoriaEntidadId: { value: "", required: true, isError: false, message: "" },
  salidaCampoId: { value: "", required: true, isError: false, message: "" },
  nroOperadorONCCA: { value: "", required: false, isError: false, message: "" },
  cpSalidaCampo: { value: "", required: true, isError: false, message: "" },
  nroPlantaONCCA: { value: "", required: false, isError: false, message: "" },
  cuitRemitenteComercialPrimario: { value: "", required: false, isError: false, message: "" },
  cuitRemitenteComercialSecundario: { value: "", required: false, isError: false, message: "" },
  cuitRemitenteComercialSecundario2: { value: "", required: false, isError: false, message: "" },
  cuitMAT: { value: "", required: false, isError: false, message: "" },
  cuitComercialVentaPrimaria: { value: "", required: false, isError: false, message: "" },
  cuitComercialVentaSecundaria: { value: "", required: false, isError: false, message: "" },
  cuitRepresentanteEntrega: { value: "", required: false, isError: false, message: "" },
  cuitRepresentanteRecibidor: { value: "", required: false, isError: false, message: "" },
  cpGenerador: { value: "", required: false, isError: false, message: "" },
  kgEstimado: { value: 0, required: true, isError: false, message: "" },
  kgBruto: { value: 0, required: true, isError: false, message: "" },
  kgTara: { value: 0, required: true, isError: false, message: "" },
  kgNeto: { value: 0, required: false, isError: false, message: "" },
  cuitComprador: { value: "", required: true, isError: false, message: "" },
  cuitAsignadorCupo: { value: "", required: false, isError: false, message: "" },
  nroCupo: { value: "", required: false, isError: false, message: "" },
  fechaCupo: { value: "", required: false, isError: false, message: "" },
  cuitDestinatario: { value: "", required: true, isError: false, message: "" },
  esCampo: { value: false, required: false, isError: false, message: "" },
  campoDestinatario: { value: "", required: false, isError: false, message: "" },
  loteDestinatario: { value: "", required: false, isError: false, message: "" },
  cuitDestino: { value: "", required: true, isError: false, message: "" },
  domicilioDestino: { value: "", required: false, isError: false, message: "" },
  localidadDestino: { value: "", required: false, isError: false, message: "" },
  cpDestino: { value: "", required: false, isError: false, message: "" },
  provinciaDestino: { value: "", required: false, isError: false, message: "" },
  cuitTransportista: { value: "", required: true, isError: false, message: "" },
  razonSocialTransportista: { value: "", required: false, isError: false, message: "" },
  cuitChofer: { value: "", required: true, isError: false, message: "" },
  vehiculoIdChasis: { value: "", required: true, isError: false, message: "" },
  vehiculoIdAcoplado1: { value: "", required: false, isError: false, message: "" },
  vehiculoIdAcoplado2: { value: "", required: false, isError: false, message: "" },
  razonSocialChofer: { value: "", required: false, isError: false, message: "" },
  kmARecorrer: { value: 0, required: false, isError: false, message: "" },
  tipoFlete: { value: EnumTipoFlete.APAGAR, required: false, isError: false, message: "" },
  tarifaRef: { value: 0, required: false, isError: false, message: "" },
  tarifaTT: { value: 0, required: false, isError: false, message: "" },
  calidadEnvoltura: { value: "", required: false, isError: false, message: "" },
  calidad: { value: "", required: false, isError: false, message: "" },
  fechaPartida: { value: "", required: false, isError: false, message: "" },
  cuitPagadorFlete: { value: "", required: true, isError: false, message: "" },
  cuitIntermediarioFlete: { value: "", required: false, isError: false, message: "" },
  status: { value: EnumTransportDocumentStatus.GENERADA, required: false, isError: false, message: "" },
  observaciones: { value: "", required: false, isError: false, message: "" },
  fileName: { value: "", required: false, isError: false, message: "" },
};


export const TransportDocumentPage: React.FC = () => {
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
  const [steps] = useState<LabelProps[]>([
    { error: false, text: "Remitente" },
    { error: false, text: "Granos Transportados" },
    { error: false, text: "Comercio Granos" },
    { error: false, text: "Destinatario" },
    { error: false, text: "Transportista" }
  ]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const {
    formValue,
    setFormValue,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    reset,
    handleFormValueChange,
  } = useFormValue<TransportDocument>(initialForm);

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
      //Mapeo del objeto a 1er nivel para enviarlo
      const mappedObject = Object.keys(formValue).reduce((acc, key) => {
        acc[key] = formValue[key].value;
        return acc;
      }, {});
      await addTransportDocument(mappedObject as TransportDocument);
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
    console.log(formValue);
  }

  const changeSelectedExitField = (item: ExitFieldItem) => setSelectedFieldOutput(item);

  const getStepContent = useMemo(
    () => (step: number) => {
      switch (step) {
        case 0:
          return (
            <RemitenteForm
              formValues={formValue}
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
              formValues={formValue}
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
              formValues={formValue}
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
              formValues={formValue}
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
              formValues={formValue}
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
      formValue,
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

  const validateForm = (form: EventTarget & HTMLFormElement): boolean => {
    let isValid = true;
    let updatedFormValue = { ...formValue };
    const elements = form.elements as HTMLFormControlsCollection;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLInputElement;
      const fieldName = element.name as keyof FormValueState<TransportDocument>;
      const field = formValue[fieldName];
      if (field && field.required && !element.value) {
        updatedFormValue[fieldName] = {
          ...field,
          isError: true,
          message: "Campo requerido",
        };
        isValid = false;
      }
    }

    if (!isValid) setFormValue(updatedFormValue);

    return isValid;
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    if (validateForm(form)) handleNext();
  };


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
          Carta de Porte - {steps[activeStep].text}
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 3, mb: 4 }}>
          {steps.map((itemStep) =>
          (
            <Step key={itemStep.text}>
              <StepLabel {...itemStep}>{itemStep.text}</StepLabel>
            </Step>
          ))
          }
        </Stepper>
        <>
          <form onSubmit={onSubmit}>
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
                    type='submit'
                    variant="contained"
                    color="primary"
                  // onClick={handleNext}
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
                    formValue._id ? () => onClickUpdateTransportDocument() : () => onClickNewTransportDocument()
                  }
                >
                  {!formValue._id ? t("_add") : t("id_update")} {' '}
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

