import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { TextField, Grid, Alert, Card, CardContent, Switch, FormControlLabel } from '@mui/material';
import { IActividadPlanificacion } from "../../interfaces/planification";
import { usePlanActividad } from "../../hooks/usePlanifications";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../hooks/useRedux";

// Import the labor forms
import PersonalForm from '../LotsMenu/forms/PlanForms/PersonalForm';
import SuppliesForm from '../LotsMenu/forms/PlanForms/SuppliesForm';
import ServicesForm from '../LotsMenu/forms/PlanForms/ServicesForm';
import ObservationsForm from '../LotsMenu/forms/PlanForms/ObservationsForm';
import { NumberFieldWithUnits } from '../LotsMenu/components/NumberField';

interface ActividadEditorBaseProps {
  tipo: string;
  actividadDoc: IActividadPlanificacion;
  onSave: () => void;
  onClose: () => void;
  editing?: boolean;
}

export const ActividadEditorBase: React.FC<ActividadEditorBaseProps> = ({
  tipo,
  actividadDoc,
  onSave,
  onClose,
  editing = false,
}) => {
  const { t } = useTranslation();
  const { saveActividad } = usePlanActividad();
  const { user } = useAppSelector((state) => state.auth);

  // Unit conversion functions
  const convertTonsToQuintals = (tons: number) => tons * 10;
  const convertQuintalsToTons = (quintals: number) => quintals / 10;
  const convertTonsToKg = (tons: number) => tons * 1000;
  const convertKgToTons = (kg: number) => kg / 1000;

  // Convert planification data to labor form format
  const convertToLaborFormat = (actividad: IActividadPlanificacion) => {
    return {
      uuid: actividad._id,
      tipo: actividad.tipo,
      detalles: {
        business: actividad.accountId,
        cultivo: null,
        contratista: null,
        fecha_ejecucion_tentativa: actividad.fecha,
        hectareas: actividad.area || 0,
        dosis: [],
        servicios: [],
        zafra: '',
        rinde_estimado: (actividad as any).rendimientoEstimado || 0,
        rinde_estimado_total: (actividad as any).rendimientoEstimadoTotal || 0,
        fertilizacion: false,
        fitosanitaria: false,
      },
      condiciones: {
        humedad_max: undefined,
        humedad_min: undefined,
        temperatura_max: undefined,
        temperatura_min: undefined,
        velocidad_max: undefined,
        velocidad_min: undefined,
      },
      observaciones: (actividad as any).comentarios || '',
      campaña: {
        campaignId: actividad.campanaId,
        name: '',
        nombreComercial: '',
      },
      estado: (actividad as any).estado || 'abierta',
    };
  };

  // Harvest Yield Form Component
  const HarvestYieldForm = () => {
    const isArgentina = user?.countryId === 'AR';
    const [yieldPerHa, setYieldPerHa] = useState(convertKgToTons(formData.detalles?.rinde_estimado || 0));
    const [totalYield, setTotalYield] = useState(convertKgToTons(formData.detalles?.rinde_estimado_total || 0));

    const onYieldPerHaChange = (value: number) => {
      setYieldPerHa(value);
      const kgValue = convertTonsToKg(value);
      setFormData((prevData: any) => ({
        ...prevData,
        detalles: {
          ...prevData.detalles,
          rinde_estimado: kgValue,
        },
      }));

      // Update total yield based on hectares
      const totalTons = value * (formData.detalles?.hectareas || 0);
      setTotalYield(totalTons);
      setFormData((prevData: any) => ({
        ...prevData,
        detalles: {
          ...prevData.detalles,
          rinde_estimado_total: convertTonsToKg(totalTons),
        },
      }));
    };

    const onTotalYieldChange = (value: number) => {
      setTotalYield(value);
      const kgValue = convertTonsToKg(value);
      setFormData((prevData: any) => ({
        ...prevData,
        detalles: {
          ...prevData.detalles,
          rinde_estimado_total: kgValue,
        },
      }));
    };

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('Estimated Yield')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <NumberFieldWithUnits
                fullWidth
                label={isArgentina ? t('Yield per hectare (qq/ha)') : t('Yield per hectare (ton/ha)')}
                value={isArgentina ? convertTonsToQuintals(yieldPerHa) : yieldPerHa}
                onChange={(e) => {
                  const inputValue = Number(e.target.value);
                  const tonsValue = isArgentina ? convertQuintalsToTons(inputValue) : inputValue;
                  onYieldPerHaChange(tonsValue);
                }}
                unit={isArgentina ? "qq/ha" : "ton/ha"}
              />
              {isArgentina && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {t('Equivalent')}: {yieldPerHa.toFixed(2)} ton/ha
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <NumberFieldWithUnits
                fullWidth
                label={isArgentina ? t('Total estimated yield (qq)') : t('Total estimated yield (ton)')}
                value={isArgentina ? convertTonsToQuintals(totalYield) : totalYield}
                onChange={(e) => {
                  const inputValue = Number(e.target.value);
                  const tonsValue = isArgentina ? convertQuintalsToTons(inputValue) : inputValue;
                  onTotalYieldChange(tonsValue);
                }}
                unit={isArgentina ? "qq" : "ton"}
              />
              {isArgentina && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {t('Equivalent')}: {totalYield.toFixed(2)} ton
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const [formData, setFormData] = useState(convertToLaborFormat(actividadDoc));
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<{ [k: number]: boolean }>({});

  const steps = [t('general'), t('supplies'), t('services'), t('observations')];

  useEffect(() => {
    const converted = convertToLaborFormat(actividadDoc);
    setFormData(converted);
  }, [actividadDoc]);

  const totalSteps = () => steps.length;
  const completedSteps = () => Object.keys(completed).length;
  const isLastStep = () => activeStep === totalSteps() - 1;
  const allStepsCompleted = () => completedSteps() === totalSteps();

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const handleComplete = () => {
    const newCompleted = completed;
    newCompleted[activeStep] = true;
    setCompleted(newCompleted);
    handleNext();
  };

  // Status and enhanced fields form
  const PlanificationStatusForm = () => {
    const onFieldChange = (fieldName: string, value: any) => {
      setFormData((prevData: any) => ({
        ...prevData,
        detalles: {
          ...prevData.detalles,
          [fieldName]: value,
        },
      }));
    };

    // Only show status section if the planning is closed
    if (formData.estado === 'cerrada') {
      return (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            📋 {t('Planning Status')}: {t('Closed')}
          </Typography>
          <Typography>
            {t('Planning is closed and cannot be modified')}
          </Typography>
        </Alert>
      );
    }

    // For active planning, don't show any status section
    return null;
  };

  // Activity Details Form (for application activities)
  const ActivityDetailsForm = () => {
    const [fertilizationChecked, setFertilizationChecked] = useState(
      formData.detalles?.fertilizacion || false,
    );
    const [phytosanitaryChecked, setPhytosanitaryChecked] = useState(
      formData.detalles?.fitosanitaria || false,
    );

    const handleCheckboxChange = (fieldName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      if (fieldName === 'fertilizacion') {
        setFertilizationChecked(checked);
      } else if (fieldName === 'fitosanitaria') {
        setPhytosanitaryChecked(checked);
      }

      setFormData((prevData: any) => ({
        ...prevData,
        detalles: {
          ...prevData.detalles,
          [fieldName]: checked,
        },
      }));
    };

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('Activity Details')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={fertilizationChecked}
                    onChange={handleCheckboxChange('fertilizacion')}
                    color="primary"
                  />
                }
                label={t('Fertilization')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={phytosanitaryChecked}
                    onChange={handleCheckboxChange('fitosanitaria')}
                    color="primary"
                  />
                }
                label={t('Phytosanitary')}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const getStepContent = (step: number) => {
    const isDisabled = formData.estado === 'cerrada';

    switch (step) {
      case 0:
        return (
          <>
            <PlanificationStatusForm />
            {formData.tipo === 'cosecha' && <HarvestYieldForm />}
            {formData.tipo === 'aplicacion' && <ActivityDetailsForm />}
            <PersonalForm
              lot={{ properties: { hectareas: formData.detalles?.hectareas || 0 } }}
              formData={formData}
              setFormData={setFormData}
              mode="plan"
              showActivityType={false}
            />
          </>
        );
      case 1:
        return isDisabled ? (
          <Alert severity="warning">
            {t('Planning is closed and cannot be modified')}
          </Alert>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>{t('Planning Mode')}:</strong> {t('Stock validation and deposit location are not required for planning')}
            </Alert>
            <SuppliesForm
              lot={{ properties: { hectareas: formData.detalles?.hectareas || 0 } }}
              db={null}
              formData={formData}
              setFormData={setFormData}
              mode="plan"
            />
          </>
        );
      case 2:
        return isDisabled ? (
          <Alert severity="warning">
            {t('Planning is closed and cannot be modified')}
          </Alert>
        ) : (
          <ServicesForm
            formData={formData}
            setFormData={setFormData}
            mode="plan"
          />
        );
      case 3:
        return isDisabled ? (
          <Alert severity="warning">
            {t('Planning is closed and cannot be modified')}
          </Alert>
        ) : (
          <ObservationsForm
            lot={null}
            formData={formData}
            setFormData={setFormData}
          />
        );
      default:
        return <div>{t('Unknown step')}</div>;
    }
  };

  const handleSave = async () => {
    try {
      // Convert supply data (dosis) to planification format
      const lineasInsumos = (formData.detalles?.dosis || []).map((dosis: any) => ({
        _id: `planlinsumo:${dosis.uuid || Date.now()}-${Math.random()}`,
        insumoId: dosis.insumo?._id,
        dosis: dosis.dosis || 0,
        totalCantidad: dosis.total || 0,
        precioUnitario: dosis.precio_estimado || 0,
        actividadId: actividadDoc._id,
      }));

      // Convert service data (servicios) to planification format
      const lineasLabores = (formData.detalles?.servicios || []).map((servicio: any) => ({
        _id: `planlabor:${servicio.uuid || Date.now()}-${Math.random()}`,
        laborId: servicio.laborId || 'default-labor',
        laborNombre: servicio.servicio || 'Servicio',
        totalCosto: servicio.costo_total || 0,
        costoPorHectarea: servicio.precio_unidad || 0,
        comentario: servicio.comentario || '',
        actividadId: actividadDoc._id,
      }));

      const planificationData: IActividadPlanificacion = {
        ...actividadDoc,
        tipo: formData.tipo,
        fecha: formData.detalles.fecha_ejecucion_tentativa || new Date().toISOString(),
        area: formData.detalles.hectareas,
        // Save reference IDs to the lines
        insumosLineasIds: lineasInsumos.map(l => l._id),
        laboresLineasIds: lineasLabores.map(l => l._id),
        // Save additional fields
        ...(formData.detalles?.cultivo && { cultivo: formData.detalles.cultivo }),
        ...(formData.detalles?.contratista && { contratista: formData.detalles.contratista }),
        ...(formData.detalles?.ingeniero && { ingeniero: formData.detalles.ingeniero }),
        ...(formData.observaciones && { comentarios: formData.observaciones }),
        ...(formData.estado && { estado: formData.estado }),
        ...(formData.detalles.rinde_estimado && { rendimientoEstimado: formData.detalles.rinde_estimado }),
        ...(formData.detalles.rinde_estimado_total && { rendimientoEstimadoTotal: formData.detalles.rinde_estimado_total }),
        ...(formData.detalles.fertilizacion !== undefined && { fertilizacion: formData.detalles.fertilizacion }),
        ...(formData.detalles.fitosanitaria !== undefined && { fitosanitaria: formData.detalles.fitosanitaria }),
        // Save sowing-specific fields if they exist
        ...(formData.detalles?.densidad_objetivo && { densidadObjetivo: formData.detalles.densidad_objetivo }),
        ...(formData.detalles?.peso_1000 && { peso1000: formData.detalles.peso_1000 }),
        ...(formData.detalles?.profundidad && { profundidad: formData.detalles.profundidad }),
        ...(formData.detalles?.tipo_siembra && { tipoSiembra: formData.detalles.tipo_siembra }),
        ...(formData.detalles?.distancia && { distancia: formData.detalles.distancia }),
        // Save conditions
        ...(formData.condiciones && { condiciones: formData.condiciones }),
      };

      console.log('💾 SAVING PLANIFICATION DATA:', {
        planificationData,
        lineasInsumos,
        lineasLabores
      });

      await saveActividad(planificationData, lineasInsumos, lineasLabores);
      onSave();
    } catch (error) {
      console.error('Error saving planification:', error);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper alternativeLabel nonLinear activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label} completed={completed[index]}>
            <StepButton color="inherit" onClick={handleStep(index)}>
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ p: 3 }}>
        {getStepContent(activeStep)}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "row", pt: 2, px: 3, pb: 2 }}>
        <Button color="error" onClick={onClose} sx={{ mr: 1 }}>
          {t('cancel')}
        </Button>
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          {t('previous')}
        </Button>
        <Box sx={{ flex: "1 1 auto" }} />
        {activeStep !== steps.length - 1 && (
          <Button onClick={handleNext} sx={{ mr: 1 }}>
            {t('next')}
          </Button>
        )}
        {activeStep === steps.length - 1 && (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={formData.estado === 'cerrada'}
          >
            {editing ? t('update') : t('save')} {t('planning')}
          </Button>
        )}
      </Box>
    </Box>
  );
};
