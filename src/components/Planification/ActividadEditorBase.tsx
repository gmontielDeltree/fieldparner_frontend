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
import { dbContext } from "../../services";
import { NotificationService } from "../../services/notificationService";

// Import the labor forms
import PersonalForm from '../LotsMenu/forms/PlanForms/PersonalForm';
import SuppliesForm from '../LotsMenu/forms/PlanForms/SuppliesForm';
import ServicesForm from '../LotsMenu/forms/PlanForms/ServicesForm';
import ObservationsForm from '../LotsMenu/forms/PlanForms/ObservationsForm';
import { NumberFieldWithUnits } from '../LotsMenu/components/NumberField';
import { resolveLaborServiceName } from '../../utils/laborService';
import { normalizeSupplyDoseLine, resolveSupplyDosificacion, resolveSupplyTotal } from '../../utils/supplyDose';

const isSowingPlanActivity = (tipo?: string) => {
  const normalizedType = (tipo || '').toLowerCase();
  return normalizedType === 'siembra' || normalizedType === 'sowing';
};

const resolvePlanLineId = (prefix: string, rawId?: string) => {
  if (rawId && rawId.startsWith(`${prefix}:`)) {
    return rawId;
  }

  const suffix = rawId || `${Date.now()}-${Math.random()}`;
  return `${prefix}:${suffix}`;
};

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
  convertTonsToSacas: (tons: number) => number;
  convertSacasToTons: (sacas: number) => number;
}

const HarvestYieldForm: React.FC<HarvestYieldFormProps> = ({
  user,
  formData,
  setFormData,
  t,
  convertKgToTons,
  convertTonsToKg,
  convertTonsToQuintals,
  convertQuintalsToTons,
  convertTonsToSacas,
  convertSacasToTons
}) => {
  const { i18n } = useTranslation();
  const isPortuguese = i18n.language?.startsWith('pt');
  const isSpanish = i18n.language?.startsWith('es');
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
              label={isSpanish ? t('Yield per hectare (qq/ha)') : isPortuguese ? t('Yield per hectare (sc/ha)') : t('Yield per hectare (ton/ha)')}
              value={
                yieldPerHa === ''
                  ? ''
                  : (isSpanish ? convertTonsToQuintals(Number(yieldPerHa)) : isPortuguese ? convertTonsToSacas(Number(yieldPerHa)) : yieldPerHa)
              }
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  onYieldPerHaChange('');
                } else {
                  const numVal = Number(inputValue);
                  const tonsValue = isSpanish ? convertQuintalsToTons(numVal) : isPortuguese ? convertSacasToTons(numVal) : numVal;
                  onYieldPerHaChange(tonsValue);
                }
              }}
              unit={isSpanish ? "qq/ha" : isPortuguese ? "sc/ha" : "ton/ha"}
            />
            {(isSpanish || isPortuguese) && yieldPerHa !== '' && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {t('Equivalent')}: {Number(yieldPerHa).toFixed(2)} ton/ha
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <NumberFieldWithUnits
              fullWidth
              label={isSpanish ? t('Total estimated yield (qq)') : isPortuguese ? t('Total estimated yield (sc)') : t('Total estimated yield (ton)')}
              value={
                totalYield === ''
                  ? ''
                  : (isSpanish ? convertTonsToQuintals(Number(totalYield)) : isPortuguese ? convertTonsToSacas(Number(totalYield)) : totalYield)
              }
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  onTotalYieldChange('');
                } else {
                  const numVal = Number(inputValue);
                  const tonsValue = isSpanish ? convertQuintalsToTons(numVal) : isPortuguese ? convertSacasToTons(numVal) : numVal;
                  onTotalYieldChange(tonsValue);
                }
              }}
              unit={isSpanish ? "qq" : isPortuguese ? "sc" : "ton"}
            />
            {(isSpanish || isPortuguese) && totalYield !== '' && (
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

  // CultivoContext.Provider pasa el resultado de useCrops() que es { crops, dataCrops, ... }
  const cultivosContext: any = useContext(CultivoContext);
  const crops = cultivosContext?.crops || cultivosContext?.dataCrops;

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
  const convertTonsToSacas = (tons: number) => tons * 1000 / 60;
  const convertSacasToTons = (sacas: number) => sacas * 60 / 1000;
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
  const requiresReservationDetails = isSowingPlanActivity(formData.tipo);

  const steps = [t('general'), t('supplies'), t('services'), t('observations')];

  useEffect(() => {
    let cancelled = false;

    const loadActivityIntoForm = async () => {
      const converted = convertToLaborFormat(actividadDoc);

      const insumoLineIds = actividadDoc?.insumosLineasIds || [];
      const laborLineIds = actividadDoc?.laboresLineasIds || [];

      if (!insumoLineIds.length && !laborLineIds.length) {
        if (!cancelled) {
          setFormData(converted);
        }
        return;
      }

      try {
        const [insumosResp, laboresResp] = await Promise.all([
          insumoLineIds.length
            ? dbContext.fields.allDocs({ include_docs: true, keys: insumoLineIds })
            : Promise.resolve({ rows: [] } as any),
          laborLineIds.length
            ? dbContext.fields.allDocs({ include_docs: true, keys: laborLineIds })
            : Promise.resolve({ rows: [] } as any),
        ]);

        const dosis = await Promise.all(
          (insumosResp.rows || [])
            .filter((row: any) => row.doc && !row.error)
            .map(async (row: any) => {
              const line = row.doc as any;

              let insumoDoc = null;
              if (line?.insumoId) {
                try {
                  insumoDoc = await dbContext.supplies.get(line.insumoId);
                } catch (error) {
                  console.warn('Could not load supply for annual plan line', line.insumoId, error);
                }
              }

              let depositoDoc = line?.deposito || null;
              const depositId = line?.depositoId || line?.deposito?._id;
              if (!depositoDoc && depositId) {
                try {
                  depositoDoc = await dbContext.deposits.get(depositId);
                } catch (error) {
                  console.warn('Could not load deposit for annual plan line', depositId, error);
                }
              }

              return normalizeSupplyDoseLine({
                insumo: insumoDoc || { _id: line.insumoId, name: line.insumoId },
                dosificacion: line?.dosificacion,
                dosis: line?.dosis,
                total: line?.totalCantidad,
                precio_estimado: line?.precioUnitario,
                deposito: depositoDoc || null,
                ubicacion: line?.ubicacion || '',
                nro_lote: line?.nroLote || line?.nroLot || '',
                orden_de_retiro: line?.ordenRetiro || null,
                uuid: line?._id,
                hectareas: line?.hectareas,
              }, actividadDoc.area);
            }),
        );

        const servicios = (laboresResp.rows || [])
          .filter((row: any) => row.doc && !row.error)
          .map((row: any) => {
            const line = row.doc as any;
            return {
              uuid: line?._id,
              laborId: line?.laborId,
              servicio: resolveLaborServiceName(line?.laborNombre) || 'Servicio',
              contratista: actividadDoc?.contratista || null,
              costo_total: line?.totalCosto || 0,
              comentario: line?.comentario || '',
              unidades: actividadDoc?.area || converted.detalles?.hectareas || 0,
              precio_unidad: line?.costoPorHectarea || 0,
            };
          });

        if (!cancelled) {
          setFormData({
            ...converted,
            detalles: {
              ...converted.detalles,
              dosis,
              servicios,
            },
          });
        }
      } catch (error) {
        console.error('Error loading annual plan lines into editor:', error);
        if (!cancelled) {
          setFormData(converted);
        }
      }
    };

    loadActivityIntoForm();

    return () => {
      cancelled = true;
    };
  }, [actividadDoc]);

  // Populate crop and zafra from cycle if available
  useEffect(() => {
    // Priority: Prop > Context lookup > Nothing
    let targetCiclo = cicloProp;

    if (!targetCiclo && ciclos && actividadDoc.cicloId) {
      targetCiclo = ciclos.find((c: any) => c._id === actividadDoc.cicloId);
    }

    console.log('🌾 [ActividadEditorBase] Cargando cultivo:', {
      targetCiclo,
      cultivoId: targetCiclo?.cultivoId,
      cropsAvailable: Array.isArray(crops) ? crops.length : 'not an array',
      cropsType: typeof crops,
      cultivosContext
    });

    if (targetCiclo && Array.isArray(crops) && crops.length > 0) {
      const zafra = targetCiclo.zafra || '';
      let cultivo = null;
      if (targetCiclo.cultivoId) {
        cultivo = crops.find((c: any) => c._id === targetCiclo.cultivoId || c.id === targetCiclo.cultivoId);
        console.log('🌾 [ActividadEditorBase] Cultivo encontrado:', cultivo);
      }

      setFormData(prev => {
        // Only skip update if both cultivo and zafra are already set
        // Changed condition to allow updating if cultivo is missing
        const shouldSkip = prev.detalles.cultivo && prev.detalles.zafra && !cultivo;
        if (shouldSkip) {
          console.log('🌾 [ActividadEditorBase] Skipping update - already has cultivo and zafra');
          return prev;
        }

        const newFormData = {
          ...prev,
          detalles: {
            ...prev.detalles,
            cultivo: cultivo || prev.detalles?.cultivo,
            zafra: zafra || prev.detalles?.zafra
          }
        };
        console.log('🌾 [ActividadEditorBase] Actualizando formData con cultivo:', newFormData.detalles.cultivo);
        return newFormData;
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
                convertTonsToSacas={convertTonsToSacas}
                convertSacasToTons={convertSacasToTons}
              />
            )}
            {formData.tipo === 'aplicacion' && <ActivityDetailsForm />}
            <PersonalForm
              lot={{ properties: { hectareas: formData.detalles?.hectareas || 0 } }}
              formData={formData}
              setFormData={setFormData}
              mode="plan"
              planningOrigin="annual"
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
            <Alert severity={requiresReservationDetails ? "warning" : "info"} sx={{ mb: 2 }}>
              <strong>{t('Planning Mode')}:</strong>{' '}
              {requiresReservationDetails
                ? 'La siembra anual reserva stock al guardar, por lo que cada insumo necesita depósito.'
                : t('Stock validation and deposit location are not required for planning')}
            </Alert>
            <SuppliesForm
              lot={{ properties: { hectareas: formData.detalles?.hectareas || 0 } }}
              db={null}
              formData={formData}
              setFormData={setFormData}
              mode={requiresReservationDetails ? 'execute' : 'plan'}
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
      if (requiresReservationDetails) {
        const contractorId = formData.detalles?.contratista?._id;
        if (!contractorId) {
          NotificationService.showError(
            'La siembra anual necesita un contratista válido para reservar stock.',
            {},
            t('error_label')
          );
          setActiveStep(0);
          return;
        }

        const missingDeposit = (formData.detalles?.dosis || []).find((dosis: any) => !dosis?.deposito?._id);
        if (missingDeposit) {
          NotificationService.showError(
            'La siembra anual necesita un depósito por insumo para reservar stock.',
            {},
            t('error_label')
          );
          setActiveStep(1);
          return;
        }
      }

      // Convert supply data (dosis) to planification format
      const planningHectares = Number(formData.detalles?.hectareas || 0);
      const lineasInsumos = (formData.detalles?.dosis || []).map((dosis: any) => {
        const normalizedDose = normalizeSupplyDoseLine(dosis, planningHectares);
        return {
          _id: resolvePlanLineId('planlinsumo', dosis.uuid),
          insumoId: normalizedDose.insumo?._id,
          dosis: Number(resolveSupplyDosificacion(normalizedDose, planningHectares) || 0),
          totalCantidad: Number(resolveSupplyTotal(normalizedDose, planningHectares) || 0),
          hectareas: planningHectares,
          precioUnitario: normalizedDose.precio_estimado || 0,
          actividadId: actividadDoc._id,
          deposito: normalizedDose.deposito || null,
          depositoId: normalizedDose.deposito?._id,
          ubicacion: normalizedDose.ubicacion || '',
          nroLote: normalizedDose.nro_lote || '',
          ordenRetiro: normalizedDose.orden_de_retiro || null,
        };
      });

      // Convert service data (servicios) to planification format
      const lineasLabores = (formData.detalles?.servicios || []).map((servicio: any) => ({
        _id: resolvePlanLineId('planlabor', servicio.uuid),
        laborId: servicio.laborId || 'default-labor',
        laborNombre: resolveLaborServiceName(servicio.servicio) || 'Servicio',
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
