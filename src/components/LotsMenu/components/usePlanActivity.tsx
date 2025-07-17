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
      // Ensure we have a properly structured activity with all required fields
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
    } else {
      console.log('📝 SETTING EMPTY ACTIVITY AS FORM DATA');
      setFormData(getEmptyActivity())
    }
  }, [existingActivity])

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
      if (!formData.detalles.dosis || formData.detalles.dosis.length === 0) {
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
