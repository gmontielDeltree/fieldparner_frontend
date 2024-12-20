import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, IconButton, Step, StepLabel, Stepper } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PersonalForm from './Forms/PersonalForm'
import SuppliesForm from './Forms/SuppliesForm'
import OtherDetailsForm from './Forms/OtherDetailsForm'
import ServicesForm from './Forms/ServicesForm'
import ConditionsForm from './Forms/ConditionsForm'
import ObservationsForm from './Forms/ObservationsForm'

interface LotDetailsModalProps {
  lot: any
  isOpen: boolean
  toggle: () => void
}

const LotDetailsModal: React.FC<LotDetailsModalProps> = ({
  lot,
  isOpen,
  toggle,
}) => {
  if (!lot) return null

  const [activeStep, setActiveStep] = useState(0)
  const steps = [
    'General',
    'Insumos',
    'Otros Datos',
    'Servicios',
    'Condiciones',
    'Observaciones',
  ]

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <PersonalForm lot={lot} />
      case 1:
        return <SuppliesForm lot={lot} />
      case 2:
        return <OtherDetailsForm lot={lot} />
      case 3:
        return <ServicesForm lot={lot} />
      case 4:
        return <ConditionsForm lot={lot} />
      case 5:
        return <ObservationsForm lot={lot} />
      default:
        return <div>Unknown Step</div>
    }
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prevActiveStep) => prevActiveStep - 1)
    } else {
      toggle()
    }
  }

  const variants = {
    open: { left: '0' },
    closed: { left: '-50vw' },
  }

  return (
    <motion.div
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      variants={variants}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        top: '64px',
        height: 'calc(100vh - 64px)',
        width: '50vw',
        overflowY: 'auto',
        backgroundColor: '#fff',
        padding: '1rem',
        zIndex: 1050,
      }}
    >
      <IconButton
        aria-label="close"
        onClick={toggle}
        style={{ position: 'absolute', top: 8, right: 8 }}
      >
        <CloseIcon />
      </IconButton>

      <Stepper
        activeStep={activeStep}
        sx={{ pt: 3, pb: 5, backgroundColor: '#f5f5f5', borderRadius: '4px' }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              sx={{
                color: 'primary.main',
                '& .MuiStepLabel-label': {
                  fontSize: '1rem',
                  fontWeight: 'bold',
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <div style={{ marginTop: '10px' }}>{getStepContent(activeStep)}</div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '1rem',
        }}
      >
        <Button color="secondary" onClick={handleBack}>
          {activeStep === 0 ? 'Cancelar' : 'Volver'}
        </Button>
        {activeStep < steps.length - 1 && (
          <Button color="primary" onClick={handleNext}>
            Siguiente
          </Button>
        )}
        {activeStep === steps.length - 1 && (
          <Button color="success" onClick={() => {}}>
            Guardar
          </Button>
        )}
      </div>
    </motion.div>
  )
}

export default LotDetailsModal
