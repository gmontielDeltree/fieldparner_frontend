import React from 'react'
import { Grid, Button } from '@mui/material'

interface ActionButtonsProps {
  activeStep: number
  stepsLength: number
  handleBack: () => void
  handleNext: () => void
  handleSave: () => void
  isEditing: boolean
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  activeStep,
  stepsLength,
  handleBack,
  handleNext,
  handleSave,
  isEditing,
}) => {
  return (
    <Grid container spacing={2} justifyContent="space-between">
      <Grid item>
        <Button variant="outlined" onClick={handleBack}>
          {activeStep !== 0 ? 'Volver' : 'Cancelar'}
        </Button>
      </Grid>
      <Grid item>
        {activeStep < stepsLength - 1 && (
          <Button variant="contained" onClick={handleNext}>
            Siguiente
          </Button>
        )}
      </Grid>
      <Grid item>
        <Button variant="contained" color="success" onClick={handleSave}>
          Guardar
        </Button>
      </Grid>
      {isEditing && (
        <Grid item>
          <Button variant="contained" color="error" onClick={handleBack}>
            Eliminar
          </Button>
        </Grid>
      )}
    </Grid>
  )
}

export default ActionButtons
