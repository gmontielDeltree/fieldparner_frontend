import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { TextField, FormControl, Grid, Paper, Alert, MenuItem, Select, InputLabel } from '@mui/material';
import { IActividadPlanificacion } from "../../interfaces/planification";
import { usePlanActividad } from "../../hooks/usePlanifications";
import { useTranslation } from "react-i18next";

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

  const [formData, setFormData] = useState(convertToLaborFormat(actividadDoc));
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<{ [k: number]: boolean }>({});

  const steps = [t('general'), t('supplies'), t('services'), t('observations')];

  useEffect(() => {
    setFormData(convertToLaborFormat(actividadDoc));
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

    return (
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('Planning Status and Details')}
        </Typography>

        <Grid container spacing={2}>
          {/* Status field */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t('Status')}</InputLabel>
              <Select
                value={formData.estado || 'abierta'}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                label={t('Status')}
              >
                <MenuItem value="abierta">{t('Open')}</MenuItem>
                <MenuItem value="cerrada">{t('Closed')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Harvest specific fields */}
          {formData.tipo === 'cosecha' && (
            <>
              <Grid item xs={12} sm={6}>
                <NumberFieldWithUnits
                  fullWidth
                  label="Rinde Estimado (ton/ha)"
                  value={formData.detalles?.rinde_estimado || 0}
                  onChange={(e) => onFieldChange('rinde_estimado', e.target.value)}
                  unit="ton/ha"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <NumberFieldWithUnits
                  fullWidth
                  label="Rinde Estimado Total (ton)"
                  value={formData.detalles?.rinde_estimado_total || 0}
                  onChange={(e) => onFieldChange('rinde_estimado_total', e.target.value)}
                  unit="ton"
                />
              </Grid>
            </>
          )}
        </Grid>

        {formData.estado === 'cerrada' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('Planning is closed and cannot be modified')}
          </Alert>
        )}
      </Paper>
    );
  };

  const getStepContent = (step: number) => {
    const isDisabled = formData.estado === 'cerrada';

    switch (step) {
      case 0:
        return (
          <>
            <PlanificationStatusForm />
            <PersonalForm
              lot={{ properties: { hectareas: formData.detalles?.hectareas || 0 } }}
              formData={formData}
              setFormData={setFormData}
              mode="plan"
              showActivityType={formData.tipo === 'aplicacion'}
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
      const planificationData: IActividadPlanificacion = {
        ...actividadDoc,
        tipo: formData.tipo,
        fecha: formData.detalles.fecha_ejecucion_tentativa || new Date().toISOString(),
        area: formData.detalles.hectareas,
        ...(formData.observaciones && { comentarios: formData.observaciones }),
        ...(formData.estado && { estado: formData.estado }),
        ...(formData.detalles.rinde_estimado && { rendimientoEstimado: formData.detalles.rinde_estimado }),
        ...(formData.detalles.rinde_estimado_total && { rendimientoEstimadoTotal: formData.detalles.rinde_estimado_total }),
      };

      await saveActividad(planificationData, [], []);
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
