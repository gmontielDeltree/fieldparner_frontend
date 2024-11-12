import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { Loading, TemplateLayout } from '../../components';
import { GeneralData, Details } from '../../components/ContractSaleCereals';
import {
  Handshake as HandshakeIcon,
} from '@mui/icons-material';
import { FormValueState, useBusiness, useCampaign, useCrops, useFormValues, useOriginDestinations } from '../../hooks';
import { getShortDate } from '../../helpers/dates';
import { useTranslation } from 'react-i18next';
import { ContractSaleCereals } from '../../interfaces/contract-sale-cereals';
import { TipoEntidad } from '../../types';


const initialState: FormValueState<ContractSaleCereals> = {
  nroContractSale: { value: "", isError: false, message: "", required: true },
  campaignId: { value: "", isError: false, message: "", required: true },
  contractCorporateId: { value: "", isError: false, message: "", required: true },
  cropId: { value: "", isError: false, message: "", required: true },
  dateCreated: { value: getShortDate(false, "-"), isError: false, message: "", required: false },
  kg: { value: "", isError: false, message: "", required: true },
  currency: { value: "", isError: false, message: "", required: true },
  amountValue: { value: "", isError: false, message: "", required: true },
  quintalQuote: { value: "", isError: false, message: "", required: true },
  kgDelivered: { value: "", isError: false, message: "", required: true },
  status: { value: "", isError: false, message: "", required: true },
  valueCollected: { value: "", isError: false, message: "", required: true },
  isOpenContract: { value: true, isError: false, message: "", required: false },
  contractType: { value: "", isError: false, message: "", required: false },
  kms: { value: "", isError: false, message: "", required: false },
  USDQuote: { value: "", isError: false, message: "", required: false },
  valueQuote: { value: "", isError: false, message: "", required: false },
  valueUSDQuote: { value: "", isError: false, message: "", required: false },
  producerId: { value: "", isError: false, message: "", required: true },
  buyerId: { value: "", isError: false, message: "", required: true },
  destinationId: { value: "", isError: false, message: "", required: true },
  delivererId: { value: "", isError: false, message: "", required: true },
  brokerId: { value: "", isError: false, message: "", required: false },
  brokerPercentage: { value: 0, isError: false, message: "", required: false },
  brokerAmountValue: { value: 0, isError: false, message: "", required: false },
  comissionAgentId: { value: "", isError: false, message: "", required: false },
  comissionAgentPercentage: { value: 0, isError: false, message: "", required: false },
  comissionAgentAmountValue: { value: 0, isError: false, message: "", required: false },
  condition: { value: "", isError: false, message: "", required: false },
  mothodPayment: { value: "", isError: false, message: "", required: false },
}


export const ContractSaleCerealsPage: React.FC = () => {
  // const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const { t } = useTranslation();
  const {
    formValues,
    handleInputChange,
    handleSelectChange,
    handleFormValueChange,
    handleCheckboxChange,
    setFormValues,
    // reset
  } = useFormValues(initialState);

  const [isLoading, setIsloading] = useState(false);
  const [listDeliveryDates, setListDeliveryDates] = useState<string[]>([]);
  const { businesses: socialEntities, getBusinesses } = useBusiness();
  const { campaigns, getCampaigns } = useCampaign();
  const { dataCrops, getCrops } = useCrops();
  const { originsDestinations, getOriginDestinations } = useOriginDestinations();

  const addDeliveryDate = (date: string) => {
    setListDeliveryDates([...listDeliveryDates, date]);
  }

  const deleteDeliveryDate = (date: string) => {
    setListDeliveryDates(listDeliveryDates.filter(item => item !== date));
  };


  const steps = [
    "Datos Generales",
    "Detalles",
  ];

  const getStepContent = useMemo(
    () => (step: number) => {
      switch (step) {
        case 0:
          return (
            <GeneralData
              key="sale-cereals-general-data"
              formValues={formValues}
              crops={dataCrops}
              campaigns={campaigns}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleCheckboxChange={handleCheckboxChange}
            />
          );
        case 1:
          return (
            <Details
              key="sale-cereals-details"
              formValues={formValues}
              providers={socialEntities.filter(item => item.tipoEntidad === TipoEntidad.JURIDICA)}
              destinations={originsDestinations}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              addDeliveryDate={addDeliveryDate}
              listDeliveryDates={listDeliveryDates}
              deleteDeliveryDate={deleteDeliveryDate}
            />
          );
        default:
          throw new Error("Step no encontrado.");
      }
    },
    [
      formValues,
      socialEntities,
      campaigns,
      dataCrops,
      originsDestinations,
      listDeliveryDates,
      handleInputChange,
      handleSelectChange,
      handleFormValueChange,
      addDeliveryDate,
      deleteDeliveryDate
    ]
  );

  const onClickCancelar = () => {
    navigate("/init/overview/sales-cereals");
  };

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const onClickSave = () => {
    console.log("formValues", formValues);
  }
  const validateForm = (form: EventTarget & HTMLFormElement): boolean => {
    let isValid = true;
    let updatedFormValue = { ...formValues };
    const elements = form.elements as HTMLFormControlsCollection;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLInputElement;
      const fieldName = element.name as keyof FormValueState<ContractSaleCereals>;
      const field = formValues[fieldName];
      if (field && field.required && !element.value) {
        updatedFormValue[fieldName] = {
          ...field,
          isError: true,
          message: "Campo requerido",
        };
        isValid = false;
      }
    }

    if (!isValid) setFormValues(updatedFormValue);

    return isValid;
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    // if (validateForm(form)) handleNext();
    handleNext();
  };



  useEffect(() => {
    const initGetData = async () => {
      setIsloading(true);
      await Promise.all([
        getBusinesses(),
        getCampaigns(),
        getCrops(),
        getOriginDestinations(),
      ]);
      setIsloading(false);
    }

    initGetData();
  }, [])


  return (
    <TemplateLayout key="contract-sale-cereals-page" viewMap={false}>
      {isLoading && <Loading loading={true} />}
      <Container
        maxWidth="lg"
        sx={{ margin: 0, p: { sm: 0, md: 0 }, mb: 1, }}
      >
        <Paper
          variant="outlined"
          sx={{ p: { xs: 2, md: 1 } }}
        >
          <Box
            component="div"
            display="flex"
            alignItems="center"
            sx={{ ml: { sm: 2 }, pt: 2 }}
          >
            <HandshakeIcon fontSize='large' />
            <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
              Contrato Venta Cereal
            </Typography>
          </Box>
          <Stepper activeStep={activeStep} sx={{ pt: 5, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <>
            <form onSubmit={onSubmit}>
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
                    {activeStep !== 0 ? t("id_back") : t("id_cancel")}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={3}>
                  {!(activeStep === steps.length - 1) ? (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      // onClick={handleNext}
                      fullWidth
                    >
                      {t("id_next")}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="contained"
                      color="success"
                      onClick={() => onClickSave()}
                      fullWidth
                    >
                      {t("_add")}
                    </Button>
                  )
                  }
                </Grid>
                {/* {
                  activeStep === steps.length - 1 && (
                    <Grid item xs={12} sm={3}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        onClick={() => onClickSave()}
                        fullWidth
                      >
                        {t("_add")}
                      </Button>
                    </Grid>
                  )
                } */}
              </Grid>
            </form>
          </>
        </Paper>
      </Container>
    </TemplateLayout>
  )
}
