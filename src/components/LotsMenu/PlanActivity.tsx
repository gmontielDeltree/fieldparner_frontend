import React, { useState, useEffect, useCallback } from 'react'
import { Snackbar } from '@mui/material'
import LocalFloristIcon from '@mui/icons-material/LocalFlorist'
import GrassIcon from '@mui/icons-material/Grass'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import { useAppSelector, useOrder } from '../../hooks'
import { useTranslation } from 'react-i18next'
import LandscapeIcon from '@mui/icons-material/Landscape'
import ConfirmDialog from './components/ConfirmDialog'
import PlanActivityStepper from './components/PlanActivityStepper'
import ActionButtons from './components/ActionButtons'
import PlanActivityContent from './components/PlanActivityContent'
import ActivityHeader from './components/ActivityHeader'
import ValidationAlert from './ValidationAlert'
import { saveActivity } from './components/activityService'
import { usePlanActivity } from './components/usePlanActivity'
import { dbContext } from '../../services'
import { uuidv7 } from 'uuidv7'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Progress,
  Alert,
  Container,
  Row,
  Col,
  Spinner,
} from 'reactstrap'
import {
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle,
  MapIcon,
  MapPin,
  Sprout,
} from 'lucide-react'
import { format } from 'date-fns';

// Keep the raw activity types with the standard Spanish values
const ACTIVITY_TYPES = {
  preparation: "preparado",
  sowing: "siembra",
  harvesting: "cosecha",
  application: "aplicacion",
}

// Map from English input props to Spanish constants
const mapToSpanishType = (englishType) => {
  switch (englishType) {
    case 'preparation': return ACTIVITY_TYPES.preparation;
    case 'sowing': return ACTIVITY_TYPES.sowing;
    case 'harvesting': return ACTIVITY_TYPES.harvesting;
    case 'application': return ACTIVITY_TYPES.application;
    default: return englishType;
  }
};

// Replace the activityIcons object with this enhanced version
const activityIcons = {
  sowing: <LocalFloristIcon sx={{ fontSize: 50, color: "white" }} />,
  application: <GrassIcon sx={{ fontSize: 50, color: "white" }} />,
  harvesting: <AgricultureIcon sx={{ fontSize: 50, color: "white" }} />,
  preparation: <LandscapeIcon sx={{ fontSize: 50, color: "white" }} />
}

interface PlanActivityProps {
  activityType: string
  fieldName: string
  lot: any
  db: any
  field: any
  lotActivities?: any
  backToActivites: () => void
  existingActivity: any
  verificationMode?: boolean
}

// Maximum timeout for DB operations (10 seconds)
const DB_OPERATION_TIMEOUT = 10000;

// Utility function to add timeout to promises
const withTimeout = (promise, timeoutMs) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Operation timed out'));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise,
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
};

const PlanActivity: React.FC<PlanActivityProps> = ({
  activityType,
  lot,
  db,
  backToActivites,
  lotActivities,
  fieldName,
  existingActivity,
  verificationMode = false,
}) => {
  if (!lot) return null

  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth)

  // Map from English props to Spanish constants
  const spanishActivityType = mapToSpanishType(activityType);

  // Translations para mostrar en la UI
  const activityTypeTranslations = {
    "preparado": t('preparation'),
    "siembra": t('sowing'),
    "cosecha": t('harvesting'),
    "aplicacion": t('application'),
  }

  // Obtenemos el tipo traducido para la UI
  const translatedActivityType = activityTypeTranslations[spanishActivityType];

  // Se utiliza el tipo en español para guardar en la base de datos
  const rawActivityType = spanishActivityType;

  const { createWithdrawalOrder } = useOrder()
  let isEditing = existingActivity && Object.keys(existingActivity).length > 0
  const isNewActivity = !isEditing && !verificationMode
  const selectedCampaign = useAppSelector(
    (state) => state.campaign.selectedCampaign,
  )

  // Debug: Log what data we're receiving
  console.log('🔧 PLAN ACTIVITY DEBUG:', {
    verificationMode,
    existingActivity,
    isEditing,
    activityType,
    translatedActivityType: rawActivityType,
    existingActivityDetails: existingActivity?.detalles,
    existingActivityConditions: existingActivity?.condiciones,
    originalPlanifData: existingActivity?._originalPlanifData
  });

  const [showValidationNotification, setShowValidationNotification] = useState(false)
  const [missingFieldsList, setMissingFieldsList] = useState([])
  const [isSaving, setIsSaving] = useState(false) // Track save operation state
  const [dbError, setDbError] = useState(null) // Track database errors
  const [matchingPlan, setMatchingPlan] = useState<any>(null)
  const [isCheckingPlan, setIsCheckingPlan] = useState(false)
  const [isApplyingPlan, setIsApplyingPlan] = useState(false)
  const [appliedPlan, setAppliedPlan] = useState<any>(null)

  const {
    formData,
    setFormData,
    missingItem,
    setMissingItem,
    openConfirmDialog,
    setOpenConfirmDialog,
    openSnackbar,
    setOpenSnackbar,
    snackbarMessage,
    setSnackbarMessage,
    activeStep,
    setActiveStep,
    maxStepReached,
    setMaxStepReached,
    handleCloseSnackbar,
    handleNext,
    handleBack,
    handleStep,
  } = usePlanActivity(
    activityType,
    lot,
    rawActivityType, // Usamos el tipo en español para la lógica
    existingActivity,
    user,
    db,
    backToActivites,
    createWithdrawalOrder,
    selectedCampaign,
  )

  const steps =
    activityType === 'sowing' || spanishActivityType === 'siembra'
      ? [
        t('general'),
        t('supplies'),
        t('otherData'),
        t('services'),
        t('conditions'),
        t('observations'),
      ]
      : [
        t('general'),
        t('supplies'),
        t('services'),
        t('conditions'),
        t('observations'),
      ]

  const servicesStepIndex = steps.findIndex((label) => label === t('services'))

  const normalizeId = (value?: any) =>
    value ? String(value).trim().toLowerCase() : ''

  const getSelectedCampaignId = () =>
    normalizeId(selectedCampaign?._id || selectedCampaign?.campaignId || selectedCampaign?.id)

  const getCropIdFromForm = () => {
    const cultivo = formData?.detalles?.cultivo || {}
    return normalizeId(
      cultivo.cultivoId ||
      cultivo._id ||
      cultivo.id ||
      cultivo.uuid ||
      cultivo.uuidCultivo,
    )
  }

  const findMatchingPlanificacion = useCallback(async () => {
    try {
      if (!isNewActivity) {
        setMatchingPlan(null)
        return
      }
      setIsCheckingPlan(true)
      setMatchingPlan(null)

      const campaignId = getSelectedCampaignId()
      const cropId = getCropIdFromForm()
      const typeId = normalizeId(rawActivityType)

      if (!campaignId || !cropId || !typeId) {
        return
      }

      const resp = await db.allDocs({
        startkey: 'planactividad:',
        endkey: 'planactividad:\ufff0',
        include_docs: true,
      })

      const planDocs = (resp.rows || [])
        .map((r) => r.doc)
        .filter(Boolean) as any[]

      if (!planDocs.length) return

      const candidates = planDocs.filter((plan) => {
        const sameCampaign = normalizeId(plan.campanaId || plan.campaignId) === campaignId
        const sameType = normalizeId(plan.tipo) === typeId
        const notUsed = !plan.ejecucionId && plan.ejecutada !== true
        return sameCampaign && sameType && notUsed
      })

      if (!candidates.length) return

      const cicloIds = Array.from(
        new Set(
          candidates
            .map((p) => p.cicloId)
            .filter(Boolean),
        ),
      )

      const cicloDocs: Record<string, any> = {}
      if (cicloIds.length) {
        const ciclosResp = await db.allDocs({ keys: cicloIds, include_docs: true })
        ciclosResp.rows.forEach((row) => {
          if (row.doc) cicloDocs[row.id] = row.doc
        })
      }

      const firstMatch = candidates.find((plan) => {
        const ciclo = cicloDocs[plan.cicloId]
        const planCropId = normalizeId(plan.cultivoId || ciclo?.cultivoId)
        return planCropId && planCropId === cropId
      })

      if (firstMatch) {
        setMatchingPlan(firstMatch)
      }
    } catch (err) {
      console.warn('No se pudo evaluar planificaciones disponibles', err)
    } finally {
      setIsCheckingPlan(false)
    }
  }, [db, rawActivityType, formData?.detalles?.cultivo, selectedCampaign, isNewActivity])

  const getMissingFieldsMessages = (step) => {
    const fields = []
    // Se utiliza un objeto vacío en caso de que formData.detalles sea undefined
    const formDetails = formData.detalles || {}

    const currentStepName = steps[step]

    switch (currentStepName) {
      case t('general'):
        if (!formDetails.fecha_ejecucion_tentativa) fields.push(t('executionDate'))
        if (!formDetails.cultivo) fields.push(t('crop'))
        if (!formDetails.contratista || (!formDetails.contratista.nombreCompleto && !formDetails.contratista.razonSocial)) {
          fields.push(t('contractor'))
        }
        if (!formDetails.hectareas) fields.push(t('hectares'))
        // Para aplicación, requerir selección de siembra inicial
        if (
          (activityType === 'application' || spanishActivityType === 'aplicacion') &&
          !formDetails.siembra_inicial
        ) {
          fields.push(t('Initial Planting'))
        }
        break

      case t('supplies'):
        // Para cosecha, los insumos no son obligatorios
        if (spanishActivityType !== 'cosecha' && activityType !== 'harvesting') {
          if (!formDetails.dosis || formDetails.dosis.length === 0) {
            fields.push(t('atLeastOneSupply'))
          }
        }
        break

      case t('otherData'):
        if (activityType === 'sowing' || spanishActivityType === 'siembra') {
          if (!formDetails.densidad_objetivo) fields.push(t('targetDensity'))
          if (!formDetails.peso_1000) fields.push(t('weight1000seeds'))
          if (!formDetails.profundidad) fields.push(t('seedingDepth'))
          if (!formDetails.tipo_siembra) fields.push(t('seedingType'))
          if (!formDetails.distancia) fields.push(t('rowDistance'))
        }
        break

      case t('services'):
        if (!formDetails.servicios || formDetails.servicios.length === 0) {
          fields.push(t('atLeastOneService'))
        }
        break

      case t('conditions'):
        const condiciones = formData.condiciones || {}
        if (condiciones.humedad_max === undefined) fields.push(t('maxHumidity'))
        if (condiciones.humedad_min === undefined) fields.push(t('minHumidity'))
        if (condiciones.temperatura_max === undefined) fields.push(t('maxTemperature'))
        if (condiciones.temperatura_min === undefined) fields.push(t('minTemperature'))
        if (condiciones.velocidad_max === undefined) fields.push(t('maxSpeed'))
        if (condiciones.velocidad_min === undefined) fields.push(t('minSpeed'))
        break
    }

    return fields
  }

  // CORRECCIÓN: Verificar que "detalles" exista antes de acceder a sus propiedades
  const countMissingFields = (formData, step) => {
    let missingFields = 0
    const currentStepName = steps[step]

    switch (currentStepName) {
      case t('general'):
        if (!formData.detalles || !formData.detalles.fecha_ejecucion_tentativa) {
          missingFields++
        }
        if (!formData.detalles || !formData.detalles.cultivo) {
          missingFields++
        }
        if (!formData.detalles || !formData.detalles.contratista || (!formData.detalles.contratista.nombreCompleto && !formData.detalles.contratista.razonSocial)) {
          missingFields++
        }
        if (!formData.detalles || !formData.detalles.hectareas) {
          missingFields++
        }
        // Para aplicación, requerir selección de siembra inicial
        if (
          (activityType === 'application' || spanishActivityType === 'aplicacion') &&
          (!formData.detalles || !formData.detalles.siembra_inicial)
        ) {
          missingFields++
        }
        break

      case t('supplies'):
        // Para cosecha, los insumos no son obligatorios
        if (spanishActivityType !== 'cosecha' && activityType !== 'harvesting') {
          if (
            !formData.detalles ||
            !formData.detalles.dosis ||
            formData.detalles.dosis.length === 0
          ) {
            missingFields++
          }
        }
        break

      case t('otherData'):
        if (activityType === 'sowing' || spanishActivityType === 'siembra') {
          const details = formData.detalles || {}
          if (!details.densidad_objetivo) {
            missingFields++
          }
          if (!details.peso_1000) {
            missingFields++
          }
          if (!details.profundidad) {
            missingFields++
          }
          if (!details.tipo_siembra) {
            missingFields++
          }
          if (!details.distancia) {
            missingFields++
          }
        }
        break

      case t('services'):
        if (!formData.detalles || !formData.detalles.servicios || formData.detalles.servicios.length === 0) {
          missingFields++
        }
        break

      case t('conditions'):
        const condiciones = formData.condiciones || {}
        if (condiciones.humedad_max === undefined) {
          missingFields++
        }
        if (condiciones.humedad_min === undefined) {
          missingFields++
        }
        if (condiciones.temperatura_max === undefined) {
          missingFields++
        }
        if (condiciones.temperatura_min === undefined) {
          missingFields++
        }
        if (condiciones.velocidad_max === undefined) {
          missingFields++
        }
        if (condiciones.velocidad_min === undefined) {
          missingFields++
        }
        break

      case t('observations'):
        // Generalmente no hay campos requeridos en Observaciones
        break

      default:
        break
    }

    return missingFields
  }

  const validateAllSteps = () => {
    for (let step = 0; step < steps.length; step++) {
      const missingFields = countMissingFields(formData, step)
      if (missingFields > 0) {
        setSnackbarMessage(
          t('completeRequiredFields', { stepName: steps[step] })
        )
        setOpenSnackbar(true)
        setActiveStep(step)
        return false
      }
    }
    return true
  }

  // Check if database is available
  const checkDbConnection = async () => {
    try {
      // Try a simple database operation to check connection
      await withTimeout(db.info(), DB_OPERATION_TIMEOUT);
      return true;
    } catch (error) {
      console.error("Database connection check failed:", error);
      return false;
    }
  };

  // Fixed handleSave function with proper state tracking
  const handleSave = async () => {
    // Prevent multiple clicks
    if (isSaving) {
      console.log("Save already in progress, ignoring additional click");
      return;
    }

    // Set saving state immediately
    setIsSaving(true);
    setDbError(null);
    console.log("Starting save process...");

    try {
      // Check database connection first
      console.log("Checking database connection...");
      const isDbConnected = await checkDbConnection();
      if (!isDbConnected) {
        throw new Error(t('databaseConnectionError'));
      }
      console.log("Database connection check passed");

      // First validate all fields
      if (!validateAllSteps()) {
        setIsSaving(false);
        return;
      }

      // Prepare activity data
      let actividad = { ...formData };
      actividad.tipo = rawActivityType;

      // If we're in verification mode (converting planned activity to regular activity)
      if (verificationMode && existingActivity && (existingActivity.isPlanificada || existingActivity.estado === 'planificada')) {
        console.log("Converting planned activity to regular activity");
        console.log("Original planned data:", existingActivity._originalPlanifData);

        // Preserve all existing data while converting
        const originalData = existingActivity._originalPlanifData || existingActivity;

        // Merge the original data with the updated form data
        actividad = {
          ...originalData,
          ...actividad,
          detalles: {
            ...(originalData.detalles || {}),
            ...(actividad.detalles || {}),
          },
          condiciones: {
            ...(originalData.condiciones || {}),
            ...(actividad.condiciones || {}),
          }
        };

        // Remove the planned activity flag and change state
        delete actividad.isPlanificada;
        delete actividad._originalPlanifData;
        actividad.estado = 'pendiente'; // Change from 'planificada' to 'pendiente'

        // Generate a new ID for the regular activity
        try {
          const fechaEjecucion = actividad.detalles.fecha_ejecucion_tentativa;
          const parsedDate = new Date(fechaEjecucion);
          const formattedDate = format(parsedDate, 'yyyy-MM-dd');
          actividad._id = 'actividad:' + formattedDate + ':' + actividad.uuid;
          delete actividad._rev; // Remove revision since this will be a new document
          console.log("New regular activity ID generated:", actividad._id);
        } catch (error) {
          console.error('Error generating new ID for regular activity:', error);
          setIsSaving(false);
          return;
        }

        // Try to delete the original planned activity
        try {
          if (existingActivity._id && existingActivity._id.startsWith('planactividad:')) {
            console.log("🗑️ ATTEMPTING TO DELETE PLANNED ACTIVITY:", existingActivity._id);

            // Get the current document to ensure we have the latest _rev
            const currentDoc = await db.get(existingActivity._id);
            console.log("📄 GOT CURRENT DOC FOR DELETION:", currentDoc);

            // Delete the document
            const deleteResult = await db.remove(currentDoc);
            console.log("✅ PLANNED ACTIVITY DELETED SUCCESSFULLY:", deleteResult);

            // Also try to delete any associated supply and service lines
            if (currentDoc.insumosLineasIds && currentDoc.insumosLineasIds.length > 0) {
              try {
                const insumosResult = await db.allDocs({
                  keys: currentDoc.insumosLineasIds,
                  include_docs: true
                });
                for (const row of insumosResult.rows) {
                  if (row.doc) {
                    await db.remove(row.doc);
                    console.log("🗑️ Deleted supply line:", row.doc._id);
                  }
                }
              } catch (insumosError) {
                console.warn("Could not delete some supply lines:", insumosError);
              }
            }

            if (currentDoc.laboresLineasIds && currentDoc.laboresLineasIds.length > 0) {
              try {
                const laboresResult = await db.allDocs({
                  keys: currentDoc.laboresLineasIds,
                  include_docs: true
                });
                for (const row of laboresResult.rows) {
                  if (row.doc) {
                    await db.remove(row.doc);
                    console.log("🗑️ Deleted service line:", row.doc._id);
                  }
                }
              } catch (laboresError) {
                console.warn("Could not delete some service lines:", laboresError);
              }
            }
          }
        } catch (error) {
          console.error("❌ ERROR DELETING PLANNED ACTIVITY:", error);
          console.error("Existing activity data:", existingActivity);
          // Continue anyway - the save operation is more important
        }

        // Force this to be treated as a new activity
        isEditing = false;
      }

      console.log("Starting saveActivity operation...");

      // Implement our own timeout for the save operation
      await withTimeout(
        saveActivity(
          actividad,
          isEditing,
          db,
          user,
          selectedCampaign,
          createWithdrawalOrder,
          () => {
            // Success callback
            console.log("Save operation completed successfully");
            // Force manual navigation after a brief delay to ensure state is settled
            setTimeout(() => {
              backToActivites();
            }, 100);
          }
        ),
        DB_OPERATION_TIMEOUT
      );

      // Mark planificación as used if we applied one
      if (appliedPlan?.planDoc?._id) {
        try {
          const latestPlan = await db.get(appliedPlan.planDoc._id)
          await db.put({
            ...latestPlan,
            ejecucionId: actividad?._id || actividad?.uuid || latestPlan?.ejecucionId,
            ejecutada: true,
          })
          console.log('✅ Planned activity marked as used:', appliedPlan.planDoc._id)
        } catch (markError) {
          console.warn('Could not mark planned activity as used', markError)
        }
      }
    } catch (error) {
      console.error("Error saving activity:", error);

      // Handle specific error types
      if (error.status === 429) {
        setDbError(t('tooManyRequestsError'));
      } else if (error.message?.includes('CORS') || error.name === 'TypeError') {
        setDbError(t('networkError'));
      } else if (error.message?.includes('timed out')) {
        setDbError(t('operationTimeoutError'));
      } else {
        setDbError(t('generalSaveError') + ': ' + (error.message || ''));
      }

      setSnackbarMessage(t('errorSavingActivity'));
      setOpenSnackbar(true);
      setIsSaving(false);
    }
  };

  const handleApplyPlannedActivity = useCallback(async () => {
    if (!matchingPlan) return
    setIsApplyingPlan(true)
    try {
      const cicloDoc = matchingPlan.cicloId
        ? await db.get(matchingPlan.cicloId).catch(() => null)
        : null

      let cropDoc = formData.detalles?.cultivo
      if (cicloDoc?.cultivoId) {
        try {
          cropDoc = await dbContext.crops.get(cicloDoc.cultivoId)
        } catch (cropErr) {
          console.warn('Crop not found for plan cycle', cropErr)
        }
      }

      const insumos: any[] = []
      if (matchingPlan.insumosLineasIds?.length) {
        const insResp = await db.allDocs({
          keys: matchingPlan.insumosLineasIds,
          include_docs: true,
        })
        for (const row of insResp.rows) {
          const line: any = row.doc
          if (!line) continue
          let insumoDoc = null
          if (line.insumoId) {
            try {
              insumoDoc = await dbContext.supplies.get(line.insumoId)
            } catch (insErr) {
              console.warn('Supply not found for plan line', line.insumoId, insErr)
            }
          }
          insumos.push({
            insumo: insumoDoc || { _id: line.insumoId, name: line.insumoId },
            dosificacion: line.dosis ?? '',
            total: line.totalCantidad ?? '',
            deposito: null,
            uuid: line._id || uuidv7(),
          })
        }
      }

      const servicios: any[] = []
      if (matchingPlan.laboresLineasIds?.length) {
        const labResp = await db.allDocs({
          keys: matchingPlan.laboresLineasIds,
          include_docs: true,
        })
        for (const row of labResp.rows) {
          const line: any = row.doc
          if (!line) continue
          let laborDoc = null
          if (line.laborId) {
            try {
              laborDoc = await dbContext.laborsServices.get(line.laborId)
            } catch (labErr) {
              console.warn('Labor not found for plan line', line.laborId, labErr)
            }
          }
          servicios.push({
            servicio: laborDoc || { _id: line.laborId, service: laborDoc?.service || laborDoc?.name || line.laborId },
            contratista: matchingPlan.contratista || formData.detalles?.contratista || null,
            comentario: line.comentario || '',
            unidades: line.hectareas || matchingPlan.area || formData.detalles?.hectareas,
            uuid: line._id || uuidv7(),
          })
        }
      }

      const updatedDetalles = {
        ...formData.detalles,
        fecha_ejecucion_tentativa:
          matchingPlan.fecha || formData.detalles?.fecha_ejecucion_tentativa,
        hectareas: matchingPlan.area || formData.detalles?.hectareas,
        cultivo: cropDoc || formData.detalles?.cultivo,
        contratista: matchingPlan.contratista || formData.detalles?.contratista,
        dosis: insumos.length ? insumos : formData.detalles?.dosis,
        servicios: servicios.length ? servicios : formData.detalles?.servicios,
        zafra: formData.detalles?.zafra || cicloDoc?.zafra || formData.detalles?.zafra,
      }

      setFormData((prev) => ({
        ...prev,
        detalles: updatedDetalles,
        _sourcePlanActividadId: matchingPlan._id,
        _originalPlanifData: matchingPlan,
      }))
      setAppliedPlan({ planDoc: matchingPlan, cicloDoc })
      setSnackbarMessage(t('Planificación aplicada al formulario'))
      setOpenSnackbar(true)
    } catch (err) {
      console.error('Error al aplicar la planificación', err)
      setSnackbarMessage(t('No se pudo aplicar la planificación'))
      setOpenSnackbar(true)
    } finally {
      setIsApplyingPlan(false)
    }
  }, [matchingPlan, formData, t, db])

  // Fixed handleStepClick function
  const handleStepClick = (index) => {
    if (index <= maxStepReached) {
      const currentStepValidation = getStepValidationStatus(activeStep)

      if (!currentStepValidation.isValid) {
        const missingFields = getMissingFieldsMessages(activeStep)
        setMissingFieldsList(missingFields)
        setShowValidationNotification(true)
        return
      }

      // Direct state updates instead of using the function from hook
      setActiveStep(index);
      setMaxStepReached((prevMaxStep) => Math.max(prevMaxStep, index));
    }
  }

  // Para la UI, se utiliza el icono basado en el activityType original
  const ActivityIcon = activityIcons[activityType]

  const getStepValidationStatus = (stepIndex) => {
    const missingFields = countMissingFields(formData, stepIndex)
    return {
      isValid: missingFields === 0,
      missingCount: missingFields,
    }
  }

  const getStepStatus = (stepIndex) => {
    if (stepIndex === activeStep) return 'current'
    if (stepIndex < activeStep) {
      const { isValid } = getStepValidationStatus(stepIndex)
      return isValid ? 'complete' : 'invalid'
    }
    if (stepIndex <= maxStepReached) return 'available'
    return 'upcoming'
  }

  const getActivityColor = () => {
    switch (activityType) {
      case 'sowing':
        return '#10b981'
      case 'application':
        return '#3b82f6'
      case 'harvesting':
        return '#f59e0b'
      default:
        return '#6b7280'
    }
  }

  const getProgressColor = () => {
    switch (activityType) {
      case 'sowing':
        return 'success'
      case 'application':
        return 'info'
      case 'harvesting':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const getStepStyle = (status) => {
    switch (status) {
      case 'complete':
        return {
          background: getActivityColor(),
          color: 'white',
          border: 'none',
        }
      case 'current':
        return {
          background: 'white',
          color: getActivityColor(),
          border: `2px solid ${getActivityColor()}`,
        }
      case 'invalid':
        return {
          background: '#ef4444',
          color: 'white',
          border: 'none',
        }
      case 'upcoming':
        return {
          background: '#f3f4f6',
          color: '#6b7280',
          border: 'none',
        }
      default:
        return {
          background: '#e5e7eb',
          color: '#6b7280',
          border: 'none',
        }
    }
  }

  // Reset isSaving after 15 seconds as a safety mechanism
  useEffect(() => {
    let timeoutId;
    if (isSaving) {
      timeoutId = setTimeout(() => {
        console.warn("Save operation timeout safety triggered");
        setIsSaving(false);
        setDbError(t('operationTimeoutError'));
        setSnackbarMessage(t('errorSavingActivity'));
        setOpenSnackbar(true);
      }, 15000); // 15 seconds safety timeout
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isSaving]);

  useEffect(() => {
    findMatchingPlanificacion()
  }, [findMatchingPlanificacion])

  return (
    <Container className="py-6">
      <Card className="shadow-lg">
        {/* Header */}
        <CardHeader
          className="p-0"
          style={{
            borderTopLeftRadius: '0.5rem',
            borderTopRightRadius: '0.5rem',
          }}
        >
          <ActivityHeader
            activityType={activityType}
            fieldName={fieldName}
            lot={lot}
            formData={formData}
            activityIcons={activityIcons}
            mode="plan"
            isEditing={isEditing}
            getActivityColor={getActivityColor}
          />
        </CardHeader>

        {/* Database error alert */}
        {dbError && (
          <Alert
            color="danger"
            className="m-3"
          >
            <div className="d-flex align-items-center">
              <AlertCircle size={20} className="me-2" />
              <div>
                <strong>{t('databaseError')}</strong>
                <div>{dbError}</div>
                <small>{t('tryAgainLater')}</small>
              </div>
            </div>
          </Alert>
        )}

        {/* Stepper */}
        <div className="px-4 py-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            {steps.map((step, index) => {
              const status = getStepStatus(index)
              const { isValid, missingCount } = getStepValidationStatus(index)
              const tooltipText =
                !isValid && index < activeStep
                  ? t('missingRequiredFields', { count: missingCount, stepName: step })
                  : ''

              return (
                <div
                  key={step}
                  className="text-center position-relative"
                  style={{ flex: 1 }}
                >
                  <div
                    onClick={() => handleStepClick(index)}
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      cursor: index <= maxStepReached ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      ...getStepStyle(status),
                    }}
                    title={tooltipText}
                  >
                    {status === 'complete' ? (
                      <Check size={20} />
                    ) : status === 'invalid' ? (
                      <AlertCircle size={20} />
                    ) : (
                      <span style={{ fontWeight: '600' }}>{index + 1}</span>
                    )}
                  </div>

                  <div className="mt-2">
                    <small
                      className={status === 'invalid' ? 'text-danger' : 'text-muted'}
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
                      color={status === 'invalid' ? 'danger' : getProgressColor()}
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
              )
            })}
          </div>
        </div>

        {/* Content */}
        <CardBody className="p-4">
          {activeStep === 0 && isNewActivity && (
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex flex-column">
                <small className="text-muted">
                  {t('Si hay una planificación que coincida (campaña, cultivo y tipo), puedes autocompletarla.')}
                </small>
                {matchingPlan && (
                  <small className="text-success">
                    {t('Planificación encontrada y lista para aplicar.')}
                  </small>
                )}
                {!matchingPlan && (
                  <small className="text-muted">
                    {isCheckingPlan
                      ? t('Buscando planificación coincidente...')
                      : t('No se encontró planificación coincidente aún.')}
                  </small>
                )}
              </div>
              <Button
                color={matchingPlan ? 'warning' : 'secondary'}
                onClick={handleApplyPlannedActivity}
                disabled={
                  !matchingPlan || isCheckingPlan || isApplyingPlan || isSaving
                }
                className="d-flex align-items-center gap-2"
                title={
                  matchingPlan
                    ? t('Aplicar planificación coincidente')
                    : t('No hay planificación compatible')
                }
                id="apply-plan-button"
              >
                {isCheckingPlan || isApplyingPlan ? (
                  <span className="d-flex align-items-center gap-2">
                    <Spinner size="sm" />
                    {t('Buscando...')}
                  </span>
                ) : (
                  <span className="d-flex align-items-center gap-2">
                    <Sprout size={16} />
                    {t('Programar')}
                  </span>
                )}
              </Button>
            </div>
          )}

          <PlanActivityContent
            step={activeStep}
            activityType={activityType}
            lotActivities={lotActivities}
            lot={lot}
            db={db}
            formData={formData}
            setFormData={setFormData}
            selectedCampaign={selectedCampaign}
          />
        </CardBody>

        {/* Actions */}
        <CardFooter className="bg-light d-flex justify-content-between align-items-center p-4">
          <Button
            color="light"
            onClick={backToActivites}
            className="d-flex align-items-center gap-2"
            disabled={isSaving}
          >
            <ChevronLeft size={16} />
            {t('back')}
          </Button>

          <div className="d-flex gap-2">
            {activeStep > 0 && (
              <Button
                color="light"
                onClick={handleBack}
                className="d-flex align-items-center gap-2"
                disabled={isSaving}
              >
                <ChevronLeft size={16} />
                {t('previous')}
              </Button>
            )}

            {activeStep === steps.length - 1 ? (
              <Button
                color={getProgressColor()}
                onClick={handleSave}
                disabled={isSaving}
                id="save-activity-button"
              >
                {isSaving ? (
                  <span className="d-flex align-items-center">
                    <Spinner size="sm" className="me-2" />
                    {t('saving')}
                  </span>
                ) : (
                  <span>{isEditing ? t('update') : t('save')} {t('activity')}</span>
                )}
              </Button>
            ) : (
              <Button
                color="primary"
                onClick={() => {
                  const currentStepValidation = getStepValidationStatus(activeStep)
                  console.log('Validation status:', currentStepValidation)
                  if (!currentStepValidation.isValid) {
                    const missingFields = getMissingFieldsMessages(activeStep)
                    console.log('Missing fields:', missingFields)
                    console.log('Current step:', steps[activeStep])
                    setMissingFieldsList(missingFields)
                    setShowValidationNotification(true)
                    console.log('showValidationNotification set to true')
                    return
                  }
                  console.log('About to call handleNext with steps:', steps)
                  handleNext(steps)
                }}
                className="d-flex align-items-center gap-2"
                disabled={isSaving}
              >
                {t('next')}
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Snackbar Alert */}
      {openSnackbar && (
        <Alert
          color="warning"
          className="position-fixed bottom-0 end-0 m-4 d-flex align-items-center justify-content-between"
          style={{

            maxWidth: '400px',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            animation: 'slideUp 0.3s ease-out',
            zIndex: 1050,
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <span>{snackbarMessage}</span>
          </div>
          <Button close onClick={handleCloseSnackbar} />
        </Alert>
      )}

      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slide-up {
            animation: slideUp 0.3s ease-out forwards;
          }
        `}
      </style>

      {showValidationNotification && (
        <ValidationAlert
          isOpen={showValidationNotification}
          onClose={() => setShowValidationNotification(false)}
          currentStep={steps[activeStep]}
          requiredFields={missingFieldsList}
        />
      )}
    </Container>
  )
}

export default PlanActivity