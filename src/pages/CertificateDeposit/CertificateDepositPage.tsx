import { Button, Container, Grid, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { Loading } from '../../components'
import { FormValueState, useAppDispatch, useBusiness, useCampaign, useCertificateDeposit, useCompany, useFormValue, useSupply } from '../../hooks';
import { CertificateDeposit, TransportDocumentByCertificateDeposit } from '../../interfaces/certificate-deposit';
import { GrainsForm, HeaderForm, RatesForm } from '../../components/CertificateDeposit';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../../helpers/fileUpload';
import { SupplyType, TipoEntidad } from '../../types';
import { Business } from '../../interfaces/socialEntity';
import { Company } from '../../interfaces/company';

import { uiFinishLoading, uiStartLoading } from '../../redux/ui';
import { getShortDate } from '../../helpers/dates';


const steps = ["Encabezado", "Granos", "Tarifas"];
const initialForm: FormValueState<CertificateDeposit> = {
  accountId: { value: "", isError: false, message: "", required: false }, //get from user
  licenceId: { value: "", isError: false, message: "", required: false },//get from user
  numeroCertificado: { value: "", isError: false, message: "", required: true },
  fechaEmision: { value: "", isError: false, message: "", required: true },
  campaniaId: { value: "", isError: false, message: "", required: true },
  cultivoId: { value: "", isError: false, message: "", required: true },
  tipoCertificado: { value: "", isError: false, message: "", required: true },
  cuitDepositario: { value: "", isError: false, message: "", required: true },
  cuitDepositor: { value: "", isError: false, message: "", required: true },
  planta: { value: "", isError: false, message: "", required: true },
  numeroAnalisis: { value: "", isError: false, message: "", required: false },
  archivoCertificado: { value: "", isError: false, message: "", required: false },
  rubro: { value: "", isError: false, message: "", required: false },
  porcentajeRubro: { value: "", isError: false, message: "", required: false },
  tipoRubro: { value: "", isError: false, message: "", required: false },
  valor: { value: "", isError: false, message: "", required: false },
  precioAlmacenaje: { value: "", isError: false, message: "", required: false },
  precioAcarreo: { value: "", isError: false, message: "", required: false },
  precioGastosGenerales: { value: "", isError: false, message: "", required: false },
  precioZarandeo: { value: "", isError: false, message: "", required: false },
  precioOtros: { value: "", isError: false, message: "", required: false },
  precioExcedente: { value: "", isError: false, message: "", required: false },
  precioSecadoDe: { value: "", isError: false, message: "", required: false },
  precioSecadoA: { value: "", isError: false, message: "", required: false },
  precioSecado: { value: "", isError: false, message: "", required: false },
  createdDate: { value: getShortDate(true), isError: false, message: "", required: false },
  kgNeto: { value: 0, isError: false, message: "", required: false },
  kgSecado: { value: 0, isError: false, message: "", required: false },
  kgVolatil: { value: 0, isError: false, message: "", required: false },
  kgZarandeo: { value: 0, isError: false, message: "", required: false },
  kgBruto: { value: 0, isError: false, message: "", required: false },
  formaPago: { value: "", isError: false, message: "", required: false },
  importeIVA: { value: 0, isError: false, message: "", required: false },
  iva: { value: 0, isError: false, message: "", required: false },
  otrasPercepciones: { value: 0, isError: false, message: "", required: false },
  percepcionIVA: { value: 0, isError: false, message: "", required: false },
  total: { value: 0, isError: false, message: "", required: false },
  totalConceptoNoGravado: { value: 0, isError: false, message: "", required: false },
  totalGastosGenerales: { value: 0, isError: false, message: "", required: false },
  totalOtros: { value: 0, isError: false, message: "", required: false },
  totalSecado: { value: 0, isError: false, message: "", required: false },
  totalZarandeo: { value: 0, isError: false, message: "", required: false },
  descripcionAdicional: { value: "", isError: false, message: "", required: false },
  contProteico: { value: "", isError: false, message: "", required: false },
  factor: { value: "", isError: false, message: "", required: false },
  grado: { value: "", isError: false, message: "", required: false },
  observaciones: { value: "", isError: false, message: "", required: false },
}



export const CertificateDepositPage: React.FC = () => {

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const {
    formValue,
    handleInputChange,
    handleSelectChange,
    reset,
    handleFormValueChange,
    setFormValue,
  } = useFormValue<CertificateDeposit>(initialForm);
  const { campaigns, getCampaigns } = useCampaign();
  const { supplies, getSupplies } = useSupply();
  const { businesses: socialEntities, getBusinesses } = useBusiness();
  const { companies, getCompanies } = useCompany();
  const [selectedDepositary, setSelectedDepositary] = useState<Business | null>(null);
  const [selectedDepositors, setSelectedDepositors] = useState<Company | null>(null);
  const [listTransportByCertificate, setListTransportByCertificate] = useState<TransportDocumentByCertificateDeposit[]>([]);
  const { addCertificateDeposit } = useCertificateDeposit();

  const getStepContent = useMemo(() => (step: number) => {
    switch (step) {
      case 0:
        return (
          <HeaderForm
            formValues={formValue}
            campaigns={campaigns}
            cultives={supplies.filter(supply => supply.type.toLowerCase() === SupplyType.Cultivo.toLowerCase())}
            providers={socialEntities.filter(x => x.tipoEntidad === TipoEntidad.JURIDICA)}
            companies={companies}
            changeDepositary={(item) => setSelectedDepositary(item)}
            changeDepositors={(item) => setSelectedDepositors(item)}
            deleteFile={() => setDocumentFile(null)}
            fileUpload={(file) => setDocumentFile(file)}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            handleFormValueChange={handleFormValueChange}
          />
        );
      case 1:
        return (
          <GrainsForm
            formValues={formValue}
            depositary={selectedDepositary}
            depositors={selectedDepositors}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            handleFormValueChange={handleFormValueChange}
            updateListTransport={(list) => setListTransportByCertificate(list)}
          />
        );
      case 2:
        return (
          <RatesForm
            formValues={formValue}
            depositary={selectedDepositary}
            depositors={selectedDepositors}
            listTransportDocument={listTransportByCertificate}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            handleFormValueChange={handleFormValueChange}
          />
        );
      default:
        return "Unknown step";
    }
  }, [
    formValue,
    campaigns,
    supplies,
    socialEntities,
    companies,
    selectedDepositary,
    selectedDepositors,
    handleInputChange,
    handleSelectChange,
    handleFormValueChange
  ]);

  const handleUploadDocumentFile = async () => {
    if (documentFile) {
      await uploadFile(documentFile);
    }
  }

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const onClickCancel = () => {
    reset();
    navigate("/init/overview/certificate-deposits");
  }

  const mappedCertificateDeposit = () => {
    return Object.keys(formValue).reduce((acc, key) => {
      acc[key] = formValue[key].value;
      return acc;
    }, {});
  }

  const onClickAddCertifcateDeposit = async () => {

    try {
      dispatch(uiStartLoading());
      const mappedObject = mappedCertificateDeposit();
      await addCertificateDeposit(mappedObject as CertificateDeposit, listTransportByCertificate);
      await handleUploadDocumentFile();
      dispatch(uiFinishLoading());
      reset();
      navigate("/init/overview/certificate-deposits");
    } catch (error) {
      console.log('error', error);
      dispatch(uiFinishLoading());
    }

  }
  //TODO: revisar para agregar al hook
  const validateForm = (form: EventTarget & HTMLFormElement): boolean => {
    let isValid = true;
    let updatedFormValue = { ...formValue };
    const elements = form.elements as HTMLFormControlsCollection;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLInputElement;
      const fieldName = element.name as keyof FormValueState<CertificateDeposit>;
      const field = formValue[fieldName];
      if (field && field.required && !element.value) {
        updatedFormValue[fieldName] = {
          ...field,
          isError: true,
          message: t("this_field_is_mandatory"),
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
    getCampaigns();
    getBusinesses();
    getCompanies();
    getSupplies();

  }, [])


  return (
    <Container maxWidth="lg" sx={{ ml: 0, borderRadius: "10px" }}>
      <Loading loading={false} />
      <Paper
        variant="outlined"
        sx={{
          my: { xs: 3, md: 6 },
          p: { xs: 2, md: 3 },
          borderRadius: "10px",
        }}
      >
        <Typography component="h2" variant="h4" align="left" sx={{ mb: 1, letterSpacing: "2px" }}>
          Certificado de Depósito
        </Typography>
        <Typography variant="h5" align='left' sx={{ mb: 3 }}>
          {steps[activeStep]}
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 3, mb: 4 }}>
          {
            steps.map((itemStep) => (
              <Step key={itemStep}>
                <StepLabel>{itemStep}</StepLabel>
              </Step>
            ))
          }
        </Stepper>
        <>
          <form onSubmit={onSubmit}>
            {getStepContent(activeStep)}
            <Grid
              container
              alignItems="center"
              justifyContent="space-around"
              sx={{ mt: 5 }}
            >
              <Grid item xs={12} sm={6} key="grid-back" display="flex" justifyContent="center">
                <Button onClick={activeStep !== 0 ? handleBack : onClickCancel}>
                  {activeStep !== 0 ? t("id_back") : t("id_cancel")}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} key="grid-next" display="flex" justifyContent="center">
                {!(activeStep === steps.length - 1) ? (
                  <Button
                    type='submit'
                    variant="contained"
                    color="primary"
                  // onClick={() => handleNext()}
                  >
                    {t("id_next")}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    hidden={activeStep !== steps.length - 1}
                    color="success"
                    onClick={() => onClickAddCertifcateDeposit()}
                  >
                    {t("_add")}
                  </Button>
                )

                }
              </Grid>
              {/* <Grid item xs={12} sm={3}>

            </Grid> */}
            </Grid>
          </form>
        </>
      </Paper>
    </Container>
  )
}
