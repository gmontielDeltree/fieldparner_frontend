import { Button, Container, Grid, Paper, Step, Stepper, Typography } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { Loading } from '../../components'
import { FormValueState, useAppDispatch, useBusiness, useCampaign, useCompany, useFormValue, useSupply } from '../../hooks';
import { CertificateDeposit } from '../../interfaces/certificate-deposit';
import { GrainsForm, HeaderForm, RatesForm } from '../../components/CertificateDeposit';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../../helpers/fileUpload';
import { SupplyType, TipoEntidad } from '../../types';


const steps = ["Encabezado", "Granos", "Tarifas"];
const initialForm: FormValueState<CertificateDeposit> = {
  certificateNumber: { value: "", isError: false, message: "", required: true },
  emissionDate: { value: "", isError: false, message: "", required: true },
  campaignId: { value: "", isError: false, message: "", required: true },
  cultiveId: { value: "", isError: false, message: "", required: true },
  certificateType: { value: "", isError: false, message: "", required: false },
  cuitDepositary: { value: "", isError: false, message: "", required: true },
  cuitDepositors: { value: "", isError: false, message: "", required: true },
  floor: { value: "", isError: false, message: "", required: true },
  analysisNumber: { value: "", isError: false, message: "", required: false },
  fileCertificate: { value: "", isError: false, message: "", required: false },
  rubro: { value: "", isError: false, message: "", required: false },
  rubroPercentage: { value: "", isError: false, message: "", required: false },
  rubroType: { value: "", isError: false, message: "", required: false },
  value: { value: "", isError: false, message: "", required: false },

  product: { value: "", isError: false, message: "", required: false },
  quantity: { value: 0, isError: false, message: "", required: false },
  origin: { value: "", isError: false, message: "", required: false },
  destination: { value: "", isError: false, message: "", required: false },
  status: { value: "", isError: false, message: "", required: false },
  type: { value: "", isError: false, message: "", required: false },
  created_at: { value: "", isError: false, message: "", required: false },
  updated_at: { value: "", isError: false, message: "", required: false },
  deleted_at: { value: "", isError: false, message: "", required: false },
}
/*
 const mappedTransportDocument = () => {
    return Object.keys(formValue).reduce((acc, key) => {
      acc[key] = formValue[key].value;
      return acc;
    }, {});
  }
*/

export const CertificateDepositPage: React.FC = () => {

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const {
    formValue,
    setFormValue,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    reset,
    handleFormValueChange,
  } = useFormValue<CertificateDeposit>(initialForm);
  const { campaigns, getCampaigns } = useCampaign();
  const { supplies, getSupplies } = useSupply();
  const { businesses: socialEntities, getBusinesses } = useBusiness();
  const { companies, getCompanies } = useCompany();



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
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            handleFormValueChange={handleFormValueChange}
          />
        );
      case 2:
        return (
          <RatesForm
            formValues={formValue}
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

  const onClickAddCertifcateDeposit = () => {
    console.log('formValues', formValue);
    /*
      try {
      dispatch(uiStartLoading());
      const mappedObject = mappedTransportDocument();
      await addTransportDocument(mappedObject as TransportDocument);
      await handleUploadDocumentFile();
      dispatch(uiFinishLoading());
      reset();
      navigate("/init/overview/transport-documents");
    } catch (error) {
      console.log('error', error);
      dispatch(uiFinishLoading());
    }
    */
  }

  useEffect(() => {
    getCampaigns();
    getBusinesses();
    getCompanies();
    getSupplies();

  }, [])


  //TODO: Constinuar con el desarrollo de la página de certificado de depósito
  return (
    <Container maxWidth="lg" sx={{ ml: 0, borderRadius: "10px" }}>
      <Loading loading={false} />
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Typography component="h2" variant="h4" align="left" sx={{ mb: 1 }}>
          Certificado de Depósito
        </Typography>
        <Typography variant="h5" align='left' sx={{ mb: 3 }}>
          {steps[activeStep]}
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 3, mb: 4 }}>
          {
            steps.map((itemStep) => (<Step key={itemStep}>{itemStep}</Step>))
          }
        </Stepper>
        <>
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
                onClick={() => onClickAddCertifcateDeposit()}
              >
                {t("_add")}
              </Button>
            </Grid>
          </Grid>
        </>
      </Paper>
    </Container>
  )
}
