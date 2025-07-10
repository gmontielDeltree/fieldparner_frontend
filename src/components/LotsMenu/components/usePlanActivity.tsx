import { useState, useEffect } from 'react'
import { getEmptyActivity } from '../../../interfaces/activity'
import { useSupply } from '../../../hooks'

export const usePlanActivity = (
  activityType,
  lot,
  translatedActivityType,
  existingActivity,
  user,
  db,
  backToActivites,
  createWithdrawalOrder,
  selectedCampaign,
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
      setFormData(existingActivity)
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
