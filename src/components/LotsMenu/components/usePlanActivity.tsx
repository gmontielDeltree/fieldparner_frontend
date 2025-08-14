import { useState, useEffect } from 'react'
import { getEmptyActivity, Actividad } from '../../../interfaces/activity'
import { useSupply } from '../../../hooks'

interface UsePlanActivityParams {
  activityType: string
  lot: any
  translatedActivityType: string
  existingActivity: Actividad | null
  user: any
  db: any
  backToActivites: () => void
  createWithdrawalOrder: any
  selectedCampaign: any
}

export const usePlanActivity = (
  activityType: string,
  lot: any,
  translatedActivityType: string,
  existingActivity: Actividad | null,
  user: any,
  db: any,
  backToActivites: () => void,
  createWithdrawalOrder: any,
  selectedCampaign: any,
) => {
  const [formData, setFormData] = useState(
    existingActivity || getEmptyActivity(),
  )
  const [missingItem, setMissingItem] = useState('')
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [maxStepReached, setMaxStepReached] = useState(0)
  const { getSupplies } = useSupply()

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      lote_uuid: lot.id,
      ts_generacion: 0,
      // Se usa el operador opcional para evitar el error
      tipo: translatedActivityType?.toLowerCase() || '',
      detalles: {
        ...prevFormData.detalles,
        hectareas: lot.properties.hectareas,
      },
    }))
  }, [])

  useEffect(() => {
    if (existingActivity) {
      console.log('📝 SETTING EXISTING ACTIVITY AS FORM DATA:', existingActivity);
      
      // Special handling for planned activities (actividades planificadas)
      if (existingActivity.isPlanificada || existingActivity.estado === 'planificada') {
        console.log('🔄 PROCESSING PLANNED ACTIVITY FOR UNLOCK');
        
        // Use the original planification data if available, otherwise use the mapped data
        const sourceData = existingActivity._originalPlanifData || existingActivity;
        console.log('📋 SOURCE DATA FOR PLANNED ACTIVITY:', sourceData);
        
        // Create a properly structured activity from planned activity data
        const activityData = {
          ...getEmptyActivity(), // Start with empty structure
          
          // Basic activity info
          _id: existingActivity._id,
          uuid: existingActivity.uuid,
          lote_uuid: existingActivity.lote_uuid || lot.id,
          tipo: existingActivity.tipo || translatedActivityType?.toLowerCase() || '',
          estado: 'pendiente', // Change from 'planificada' to 'pendiente'
          ts_generacion: existingActivity.ts_generacion || 0,
          
          // Campaign info - use selectedCampaign to get the name
          campaña: {
            campaignId: existingActivity.campaña?.campaignId || sourceData.campanaId || sourceData.campaña?.campaignId,
            name: selectedCampaign?.name || existingActivity.campaña?.name,
            nombreComercial: selectedCampaign?.nombreComercial || existingActivity.campaña?.nombreComercial
          },
          
          // Details mapping - handle both original planif structure and mapped structure
          detalles: {
            ...getEmptyActivity().detalles, // Ensure all detail fields exist
            
            // Basic fields
            fecha_ejecucion_tentativa: sourceData.fecha || existingActivity.detalles?.fecha_ejecucion_tentativa,
            hectareas: sourceData.area || existingActivity.detalles?.hectareas || lot.properties.hectareas,
            cultivo: sourceData.cultivo || existingActivity.detalles?.cultivo,
            contratista: sourceData.contratista || existingActivity.detalles?.contratista,
            ingeniero: sourceData.ingeniero || existingActivity.detalles?.ingeniero || existingActivity.ingeniero,
            business: sourceData.ingeniero || sourceData.accountId || existingActivity.detalles?.business || existingActivity.detalles?.ingeniero || 'ffdfs',
            
            // Supply and service data - use the mapped data from index.tsx
            dosis: existingActivity.detalles?.dosis || sourceData.dosis || [],
            servicios: existingActivity.detalles?.servicios || sourceData.servicios || [],
            
            // Yield estimates
            rinde_estimado: sourceData.rindeEstimado || sourceData.rendimientoEstimado || existingActivity.detalles?.rinde_estimado || 0,
            rinde_estimado_total: sourceData.rendimientoEstimadoTotal || existingActivity.detalles?.rinde_estimado_total || 0,
            
            // Flags
            fertilizacion: sourceData.fertilizacion || existingActivity.detalles?.fertilizacion || false,
            fitosanitaria: sourceData.fitosanitaria || existingActivity.detalles?.fitosanitaria || false,
            zafra: sourceData.zafra || existingActivity.detalles?.zafra || '',
            
            // Sowing-specific fields (handle both original and mapped formats)
            densidad_objetivo: sourceData.densidadObjetivo || sourceData.detalles?.densidad_objetivo || existingActivity.detalles?.densidad_objetivo,
            peso_1000: sourceData.peso1000 || sourceData.detalles?.peso_1000 || existingActivity.detalles?.peso_1000,
            profundidad: sourceData.profundidad || sourceData.detalles?.profundidad || existingActivity.detalles?.profundidad,
            tipo_siembra: sourceData.tipoSiembra || sourceData.detalles?.tipo_siembra || existingActivity.detalles?.tipo_siembra,
            distancia: sourceData.distancia || sourceData.detalles?.distancia || existingActivity.detalles?.distancia,
            
            // Any other existing details
            ...(existingActivity.detalles || {}),
            
            // Force business field to have value for engineer dropdown
            business: sourceData.ingeniero || sourceData.accountId || existingActivity.detalles?.business || existingActivity.detalles?.ingeniero || 'ffdfs',
          },
          
          // Conditions mapping
          condiciones: {
            ...getEmptyActivity().condiciones, // Ensure all condition fields exist
            ...(sourceData.condiciones || {}), // Original conditions
            ...(existingActivity.condiciones || {}), // Mapped conditions
          },
          
          // Additional fields
          contratista: sourceData.contratista || existingActivity.contratista,
          ingeniero: sourceData.ingeniero || existingActivity.ingeniero,
          comentario: sourceData.comentario || sourceData.comentarios || existingActivity.comentario || 'Actividad desbloqueada',
          observaciones: sourceData.observaciones || sourceData.comentarios || existingActivity.observaciones || '',
          
          // Keep reference to original data for verification mode processing
          _originalPlanifData: sourceData,
          isPlanificada: true, // Keep this flag for verification mode logic
        };
        
        console.log('✅ FINAL ACTIVITY DATA FOR PLANNED ACTIVITY:', activityData);
        console.log('🎯 FINAL VERIFICATION:', {
          hasInsumos: activityData.detalles?.dosis?.length > 0,
          hasServicios: activityData.detalles?.servicios?.length > 0,
          hasIngeniero: !!activityData.detalles?.ingeniero,
          hasBusiness: !!activityData.detalles?.business,
          hasContratista: !!activityData.detalles?.contratista,
          hasCultivo: !!activityData.detalles?.cultivo,
          campaignName: activityData.campaña?.name || activityData.campaña?.nombreComercial || 'No name',
          ingenieroValue: activityData.detalles?.ingeniero,
          businessValue: activityData.detalles?.business
        });
        setFormData(activityData);
      } else {
        // Regular activity handling
        const activityData = {
          ...getEmptyActivity(), // Start with empty structure
          ...existingActivity,   // Override with existing data
          detalles: {
            ...getEmptyActivity().detalles, // Ensure all detail fields exist
            ...(existingActivity.detalles || {}), // Override with existing details
            hectareas: existingActivity.detalles?.hectareas || lot.properties.hectareas,
          },
          condiciones: {
            ...getEmptyActivity().condiciones, // Ensure all condition fields exist
            ...(existingActivity.condiciones || {}), // Override with existing conditions
          },
          lote_uuid: existingActivity.lote_uuid || lot.id,
          tipo: existingActivity.tipo || translatedActivityType?.toLowerCase() || '',
        };
        setFormData(activityData);
      }
    } else {
      console.log('📝 SETTING EMPTY ACTIVITY AS FORM DATA');
      setFormData(getEmptyActivity())
    }
  }, [existingActivity, lot.id, lot.properties.hectareas, translatedActivityType])

  useEffect(() => {
    getSupplies()
  }, [])

  useEffect(() => {
    if (!existingActivity) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        lote_uuid: lot.id,
        ts_generacion: 0,
        // Se usa el operador opcional para evitar el error
        tipo: translatedActivityType?.toLowerCase() || '',
        detalles: {
          ...prevFormData.detalles,
          hectareas: lot.properties.hectareas,
        },
      }))
    }
  }, [lot, translatedActivityType, existingActivity])

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenSnackbar(false)
  }

  const handleNext = (steps) => {
    const currentStepName = steps[activeStep]

    if (currentStepName === 'Servicios') {
      if (
        !formData.detalles.servicios ||
        formData.detalles.servicios.length === 0
      ) {
        setMissingItem('servicios')
        setOpenConfirmDialog(true)
        return
      }
    }

    if (currentStepName === 'Insumos') {
      // Para cosecha, los insumos no son obligatorios
      const isHarvest = translatedActivityType === 'cosecha' || activityType === 'harvesting'
      if (!isHarvest && (!formData.detalles.dosis || formData.detalles.dosis.length === 0)) {
        setMissingItem('insumos')
        setOpenConfirmDialog(true)
        return
      }
    }

    setActiveStep((prevActiveStep) => {
      const nextStep = prevActiveStep + 1
      setMaxStepReached((prevMaxStep) => Math.max(prevMaxStep, nextStep))
      return nextStep
    })
  }

  const handleBack = () => {
    if (activeStep === 0) {
      backToActivites()
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }
  }

  const handleStep = (step: number) => () => {
    setActiveStep(step)
    setMaxStepReached((prevMaxStep) => Math.max(prevMaxStep, step))
  }

  return {
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
  }
}
