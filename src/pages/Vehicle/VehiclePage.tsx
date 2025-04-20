// VehiclePage.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { TemplateLayout } from "../../components";
import { Vehicle } from "@types";
import { useAppDispatch, useAppSelector, useForm, useVehicle } from "../../hooks";
import { removerVehiculoActivo, setVehiculoActivo } from "../../redux/vehicle";
import {
  DatosGenerales,
  Especificaciones,
  Mantenimientos,
} from "../../components/NuevoVehiculo";
import { useTranslation } from "react-i18next";
import { uploadFile } from "../../helpers/fileUpload";
import Swal from "sweetalert2";

const initialState: Vehicle = {
  accountId: "",
  licenceId: "",
  vehicleType: "",
  patent: "",
  make: "",
  model: "",
  modelYear: "",
  tara: 0,
  net: 0,
  fuelType: "",
  fuelCapacity: 0,
  connectivity: "",
  policyNumber: "",
  insurence: "",
  coverageType: "",
  owner: "",
  lastMaintenance: "",
  insurenceStartDate: "",
  insurenceDueDate: "",
  gross: 0,
  location: "",
  technialSpecifications: [],
  maintenances: [],
  chassisNumber: "",
  photoVehicle: "",
  documentVehicleFile: "",
  insurencePolicyFile: "",
};


export const VehiclePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { vehiculoActivo } = useAppSelector((state) => state.vehiculo);
  const [activeStep, setActiveStep] = useState(0);
  const { t } = useTranslation();
  const {
    formulario,
    setFormulario,
    handleInputChange,
    handleSelectChange,
    handleYearChange,
    handleFormValueChange,
  } = useForm(initialState);
  const { createVehicle, updateVehicle, getVehicleById } = useVehicle();
  const [vehicleFiles, setVehicleFiles] = useState<File[]>([]);

  const steps = [
    t("general_data"),
    t("technical_specifications"),
    t("_maintenance"),
  ];

  const cancelFile = (indexToRemove: number) => {
    const updateFiles = vehicleFiles.filter((_item, index) => index !== indexToRemove);
    setVehicleFiles(updateFiles);
  };

  const getStepContent = useMemo(
    () => (step: number) => {
      switch (step) {
        case 0:
          return (
            <DatosGenerales
              vehiculo={formulario}
              handleInputChange={handleInputChange}
              handleFormValueChange={handleFormValueChange}
              handleYearChange={handleYearChange}
              handleSelectChange={handleSelectChange}
              setFilesUpload={setVehicleFiles}
              cancelFile={cancelFile}
            />
          );
        case 1:
          return (
            <Especificaciones
              vehiculo={formulario}
              setVehiculo={setFormulario}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleFormValueChange={handleFormValueChange}
              setFilesUpload={setVehicleFiles}
              cancelFile={cancelFile}
            />
          );
        case 2:
          return (
            <Mantenimientos
              vehiculo={formulario}
              setVehiculo={setFormulario}
              handleFormValueChange={handleFormValueChange}
              setFilesUpload={setVehicleFiles}
              cancelFile={cancelFile}
            />
          );
        default:
          throw new Error("Step no encontrado.");
      }
    },
    [formulario, setFormulario, handleInputChange, handleSelectChange, handleYearChange, handleFormValueChange]
  );

  useEffect(() => {
    const loadVehicle = async () => {
      if (id && !vehiculoActivo?._id) {
        const vehicle = await getVehicleById(id);
        if (vehicle) {
          dispatch(setVehiculoActivo(vehicle));
          setFormulario(vehicle);
        }
      }
    };
    loadVehicle();
  }, [id]);

  useEffect(() => {
    if (vehiculoActivo) {
      setFormulario(vehiculoActivo);
    }
  }, [vehiculoActivo, setFormulario]);

  useEffect(() => {
    return () => {
      dispatch(removerVehiculoActivo());
    };
  }, [dispatch]);

  const onClickCancelar = useCallback(() => {
    navigate("/init/overview/vehicle");
  }, [navigate]);

  const onClickAddVehiculo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRequiredFields()) return;

    createVehicle(formulario);
    handleUpdateFiles();
    navigate("/init/overview/vehicle");
  };

  const onClickUpdateVehicle = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateRequiredFields()) return;

      if (formulario._id) {
        updateVehicle(formulario);
        handleUpdateFiles();
      }
      navigate("/init/overview/vehicle");
    },
    [formulario, updateVehicle, navigate]
  );

  const validateRequiredFields = () => {
    const { vehicleType, make, model } = formulario;
    if (!vehicleType || !make || !model) {
      Swal.fire({
        icon: 'warning',
        title: t('required_fields_title'),
        text: t('required_fields_message'),
        confirmButtonText: t('understood')
      });
      return false;
    }
    return true;
  };

  const handleUpdateFiles = async () => {
    try {
      await Promise.all(vehicleFiles.map(uploadFile));
    } catch (error) {
      console.error(t('upload_error'), error);
      Swal.fire({
        icon: 'error',
        title: t('upload_error_title'),
        text: t('upload_error_message'),
        confirmButtonText: 'OK'
      });
    }
  };

  const handleNext = () => {
    if (!validateRequiredFields()) return;
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  return (
    <TemplateLayout key="vehicle-page" viewMap={true}>
      <Container maxWidth="lg" sx={{ margin: 0, mb: 1 }}>
        <Paper variant="elevation" sx={{ p: 4 }}>
          <Typography component="h2" align="center" variant="h4" sx={{ ml: { sm: 2 } }}>
            {!id ? t("new_vehicle") : t("update_vehicle")}
          </Typography>
          <Stepper activeStep={activeStep} sx={{ pt: 5, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <form>
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
                {activeStep !== steps.length - 1 && (
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    fullWidth
                  >
                    {t("id_next")}
                  </Button>
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  onClick={id ? onClickUpdateVehicle : onClickAddVehiculo}
                  fullWidth
                >
                  {!id ? t("_save") : t("id_update")}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </TemplateLayout>
  );
};