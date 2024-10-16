import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import PersonalForm from './forms/PlanForms/PersonalForm'
import SuppliesForm from './forms/PlanForms/SuppliesForm'
import OtherDetailsForm from './forms/PlanForms/OtherDetailsForm'
import ServicesForm from './forms/PlanForms/ServicesForm'
import ConditionsForm from './forms/PlanForms/ConditionsForm'
import ObservationsForm from './forms/PlanForms/ObservationsForm'
import { getEmptyActivity } from '../../interfaces/activity'
import { format } from 'date-fns'
import LocalFloristIcon from '@mui/icons-material/LocalFlorist'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import GrassIcon from '@mui/icons-material/Grass'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import EditIcon from '@mui/icons-material/Edit'
import { keyframes } from '@emotion/react'
import { useTheme } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import { Actividad } from '../../interfaces/activity'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import {
  ApplicationType,
  HarvestType,
  PreparedType,
  SowingType,
  WithdrawalOrderType,
} from '../../../src/types'
import { useAppSelector, useOrder, useSupply } from '../../hooks'
import { useTranslation } from 'react-i18next'

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

const activityTypeTranslations = {
  preparation: 'Preparado',
  sowing: 'Siembra',
  harvesting: 'Cosecha',
  application: 'Aplicacion',
}

const activityIcons = {
  sowing: <LocalFloristIcon sx={{ fontSize: 50, color: 'green' }} />,
  application: <GrassIcon sx={{ fontSize: 50, color: 'green' }} />,
  harvesting: <AgricultureIcon sx={{ fontSize: 50, color: 'green' }} />,
}

interface PlanActivityProps {
  activityType: string
  fieldName: string
  lot: any
  db: any
  field: any
  backToActivites: () => void
  existingActivity: Actividad
}

const PlanActivity: React.FC<PlanActivityProps> = ({
  activityType,
  lot,
  db,
  backToActivites,
  fieldName,
  existingActivity,
}) => {
  if (!lot) return null
  const [formData, setFormData] = useState(
    existingActivity || getEmptyActivity(),
  )
  const [missingItem, setMissingItem] = useState('')
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const { user } = useAppSelector((state) => state.auth)
  const translatedActivityType = activityTypeTranslations[activityType]
  const [maxStepReached, setMaxStepReached] = useState(0)
  const { getSupplies } = useSupply()
  const { createWithdrawalOrder } = useOrder()
  const theme = useTheme()
  const isEditing = existingActivity && Object.keys(existingActivity).length > 0
  const selectedCampaign = useAppSelector(
    (state) => state.campaign.selectedCampaign,
  )
  const { t } = useTranslation()

  const floating = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  `

  const titleBg = isEditing
    ? `linear-gradient(60deg, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`
    : `linear-gradient(45deg, #a0a0a0, #626262)`
  const steps =
    activityType === 'sowing'
      ? [
          'General',
          'Insumos',
          'Otros Datos',
          'Servicios',
          'Condiciones',
          'Observaciones',
        ]
      : ['General', 'Insumos', 'Servicios', 'Condiciones', 'Observaciones']

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      lote_uuid: lot.id,
      ts_generacion: 0,
      tipo: translatedActivityType.toLowerCase(),
      detalles: {
        ...prevFormData.detalles,
        hectareas: lot.properties.hectareas,
      },
    }))
  }, [])

  useEffect(() => {
    if (existingActivity) {
      setFormData(existingActivity)
    } else {
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
        tipo: translatedActivityType.toLowerCase(),
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

  const countMissingFields = (formData, step) => {
    let missingFields = 0

    if (activityType !== 'sowing' && step > 1) {
      step = step + 1
    }

    switch (step) {
      case 0: // PersonalForm
        if (!formData.detalles.fecha_ejecucion_tentativa) {
          missingFields++
        }
        if (!formData.detalles.cultivo) {
          missingFields++
        }
        if (!formData.contratista) {
          missingFields++
        }
        if (!formData.detalles || !formData.detalles.hectareas) {
          missingFields++
        }
        break
      case 1: // SuppliesForm (Insumos)
        if (
          !formData.detalles ||
          !formData.detalles.dosis ||
          formData.detalles.dosis.length === 0
        ) {
          missingFields++
        }
        break
      case 2: // OtherDetailsForm
        const details = formData.detalles || {}
        if (!details.densidad_objetivo) {
          missingFields++
        }
        // if (!details.formacion_inoculado) {
        //   missingFields++;
        // }
        // if (!details.marca_inoculado) {
        //   missingFields++;
        // }
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
        break
      case 3: // ServicesForm (Labores)
        if (!formData.detalles || !formData.detalles.servicios) {
          missingFields++
        }
        break
      case 4: // ConditionsForm
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
      default:
        break
    }

    return missingFields
  }

  const getStepContent = (step: number) => {
    if (activityType !== 'sowing' && step > 1) {
      step = step + 1
    }
    switch (step) {
      case 0:
        return (
          <PersonalForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
            showActivityType={activityType === 'application'}
          />
        )
      case 1:
        return (
          <SuppliesForm
            lot={lot}
            db={db}
            formData={formData}
            setFormData={setFormData}
          />
        )
      case 2:
        return (
          <OtherDetailsForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
          />
        )

      case 3:
        return (
          <ServicesForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
          />
        )
      case 4:
        return (
          <ConditionsForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
          />
        )
      case 5:
        return (
          <ObservationsForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
          />
        )
      default:
        return <div>Unknown Step</div>
    }
  }

  const handleNext = () => {
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

  const reserveSupplyStock = async (dosis) => {
    const newWithdrawalOrder = {
      accountId: user.accountId,
      type: WithdrawalOrderType.Labor,
      creationDate: new Date().toISOString(),
      order: 0,
      reason: 'Reserva de stock',
      campaign: selectedCampaign,
      field: dosis.insumo.campo,
      state: 'pending',
    }

    const newDepositSupplyOrder = {
      order: 0,
      accountId: user.accountId,
      deposit: dosis.deposito,
      location: dosis.ubicacion,
      supply: dosis.insumo,
      nroLot: dosis.nro_lote,
      withdrawalAmount: dosis.total,
      originalAmount: dosis.total,
    }

    const success = await createWithdrawalOrder(newWithdrawalOrder, [
      newDepositSupplyOrder,
    ])
    if (success) {
      dosis.orden_de_retiro = newWithdrawalOrder
      return newWithdrawalOrder
    } else {
      throw new Error(`Error reserving stock for supply ${dosis.insumo.name}`)
    }
  }

  const handleSave = async () => {
    for (let step = 0; step < steps.length; step++) {
      const missingFields = countMissingFields(formData, step)
      if (missingFields > 0) {
        setSnackbarMessage(
          `Por favor completa todos los campos requeridos en el paso: ${steps[step]}`,
        )
        setOpenSnackbar(true)
        setActiveStep(step)
        return
      }
    }

    let actividad = { ...formData }

    if (
      [SowingType, PreparedType, HarvestType, ApplicationType].includes(
        actividad.tipo,
      )
    ) {
      actividad.campaña = selectedCampaign
    }

    if (!isEditing) {
      try {
        const fechaEjecucion = actividad.detalles.fecha_ejecucion_tentativa
        const parsedDate = new Date(fechaEjecucion)
        const formattedDate = format(parsedDate, 'yyyy-MM-dd')
        actividad._id = 'actividad:' + formattedDate + ':' + actividad.uuid
      } catch (error) {
        console.error('Error generating new ID for activity:', error)
        return
      }
    }

    try {
      const doc = await db.get(actividad._id)
      actividad._rev = doc._rev
      await db.put(actividad)
      console.log('Actividad guardada', 'success')
      backToActivites()
    } catch (error) {
      if (error.name === 'not_found') {
        console.log('Actividad not found. Creating a new one.')
        delete actividad._rev
        try {
          await db.put(actividad)
          console.log('New actividad created', 'success')

          if (actividad.detalles.dosis) {
            for (const dosis of actividad.detalles.dosis) {
              try {
                await reserveSupplyStock(dosis)
              } catch (error) {
                console.error(
                  `Error reserving stock for supply ${dosis.insumo.name}:`,
                  error,
                )
                return
              }
            }
          }

          backToActivites()
        } catch (err) {
          console.error('Error creating new actividad:', err)
        }
      } else if (error.name === 'conflict') {
        console.error('Conflict detected. Trying to save again.')
      } else {
        console.error('Error saving actividad:', error)
      }
    }
  }

  useEffect(() => {
    console.log('FORM DATA: ', formData)
  })

  const ActivityIcon = activityIcons['sowing']

  return (
    <div>
      <Box sx={{ textAlign: 'center', mt: 2, mb: 4 }}>
        {ActivityIcon}{' '}
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 'bold',
            mt: 2,
            background: titleBg,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '1px 1px 4px rgba(0,0,0,0.15)',
            animation: isEditing
              ? `${floating} 3s ease-in-out infinite`
              : 'none',
          }}
        >
          {isEditing ? (
            <>
              <EditIcon
                sx={{
                  verticalAlign: 'middle',
                  mr: 1,
                  animation: `${floating} 3s ease-in-out infinite`,
                }}
              />
              Editar {translatedActivityType}
            </>
          ) : (
            `Programar ${translatedActivityType}`
          )}
        </Typography>
      </Box>
      <Stepper
        activeStep={activeStep}
        sx={{ pt: 3, pb: 5, backgroundColor: '#f5f5f5', borderRadius: '4px' }}
      >
        {steps.map((label, index) => (
          <Step key={label} onClick={handleStep(index)}>
            <StepLabel
              sx={{
                color: 'primary.main',
                '& .MuiStepLabel-label': {
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                },
              }}
            >
              {label}
              {index <= maxStepReached && (
                <Badge
                  badgeContent={countMissingFields(formData, index)}
                  color="error"
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: -9,
                    transform: 'scale(1) translate(50%, -50%)',
                  }}
                />
              )}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            maxWidth: 500,
            mx: 'auto',
          },
        }}
        TransitionProps={{
          onEntering: (node) => {
            node.style.transform = 'scale(0.9)'
          },
          onEntered: (node) => {
            node.style.transform = 'scale(1)'
            node.style.transition = 'transform 0.3s'
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon sx={{ color: 'warning.main', fontSize: 40 }} />
          <Typography variant="h6" sx={{ color: 'warning.main' }}>
            Atención
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              `No has agregado ningún ${missingItem}. ¿Estás seguro de que quieres avanzar sin agregar ninguno?`,
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenConfirmDialog(false)}
            variant="outlined"
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setOpenConfirmDialog(false)
              setActiveStep((prevActiveStep) => {
                const nextStep = prevActiveStep + 1
                setMaxStepReached((prevMaxStep) =>
                  Math.max(prevMaxStep, nextStep),
                )
                return nextStep
              })
            }}
            variant="contained"
            color="primary"
          >
            Sí, avanzar
          </Button>
        </DialogActions>
      </Dialog>

      <div style={{ marginTop: '10px' }}>{getStepContent(activeStep)}</div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="warning"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 3 }}
      >
        <Grid item>
          <Button
            variant="outlined"
            color="inherit"
            size="medium"
            onClick={activeStep !== 0 ? handleBack : backToActivites}
          >
            {activeStep !== 0 ? 'Volver' : 'Cancelar'}
          </Button>
        </Grid>

        <Grid item>
          {activeStep < steps.length - 1 && (
            <Button
              variant="contained"
              color="primary"
              size="medium"
              onClick={handleNext}
            >
              Siguiente
            </Button>
          )}
        </Grid>

        <Grid item>
          <Button
            variant="contained"
            color="success"
            size="medium"
            onClick={handleSave}
          >
            Guardar
          </Button>
        </Grid>

        {isEditing && (
          <Grid item>
            <Button
              variant="contained"
              color="error"
              size="medium"
              onClick={handleBack}
            >
              Eliminar
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  )
}

export default PlanActivity
