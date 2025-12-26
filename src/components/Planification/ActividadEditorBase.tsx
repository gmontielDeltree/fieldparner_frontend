import React, { useEffect, useState, useContext } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Typography from "@mui/material/Typography";
import { TextField, Grid, Alert, Card, CardContent, Switch, FormControlLabel } from '@mui/material';
import { IActividadPlanificacion } from "../../interfaces/planification";
import { usePlanActividad } from "../../hooks/usePlanifications";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../hooks/useRedux";
import { CiclosContext } from "./contexts/CiclosContext";
import { CultivoContext } from "./contexts/CultivosContext";
import { Button as RsButton, Spinner } from 'reactstrap';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

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
  ciclo?: any;
}

interface HarvestYieldFormProps {
  user: any;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  t: (key: string) => string;
  convertKgToTons: (kg: number) => number;
  convertTonsToKg: (tons: number) => number;
  convertTonsToQuintals: (tons: number) => number;
  convertQuintalsToTons: (quintals: number) => number;
}

const HarvestYieldForm: React.FC<HarvestYieldFormProps> = ({
  user,
  formData,
  setFormData,
  t,
  convertKgToTons,
  convertTonsToKg,
  convertTonsToQuintals,
  convertQuintalsToTons
}) => {
  const isArgentina = user?.countryId === 'AR';
  const [yieldPerHa, setYieldPerHa] = useState<number | string>(
    formData.detalles?.rinde_estimado ? convertKgToTons(formData.detalles.rinde_estimado) : ''
  );
  const [totalYield, setTotalYield] = useState<number | string>(
    formData.detalles?.rinde_estimado_total ? convertKgToTons(formData.detalles.rinde_estimado_total) : ''
  );

  const onYieldPerHaChange = (value: number | string) => {
    setYieldPerHa(value);
    const numValue = value === '' ? 0 : Number(value);
    const kgValue = convertTonsToKg(numValue);

    setFormData((prevData: any) => ({
      ...prevData,
      detalles: {
        ...prevData.detalles,
        rinde_estimado: kgValue,
      },
    }));

    // Update total yield based on hectares
    const totalTons = numValue * (formData.detalles?.hectareas || 0);
    setTotalYield(totalTons);
    setFormData((prevData: any) => ({
      ...prevData,
      detalles: {
        ...prevData.detalles,
        rinde_estimado_total: convertTonsToKg(totalTons),
      },
    }));
  };

  const onTotalYieldChange = (value: number | string) => {
    setTotalYield(value);
    const numValue = value === '' ? 0 : Number(value);
    const kgValue = convertTonsToKg(numValue);
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
              value={
                yieldPerHa === ''
                  ? ''
                  : (isArgentina ? convertTonsToQuintals(Number(yieldPerHa)) : yieldPerHa)
              }
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  onYieldPerHaChange('');
                } else {
                  const numVal = Number(inputValue);
                  const tonsValue = isArgentina ? convertQuintalsToTons(numVal) : numVal;
                  onYieldPerHaChange(tonsValue);
                }
              }}
              unit={isArgentina ? "qq/ha" : "ton/ha"}
            />
            {isArgentina && yieldPerHa !== '' && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {t('Equivalent')}: {Number(yieldPerHa).toFixed(2)} ton/ha
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <NumberFieldWithUnits
              fullWidth
              label={isArgentina ? t('Total estimated yield (qq)') : t('Total estimated yield (ton)')}
              value={
                totalYield === ''
                  ? ''
                  : (isArgentina ? convertTonsToQuintals(Number(totalYield)) : totalYield)
              }
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  onTotalYieldChange('');
                } else {
                  const numVal = Number(inputValue);
                  const tonsValue = isArgentina ? convertQuintalsToTons(numVal) : numVal;
                  onTotalYieldChange(tonsValue);
                }
              }}
              unit={isArgentina ? "qq" : "ton"}
            />
            {isArgentina && totalYield !== '' && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {t('Equivalent')}: {Number(totalYield).toFixed(2)} ton
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export const ActividadEditorBase: React.FC<ActividadEditorBaseProps> = ({
  tipo,
  actividadDoc,
  onSave,
  onClose,
  editing = false,
  ciclo: cicloProp,
}) => {
  const { t } = useTranslation();
  const { saveActividad } = usePlanActividad();
  const { user } = useAppSelector((state) => state.auth);

  const ciclosContext: any = useContext(CiclosContext);
  const ciclos = ciclosContext?.ciclos;

  const cultivosContext: any = useContext(CultivoContext);
  const crops = cultivosContext?.crops;

  // Get sowing activities from all cycles in the same lot for the initial planting dropdown
  const [sowingActivities, setSowingActivities] = useState<any[]>([]);
  
  useEffect(() => {
    console.log('🌱 [ActividadEditorBase] useEffect triggered:', {
      cicloProp,
      cicloId: cicloProp?._id,
      loteId: cicloProp?.loteId,
      actividadesIds: cicloProp?.actividadesIds,
    });
    
    const loadSowingActivities = async () => {
      // We need the cycle's activity IDs directly from cicloProp
      if (!cicloProp?._id) {
        console.log('🌱 [ActividadEditorBase] Early return - missing cicloProp');
        return;
      }

      // Get activity IDs directly from the current cycle
      const activityIds = cicloProp.actividadesIds || [];
      console.log('🌱 [ActividadEditorBase] Current cycle activity IDs:', activityIds);
      
      if (activityIds.length === 0) {
        console.log('🌱 [ActividadEditorBase] No activity IDs in current cycle');
        setSowingActivities([]);
        return;
      }
      
      try {
        // Load the activities from db
        const { dbContext } = await import('../../services');
        const db = dbContext.fields;
        const response = await db.allDocs({ include_docs: true, keys: activityIds });
        
        console.log('🌱 [ActividadEditorBase] DB response:', {
          rowsCount: response.rows?.length,
          rows: response.rows?.map((r: any) => ({ 
            id: r.id, 
            hasDoc: !!r.doc, 
            tipo: r.doc?.tipo,
            error: r.error 
          })),
        });
        
        // Filter for sowing activities
        const allDocs = response.rows
          .filter((row: any) => row.doc && !row.error)
          .map((row: any) => row.doc);
        
        console.log('🌱 [ActividadEditorBase] All docs tipos:', allDocs.map((d: any) => ({ id: d._id, tipo: d.tipo })));
        
        const sowings = allDocs
          .filter((doc: any) => {
            const tipo = (doc.tipo || '').toLowerCase();
            const isSowing = tipo === 'siembra' || tipo === 'sowing';
            console.log('🌱 [ActividadEditorBase] Checking doc:', { id: doc._id, tipo, isSowing });
            return isSowing;
          })
          .map((doc: any) => ({
            actividad: {
              _id: doc._id,
              uuid: doc._id,
              tipo: doc.tipo,
              detalles: {
                fecha_ejecucion_tentativa: doc.fecha,
                hectareas: doc.area,
                cultivo: doc.cultivo,
              }
            }
          }));
        
        console.log('🌱 [ActividadEditorBase] Loaded sowing activities:', sowings.length, sowings);
        setSowingActivities(sowings);
      } catch (error) {
        console.error('Error loading sowing activities:', error);
        setSowingActivities([]);
      }
    };
    
    loadSowingActivities();
  }, [cicloProp?._id, cicloProp?.actividadesIds]);

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
        // Ingeniero agrónomo asociado a la labor (si existe).
        // No usamos más el accountId como valor por defecto para evitar preseleccionar un ingeniero.
        business: (actividad as any).ingeniero || (actividad as any).business || null,
        cultivo: (actividad as any).cultivo || null,
        contratista: null,
        fecha_ejecucion_tentativa: actividad.fecha,
        hectareas: actividad.area || 0,
        dosis: [],
        servicios: [],
        zafra: (actividad as any).zafra || '',
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
    const converted = convertToLaborFormat(actividadDoc);
    setFormData(converted);
  }, [actividadDoc]);

  // Populate crop and zafra from cycle if available
  useEffect(() => {
    // Priority: Prop > Context lookup > Nothing
    let targetCiclo = cicloProp;

    if (!targetCiclo && ciclos && actividadDoc.cicloId) {
      targetCiclo = ciclos.find((c: any) => c._id === actividadDoc.cicloId);
    }

    if (targetCiclo && crops) {
      const zafra = targetCiclo.zafra || '';
      let cultivo = null;
      if (targetCiclo.cultivoId) {
        cultivo = crops.find((c: any) => c._id === targetCiclo.cultivoId || c.id === targetCiclo.cultivoId);
      }

      setFormData(prev => {
        // Prevent unnecessary updates
        if ((!cultivo && !zafra) || (prev.detalles.cultivo && prev.detalles.zafra)) return prev;

        return {
          ...prev,
          detalles: {
            ...prev.detalles,
            cultivo: cultivo || prev.detalles?.cultivo,
            zafra: zafra || prev.detalles?.zafra
          }
        };
      });
    }
  }, [actividadDoc.cicloId, ciclos, crops, cicloProp]);

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
            {formData.tipo === 'cosecha' && (
              <HarvestYieldForm
                user={user}
                formData={formData}
                setFormData={setFormData}
                t={t}
                convertKgToTons={convertKgToTons}
                convertTonsToKg={convertTonsToKg}
                convertTonsToQuintals={convertTonsToQuintals}
                convertQuintalsToTons={convertQuintalsToTons}
              />
            )}
            {formData.tipo === 'aplicacion' && <ActivityDetailsForm />}
            <PersonalForm
              lot={{ properties: { hectareas: formData.detalles?.hectareas || 0 } }}
              formData={formData}
              setFormData={setFormData}
              mode="plan"
              showActivityType={false}
              activities={sowingActivities}
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
        // Guardar el ingeniero agrónomo seleccionado (se edita en detalles.business)
        ...(formData.detalles?.business && { ingeniero: formData.detalles.business }),
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

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 2, px: 3, pb: 2, backgroundColor: "#f8f9fa" }}>
        <RsButton
          color="light"
          onClick={onClose}
          className="d-flex align-items-center gap-2"
        >
          <ChevronLeft size={16} />
          {t('cancel')}
        </RsButton>

        <div className="d-flex gap-2">
          <RsButton
            color="light"
            disabled={activeStep === 0}
            onClick={handleBack}
            className="d-flex align-items-center gap-2"
          >
            <ChevronLeft size={16} />
            {t('previous')}
          </RsButton>

          {activeStep !== steps.length - 1 ? (
            <RsButton
              color="primary"
              onClick={handleNext}
              className="d-flex align-items-center gap-2"
            >
              {t('next')}
              <ChevronRight size={16} />
            </RsButton>
          ) : (
            <RsButton
              color="success"
              onClick={handleSave}
              disabled={formData.estado === 'cerrada'}
              className="d-flex align-items-center gap-2"
            >
              <Check size={16} />
              {editing ? t('update') : t('save')} {t('planning')}
            </RsButton>
          )}
        </div>
      </Box>
    </Box>
  );
};
