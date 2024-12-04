import React, { useState, useEffect } from 'react'
import {
  TextField,
  FormControl,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
} from '@mui/material'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { styled } from '@mui/material/styles'
import { es } from 'date-fns/locale'
import { NumberFieldWithUnits } from '../../components/NumberField'
import { AutocompleteCultivo } from '../../components/AutocompleteCultivo'
import { AutocompleteContratista } from '../../components/AutocompleteContratista'
import { AutocompleteDeposito } from '../../components/AutocompleteDeposito'
import { useBusiness } from '../../../../hooks'
import { gridColumnsTotalWidthSelector } from '@mui/x-data-grid'

const CustomPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: `${theme.spacing(2)} 0`,
  backgroundColor: theme.palette.background.paper,
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
}))

function PersonalFormUnified({
  lot,
  formData,
  setFormData,
  showActivityType = false,
  mode = 'plan',
}) {
  const [fertilizacionChecked, setFertilizacionChecked] = useState(
    formData.detalles.fertilizacion || false,
  )
  const [fitosanitariaChecked, setFitosanitariaChecked] = useState(
    formData.detalles.fitosanitaria || false,
  )
  const [siembras, setSiembras] = useState([])
  const [selectedSiembra, setSelectedSiembra] = useState(null)
  const { businesses, getBusinesses } = useBusiness()

  useEffect(() => {
    getBusinesses()
    fetchSiembras()
  }, [])

  const fetchSiembras = async () => {
    try {
      // Aquí deberás implementar la lógica para obtener las siembras
      // según los parámetros necesarios (accountId, licenseId, campoId, loteId, campaña)
      const response = await fetch('/api/siembras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: lot.accountId,
          licenseId: lot.licenseId,
          campoId: lot.campoId,
          loteId: lot._id,
          campana: formData.detalles.campana,
        }),
      })
      const data = await response.json()
      setSiembras(data)
    } catch (error) {
      console.error('Error fetching siembras:', error)
    }
  }

  const onFieldChange = (fieldName, value) => {
    setFormData((prevData) => ({
      ...prevData,
      detalles: {
        ...prevData.detalles,
        [fieldName]: value,
      },
    }))
  }

  const handleSiembraChange = (event) => {
    const siembraId = event.target.value
    const selectedSiembra = siembras.find((s) => s._id === siembraId)
    setSelectedSiembra(selectedSiembra)

    setFormData((prevData) => ({
      ...prevData,
      detalles: {
        ...prevData.detalles,
        siembra_inicial: siembraId,
        cultivo: selectedSiembra?.cultivo || null,
      },
    }))
  }

  const handleCheckboxChange = (field) => (event) => {
    const isChecked = event.target.checked
    if (field === 'fertilizacion') {
      setFertilizacionChecked(isChecked)
    } else {
      setFitosanitariaChecked(isChecked)
    }
    onFieldChange(field, isChecked)
  }

  const shouldShowSiembraSelection =
    mode === 'plan' &&
    (formData.tipo === 'aplicacion' || formData.tipo === 'cosecha')

  return (
    <CustomPaper elevation={3}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SectionTitle>Información General</SectionTitle>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="business-label">Ing. Agronomo</InputLabel>
            <Select
              labelId="business-label"
              id="business"
              value={formData.detalles.business || ''}
              label="Ing. Agronomo"
              onChange={(e) => onFieldChange('business', e.target.value)}
            >
              {businesses.map((business) => (
                <MenuItem key={business._id} value={business._id}>
                  {business.razonSocial}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {shouldShowSiembraSelection ? (
          <>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="siembra-inicial-label">
                  Siembra Inicial
                </InputLabel>
                <Select
                  labelId="siembra-inicial-label"
                  id="siembra-inicial"
                  value={formData.detalles.siembra_inicial || ''}
                  label="Siembra Inicial"
                  onChange={handleSiembraChange}
                >
                  {siembras.map((siembra) => (
                    <MenuItem key={siembra._id} value={siembra._id}>
                      {siembra.descripcion || `Siembra ${siembra._id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cultivo"
                value={selectedSiembra?.cultivo?.nombre || ''}
                disabled
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={12} sm={6}>
            <AutocompleteCultivo
              value={formData.detalles.cultivo || ''}
              onChange={(value) => onFieldChange('cultivo', value)}
            />
          </Grid>
        )}

        {showActivityType && (
          <>
            <Grid item xs={12}>
              <SectionTitle>Detalles de la Actividad</SectionTitle>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Tipo de Actividad:
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={fertilizacionChecked}
                        onChange={handleCheckboxChange('fertilizacion')}
                        color="primary"
                      />
                    }
                    label="Fertilización"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={fitosanitariaChecked}
                        onChange={handleCheckboxChange('fitosanitaria')}
                        color="primary"
                      />
                    }
                    label="Fitosanitaria"
                  />
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        <Grid item xs={12} sm={6}>
          <AutocompleteContratista
            value={formData.detalles.contratista || ''}
            onChange={(value) => onFieldChange('contratista', value)}
          />
        </Grid>

        <Grid item xs={12}>
          <SectionTitle>
            {mode === 'execute'
              ? 'Ejecución y Depósito'
              : 'Programación y Área'}
          </SectionTitle>
        </Grid>

        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha de Ejecución"
              value={
                mode === 'execute'
                  ? formData.detalles.fecha_ejecucion || new Date()
                  : formData.detalles.fecha_ejecucion_tentativa
                  ? new Date(formData.detalles.fecha_ejecucion_tentativa)
                  : null
              }
              onChange={(newValue) =>
                onFieldChange(
                  mode === 'execute'
                    ? 'fecha_ejecucion'
                    : 'fecha_ejecucion_tentativa',
                  newValue,
                )
              }
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>

        {mode === 'execute' ? (
          <>
            <Grid item xs={12} sm={6}>
              <AutocompleteDeposito
                value={formData.detalles.deposito}
                onChange={(value) => onFieldChange('deposito', value)}
              />
            </Grid>

            <Grid item xs={12}>
              <SectionTitle>Horarios y Área</SectionTitle>
            </Grid>

            <Grid item xs={12} sm={4}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={es}
              >
                <TimePicker
                  label="Hora de Inicio"
                  value={formData.detalles.fecha_hora_inicio || new Date()}
                  onChange={(newValue) =>
                    onFieldChange('fecha_hora_inicio', newValue)
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={4}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={es}
              >
                <TimePicker
                  label="Hora de Finalización"
                  value={formData.detalles.fecha_hora_fin || new Date()}
                  onChange={(newValue) =>
                    onFieldChange('fecha_hora_fin', newValue)
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={4}>
              <NumberFieldWithUnits
                label="Hectáreas"
                unit="ha"
                value={formData.detalles.hectareas || 0}
                onChange={(e) => onFieldChange('hectareas', e.target.value)}
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={12} sm={6}>
            <NumberFieldWithUnits
              label="Hectáreas a tratar"
              unit="ha"
              value={formData.detalles.hectareas || 0}
              onChange={(e) => onFieldChange('hectareas', e.target.value)}
            />
          </Grid>
        )}

        {formData.tipo === 'cosecha' && mode === 'execute' && (
          <Grid item xs={12}>
            <NumberFieldWithUnits
              size="small"
              fullWidth
              label="Rinde Obtenido (ton/ha)"
              value={+formData.detalles.rinde_obtenido || 0}
              onChange={(e) => onFieldChange('rinde_obtenido', e.target.value)}
              unit="ton/ha"
            />
          </Grid>
        )}
      </Grid>
    </CustomPaper>
  )
}

export default PersonalFormUnified
