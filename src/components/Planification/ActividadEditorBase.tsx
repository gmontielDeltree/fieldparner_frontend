import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Card, CardBody, CardFooter, Alert, Container, Progress } from 'reactstrap';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { IActividadPlanificacion } from "../../interfaces/planification";
import { usePlanActividad } from "../../hooks/usePlanifications";
import { useTranslation } from "react-i18next";

// Import the labor forms
import PersonalForm from '../LotsMenu/forms/PlanForms/PersonalForm';
import SuppliesForm from '../LotsMenu/forms/PlanForms/SuppliesForm';
import ServicesForm from '../LotsMenu/forms/PlanForms/ServicesForm';
import ObservationsForm from '../LotsMenu/forms/PlanForms/ObservationsForm';

// Import for additional fields
import { TextField, FormControl, Grid } from '@mui/material';
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
  const [maxStepReached, setMaxStepReached] = useState(0);

  const steps = [t('general'), t('supplies'), t('services'), t('observations')];

  useEffect(() => {
    setFormData(convertToLaborFormat(actividadDoc));
  }, [actividadDoc]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => {
      const nextStep = prevActiveStep + 1;
      setMaxStepReached((prevMaxStep) => Math.max(prevMaxStep, nextStep));
      return nextStep;
    });
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    if (step <= maxStepReached) {
      setActiveStep(step);
    }
  };

  // Enhanced PersonalForm for planification
  const PlanificationPersonalForm = ({ formData, setFormData }: any) => {
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
      <Card>
        <CardBody>
          <Typography variant="h6" className="mb-3">
            {t('General Information')}
          </Typography>

          <Grid container spacing={2}>
            {/* Status field - always visible */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  select
                  label={t('Status')}
                  value={formData.estado || 'abierta'}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  SelectProps={{
                    native: true,
                  }}
                  disabled={formData.estado === 'cerrada'}
                >
                  <option value="abierta">{t('Open')}</option>
                  <option value="cerrada">{t('Closed')}</option>
                </TextField>
              </FormControl>
            </Grid>

            {/* Zafra field for preparation and sowing */}
            {(formData.tipo === 'preparado' || formData.tipo === 'siembra') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('Zafra')}
                  value={formData.detalles?.zafra || ''}
                  onChange={(e) => onFieldChange('zafra', e.target.value)}
                  placeholder={t('Ingrese la zafra')}
                  helperText={t('Información de la zafra correspondiente a la planificación anual')}
                  disabled={formData.estado === 'cerrada'}
                />
              </Grid>
            )}

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

            {/* Hectares */}
            <Grid item xs={12} sm={6}>
              <NumberFieldWithUnits
                fullWidth
                label={t('Hectares to treat')}
                value={formData.detalles?.hectareas || 0}
                onChange={(e) => onFieldChange('hectareas', e.target.value)}
                unit="ha"
              />
            </Grid>

            {/* Activity type details for application */}
            {formData.tipo === 'aplicacion' && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" className="mb-2">
                  {t('Activity Details')}
                </Typography>
                <div className="d-flex gap-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={formData.detalles?.fertilizacion || false}
                      onChange={(e) => onFieldChange('fertilizacion', e.target.checked)}
                      disabled={formData.estado === 'cerrada'}
                    />
                    <label className="form-check-label">
                      {t('Fertilization')}
                    </label>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={formData.detalles?.fitosanitaria || false}
                      onChange={(e) => onFieldChange('fitosanitaria', e.target.checked)}
                      disabled={formData.estado === 'cerrada'}
                    />
                    <label className="form-check-label">
                      {t('Phytosanitary')}
                    </label>
                  </div>
                </div>
              </Grid>
            )}
          </Grid>
        </CardBody>
      </Card>
    );
  };

  const getStepContent = (step: number) => {
    const isDisabled = formData.estado === 'cerrada';

    switch (step) {
      case 0:
        return (
          <PlanificationPersonalForm
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 1:
        return isDisabled ? (
          <Alert color="warning">
            La planificación está cerrada y no puede ser modificada
          </Alert>
        ) : (
          <div>
            <Alert color="info" className="mb-3">
              <strong>Modo Planificación:</strong> No es necesario validar stock ni ubicación para planificación anual
            </Alert>
            <SuppliesForm
              lot={{ properties: { hectareas: formData.detalles?.hectareas || 0 } }}
              db={null}
              formData={formData}
              setFormData={setFormData}
            />
          </div>
        );
      case 2:
        return isDisabled ? (
          <Alert color="warning">
            La planificación está cerrada y no puede ser modificada
          </Alert>
        ) : (
          <ServicesForm
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 3:
        return isDisabled ? (
          <Alert color="warning">
            La planificación está cerrada y no puede ser modificada
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
        comentarios: formData.observaciones,
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

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex === activeStep) return 'current';
    if (stepIndex < activeStep) return 'complete';
    if (stepIndex <= maxStepReached) return 'available';
    return 'upcoming';
  };

  const getStepStyle = (status: string) => {
    switch (status) {
      case 'complete':
        return { background: '#10b981', color: 'white', border: 'none' };
      case 'current':
        return { background: 'white', color: '#10b981', border: '2px solid #10b981' };
      case 'upcoming':
        return { background: '#f3f4f6', color: '#6b7280', border: 'none' };
      default:
        return { background: '#e5e7eb', color: '#6b7280', border: 'none' };
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-lg">
        {/* Stepper */}
        <div className="px-4 py-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            {steps.map((step, index) => {
              const status = getStepStatus(index);

              return (
                <div
                  key={step}
                  className="text-center position-relative"
                  style={{ flex: 1 }}
                >
                  <div
                    onClick={handleStep(index)}
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      cursor: index <= maxStepReached ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      ...getStepStyle(status),
                    }}
                  >
                    {status === 'complete' ? (
                      <Check size={20} />
                    ) : (
                      <span style={{ fontWeight: '600' }}>{index + 1}</span>
                    )}
                  </div>

                  <div className="mt-2">
                    <small
                      className="text-muted"
                      style={{
                        fontWeight: status === 'current' ? '600' : '400',
                      }}
                    >
                      {step}
                    </small>
                  </div>

                  {index < steps.length - 1 && (
                    <Progress
                      value={index < activeStep ? 100 : 0}
                      color="success"
                      style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50%',
                        width: '100%',
                        height: '2px',
                        zIndex: -1,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <CardBody className="p-4">
          {getStepContent(activeStep)}
        </CardBody>

        {/* Actions */}
        <CardFooter className="bg-light d-flex justify-content-between align-items-center p-4">
          <Button
            color="secondary"
            onClick={onClose}
            className="d-flex align-items-center gap-2"
          >
            <ChevronLeft size={16} />
            {t('cancel')}
          </Button>

          <div className="d-flex gap-2">
            {activeStep > 0 && (
              <Button
                color="secondary"
                onClick={handleBack}
                className="d-flex align-items-center gap-2"
              >
                <ChevronLeft size={16} />
                {t('previous')}
              </Button>
            )}

            {activeStep === steps.length - 1 ? (
              <Button
                color="success"
                onClick={handleSave}
                disabled={formData.estado === 'cerrada'}
              >
                {editing ? t('update') : t('save')} {t('planning')}
              </Button>
            ) : (
              <Button
                color="primary"
                onClick={handleNext}
                className="d-flex align-items-center gap-2"
              >
                {t('next')}
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </Container>
  );
};
