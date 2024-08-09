

import { Button, Container, Grid, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { Loading } from '../../components';
import { useAppDispatch, useForm } from '../../hooks';
import { TransportDocument } from '../../interfaces/transportDocument';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';


const steps = ["Remitente", "Granos Transportados", "Comercio Granos", "Destinatario", "Transportista"];
const transportDocumentActive = null;
const initialForm = {

};

export const NewTransportDocument: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const {
    formulario,
    setFormulario,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    reset,
    handleFormValueChange,
  } = useForm(initialForm);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const onClickCancel = () => {
    // dispatch(removeCustomerActive());
    navigate("/init/overview/transport-documents");
  };

  const getStepContent = useMemo(
    () => (step: number) => {
      switch (step) {
        case 0:
          return (
            <></>
          );
        case 1:
          return (
            <></>
          );
        case 2:
          return (
            <></>
          );
        case 3:
          return (
            <></>
          );
        case 4:
          return (
            <></>
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
    ]
  );



  return (

    <Container maxWidth="lg" sx={{ ml: 0, borderRadius: "10px" }}>
      <Loading loading={false} />
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Typography component="h1" variant="h4" align="left" gutterBottom>
          Carta de Porte - {steps[activeStep]}
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
                  transportDocumentActive ? () => console.log("update") : () => console.log("add")
                }
              >
                {!transportDocumentActive ? t("_add") : t("id_update")} {' '}
              </Button>
            </Grid>
            {transportDocumentActive && (
              <Grid item xs={12} sm={3}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => console.log}
                >
                  {t("icon_delete")}
                </Button>
              </Grid>
            )}
          </Grid>
        </>
      </Paper>
    </Container>
  )
}

