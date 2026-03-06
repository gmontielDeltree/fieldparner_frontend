import React, { useEffect, useMemo, useState } from "react";
import { DoseForm, LaborsForm, Loading, StockForm } from "../../components";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector, useCrops, useForm, useSupply } from "../../hooks";
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
import { Supply } from "../../types";
import { removeSupplyActive, setSupplyActive } from "../../redux/supply";
import { useTranslation } from "react-i18next";
import { uploadFile } from "../../helpers/fileUpload";
import { IsSeed } from "../../utils/helper";
import { useParams } from "react-router-dom";

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
  generico: false,
  cropId: "",
  brand: "",
  senasaId: "",
  formulationDenomination: "",
  toxicityClass: "",
  isDefault: false,
};

export const SupplyPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { supplyActive } = useAppSelector((state) => state.supply);
  const [activeStep, setActiveStep] = useState(0);
  const { t } = useTranslation();
  const [steps] = useState<string[]>([t("_supplies"), t("_dose"), t("_stock")]);
  const {
    type: supplyType,
    formulario,
    setFormulario,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    handleFormValueChange,
    reset,
  } = useForm(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({
    name: false,
    type: false,
    cropId: false,
    unitMeasurement: false,
  })
  const { supplies, isLoading, createSupply, updateSupply, getSupplies } = useSupply();
  const { isLoading: loadingCrops, dataCrops, getCrops } = useCrops();
  const [fileUpload, setFileUpload] = React.useState<File | null>(null);
  const { id } = useParams();
  const onClickCancel = () => navigate("/init/overview/supply");

  const handleUpdateSupply = async () => {
    if (formulario._id) {
      await updateSupply(formulario);
      await uploadDocumentFile();
      dispatch(removeSupplyActive());
      navigate("/init/overview/supply");
    }
  };
  useEffect(() => {
    if (supplyActive) {
      setFormulario(supplyActive);
    } else {
      setFormulario(initialForm);
    }
  }, [supplyActive]);

  const uploadDocumentFile = async () => {
    try {
      if (fileUpload) {
        const response = await uploadFile(fileUpload);
        if (response) console.log("file upload successful.");
      }
    } catch (error) {
      console.log('upload file error:', error);
    }
  }

  const addNewSupply = async () => {
    try {
      await createSupply(formulario);
      await uploadDocumentFile();
      navigate("/init/overview/supply");
      reset();
    } catch (error) {
      console.log('error', error)
    }
  }

  const handleAddSupply = () => {
    let notUnit = { unitMeasurement: !formulario.unitMeasurement.trim() };
    setFormErrors({ ...formErrors, ...notUnit });
    if (Object.values({ ...formErrors, ...notUnit }).some((error) => error)) return;
    addNewSupply();
  };

  const isSeedType = React.useMemo(() => IsSeed(supplyType), [supplyType]);

  const getStepContent = useMemo(
    () => (step: number) => {
      switch (step) {
        case 0:
          return (
            <LaborsForm
              key="laborsForm"
              formValues={formulario}
              setFormValues={setFormulario}
              crops={dataCrops}
              formErrors={formErrors}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleCheckboxChange={handleCheckboxChange}
              setFileUpload={setFileUpload}
            />
          );
        case 1:
          return (
            <DoseForm
              key="doseForm"
              formValues={formulario}
              handleInputChange={handleInputChange}
              handleFormValueChange={handleFormValueChange}
              handleSelectChange={handleSelectChange}
              handleCheckboxChange={handleCheckboxChange}
            />
          );
        case 2:
          return (
            <StockForm
              key="stockForm"
              formValues={formulario}
              formErrors={formErrors}
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
        setFormulario,
        setFileUpload]
    ]
  );

  const handleNext = () => {
    let formErrors = {
      name: !formulario.name.trim(),
      type: !formulario.type.trim(),
      cropId: (isSeedType && !formulario.cropId?.trim())
    };
    setFormErrors(formErrors);
    if (Object.values(formErrors).some((error) => error)) return;
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  useEffect(() => {
    getSupplies();
    getCrops();
  }, []);

  useEffect(() => {
    // 2) Cuando supplies ya esté cargado, busca el supply por ID.
    if (id && supplies.length > 0) {
      const found = supplies.find(s => s._id === id);
      if (found) {
        dispatch(setSupplyActive(found));
        // O si prefieres no meterlo a Redux sino directo a tu formulario:
        // setFormulario(found);
      }
    }
  }, [id, supplies]);

  useEffect(() => {
    return () => {
      dispatch(removeSupplyActive());
    };
  }, [dispatch]);

  return (
    <Container maxWidth="md" className="pepe">
      <Loading key="loading-supply" loading={isLoading || loadingCrops} />
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
              <Button
                variant="contained"
                color="inherit"
                onClick={activeStep !== 0 ? handleBack : onClickCancel}>
                {activeStep !== 0 ? t("id_back") : t("id_cancel")}
              </Button>
            </Grid>
            <Grid item xs={12} sm={3} key="grid-next">
              {!(activeStep === steps.length - 1) && (
                <Button variant="contained" color="primary" onClick={handleNext}>
                  {t("id_next")}
                </Button>
              )}
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="contained"
                color="success"
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
