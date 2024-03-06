import React, { useEffect, useMemo, useState } from "react";
import { DoseForm, LaborsForm, Loading, StockForm } from "../components";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector, useForm, useSupply } from "../hooks";
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
import { Supply } from "../types";
import { removeSupplyActive } from "../redux/supply";
import { useTranslation } from "react-i18next";


const initialForm: Supply = {
  accountId: "",
  type: "",
  labors: [],
  name: "",
  description: "",
  barCode: "",
  unitMeasurement: "",
  stockByLot: false,
  maximumDose: "",
  minimumDose: "",
  recommendedDose: "",
  mermaVolatile: "",
  activePrincipal: "",
  replenishmentPoint: "",
  currentStock: 0,
  reservedStock: 0,
  generico: ""
};

export const SupplyPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { supplyActive } = useAppSelector((state) => state.supply);
  const [activeStep, setActiveStep] = useState(0);
  const {t} = useTranslation();
  const [steps] = useState<string[]>([t("_supplies"), t("_dose"), t("_stock")]);
  const {
    formulario,
    setFormulario,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    handleGenercoChange,
    reset,
  } = useForm(initialForm);

  const {  isLoading, supplyError, createSupply, updateSupply, setSupplyError} = useSupply();
 


  const onClickCancel = () => navigate("/init/overview/supply");

  const handleUpdateSupply = () => {
    if (formulario._id) {
      updateSupply(formulario);
      dispatch(removeSupplyActive());
      navigate("/init/overview/supply");
    }
  };

  const handleAddSupply = () => {
    createSupply(formulario);
    navigate("/init/overview/supply");
    reset();
  };

  const getStepContent = useMemo(
    () => (step: number) => {
      switch (step) {
        case 0:
          return (
            <LaborsForm
              key="laborsForm"
              formValues={formulario}
              setFormValues={setFormulario}
              supplyError={supplyError}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleCheckboxChange={handleCheckboxChange}
            />
          );
        case 1:
          return (
            <DoseForm
              key="doseForm"
              formValues={formulario}
              handleInputChange={handleInputChange}
              handleGenercoChange={handleGenercoChange}
            />
          );
        case 2:
          return (
              <StockForm
              key="stockForm"
              formValues={formulario}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              />
          );
          
        default:
          throw new Error("Unknown step");
      } 
    },
    [
      [formulario,
       handleInputChange,
       handleSelectChange,
       handleCheckboxChange,
       setFormulario]
    ]
  );

  const handleNext = () => {
    
    if (!formulario.name.trim()) {
      setSupplyError(true);
      
    } else {
      setSupplyError(false);
      setActiveStep(activeStep + 1);
    }
  };
 


  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  useEffect(() => {
    if (supplyActive) setFormulario(supplyActive);
    else setFormulario(initialForm);
  }, [supplyActive]);

  useEffect(() => {
    return () => {
      dispatch(removeSupplyActive());
    };
  }, [dispatch]);

  return (
    <Container maxWidth="md" className="pepe">
      <Loading key="loading-supply" loading={isLoading} />
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 } }}
      >
        <Typography component="h1" variant="h4" align="center" sx={{ mb: 3 }}>
          {supplyActive ? t("icon_edit") : t("new_masculine")} {' '}
          {t("_supplies")}
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
            sx={{ mt: 3 }}
          >
            <Grid item xs={12} sm={3}>
              <Button onClick={activeStep !== 0 ? handleBack : onClickCancel}>
                {activeStep !== 0 ? t("id_back") : t("id_cancel")}
              </Button>
            </Grid>
            <Grid item xs={12} sm={3} key="grid-next">
              {!(activeStep === steps.length - 1) && (
                <Button variant="outlined" color="primary" onClick={handleNext}>
                  {t("id_next")}
                </Button>
              )}
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={supplyActive ? handleUpdateSupply : handleAddSupply}
              >
                {!supplyActive ? t("_add") : t("id_update")}
              </Button>
            </Grid>
          </Grid>
        </>
      </Paper>
    </Container>
  );
};
