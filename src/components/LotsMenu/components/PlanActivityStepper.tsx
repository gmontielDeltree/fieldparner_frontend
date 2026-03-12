import React from 'react'
import { Stepper, Step, StepLabel, Badge } from '@mui/material'

interface PlanActivityStepperProps {
  steps: string[]
  activeStep: number
  handleStep: (step: number) => () => void
  countMissingFields: (formData: any, step: number) => number
  maxStepReached: number
  formData: any
}

const PlanActivityStepper: React.FC<PlanActivityStepperProps> = ({
  steps,
  activeStep,
  handleStep,
  countMissingFields,
  maxStepReached,
  formData,
}) => {
  return (
    <Stepper activeStep={activeStep}>
      {steps.map((label, index) => (
        <Step key={label} onClick={handleStep(index)}>
          <StepLabel>
            {label}
            {index <= maxStepReached && (
              <Badge
                badgeContent={countMissingFields(formData, index)}
                color="error"
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              />
            )}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  )
}

export default PlanActivityStepper
