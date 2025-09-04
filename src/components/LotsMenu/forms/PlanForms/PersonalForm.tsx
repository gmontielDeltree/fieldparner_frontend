import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
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
  ListItemText,
} from '@mui/material'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { styled } from '@mui/material/styles'
import { es } from 'date-fns/locale'
import { format } from 'date-fns'
import { NumberFieldWithUnits } from '../../components/NumberField'
import { AutocompleteCultivo } from '../../components/AutocompleteCultivo'
import { AutocompleteContratista } from '../../components/AutocompleteContratista'
import { AutocompleteDeposito } from '../../components/AutocompleteDeposito'
import { useBusiness } from '../../../../hooks'

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
  activities = [],
  selectedCampaign = null,
}) {
  const { t } = useTranslation();

  // Se utiliza el operador opcional para evitar error si formData.detalles es undefined
  const [fertilizationChecked, setFertilizationChecked] = useState(
    formData.detalles?.fertilizacion || false,
  )
  const [phytosanitaryChecked, setPhytosanitaryChecked] = useState(
    formData.detalles?.fitosanitaria || false,
  )
  const [plantings, setPlantings] = useState([])
  const [selectedPlanting, setSelectedPlanting] = useState(null)
  const { businesses, getBusinesses } = useBusiness()

  const processedAtLeastOnce = useRef(false);

  useEffect(() => {
    getBusinesses()
  }, [])

  useEffect(() => {
    if (activities && activities.length > 0) {
      processPlantingActivities();
      processedAtLeastOnce.current = true;
    }
  }, []);

  useEffect(() => {
    if (activities && activities.length > 0) {
      processPlantingActivities();
      processedAtLeastOnce.current = true;
    }
  }, [activities]);

  useEffect(() => {
    const timer = setTimeout(() => {
      processedAtLeastOnce.current = true;
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const processPlantingActivities = () => {
    if (!activities || activities.length === 0) {
      setPlantings([]);
      return;
    }

    const plantingActivities = activities
      .filter(activity => {
        if (!activity) return false;
        const type = activity.actividad?.tipo || activity.tipo;
        return type && type.toLowerCase() === 'siembra';
      })
      .map(activity => {
        const normalizedActivity = activity.actividad || activity;
        const details = normalizedActivity.detalles || {};

        let executionDate = t('No date');
        if (details.fecha_ejecucion_tentativa) {
          try {
            const date = new Date(details.fecha_ejecucion_tentativa);
            executionDate = isNaN(date.getTime()) ? 'No date' : format(date, 'dd/MM/yyyy');
          } catch (error) { }
        }

        const cropName =
          details.cultivo?.descriptionES ||
          details.cultivo?.descriptionEN ||
          details.cultivo?.name ||
          t('No crop');

        const id = normalizedActivity._id || normalizedActivity.uuid;

        return {
          ...normalizedActivity,
          _id: id,
          richDescription: `${cropName} - ${executionDate} - ${details.hectareas || 0}ha`
        };
      });

    setPlantings(plantingActivities);

    if (formData.detalles?.siembra_inicial) {
      const initialPlanting = plantingActivities.find(s => {
        const sId = s._id;
        return sId === formData.detalles.siembra_inicial;
      });

      if (initialPlanting) {
        setSelectedPlanting(initialPlanting);
      }
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

  const handlePlantingChange = (event) => {
    const plantingId = event.target.value;

    const selectedPlanting = plantings.find((s) => s._id === plantingId);

    if (selectedPlanting) {
      setSelectedPlanting(selectedPlanting);

      setFormData((prevData) => ({
        ...prevData,
        detalles: {
          ...prevData.detalles,
          siembra_inicial: plantingId,
          cultivo: selectedPlanting.detalles?.cultivo || null,
        },
      }));
    }
  }

  const handleCheckboxChange = (field) => (event) => {
    const isChecked = event.target.checked
    if (field === 'fertilizacion') {
      setFertilizationChecked(isChecked)
    } else {
      setPhytosanitaryChecked(isChecked)
    }
    onFieldChange(field, isChecked)
  }

  const shouldShowPlantingSelection =
    mode === 'plan' &&
    (formData.tipo === 'aplicacion' || formData.tipo === 'cosecha')

  const getPlantingLabel = (planting) => {
    if (!planting) return '';

    if (planting.richDescription) {
      return planting.richDescription;
    }

    return planting.comentario ||
      planting.detalles?.comentario ||
      t('Planting {{id}}', { id: (planting._id || '').slice(0, 8) });
  }

  const getCropName = () => {
    if (selectedPlanting?.detalles?.cultivo) {
      return selectedPlanting.detalles.cultivo.descriptionES ||
        selectedPlanting.detalles.cultivo.descriptionEN ||
        selectedPlanting.detalles.cultivo.name ||
        t('No name');
    }
    return '';
  }

  return (
    <CustomPaper elevation={3}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SectionTitle>{t('General Information')}</SectionTitle>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="business-label">{t('Agronomic Engineer')}</InputLabel>
            <Select
              labelId="business-label"
              id="business"
              value={formData.detalles?.business || ''}
              label={t('Agronomic Engineer')}
              onChange={(e) => onFieldChange('business', e.target.value)}
            >
              {businesses.map((business) => (
                <MenuItem key={business._id} value={business._id}>
                  {business.razonSocial || business.nombreCompleto || t('Entity {{id}}', { id: business._id.slice(0, 8) })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {shouldShowPlantingSelection ? (
          <>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="siembra-inicial-label">
                  {t('Initial Planting')}
                </InputLabel>
                <Select
                  labelId="siembra-inicial-label"
                  id="siembra-inicial"
                  value={formData.detalles?.siembra_inicial || ''}
                  label={t('Initial Planting')}
                  onChange={handlePlantingChange}
                  renderValue={(selected) => {
                    const planting = plantings.find(s => s._id === selected);
                    return getPlantingLabel(planting);
                  }}
                >
                  {plantings.length > 0 ? (
                    plantings.map((planting) => (
                      <MenuItem key={planting._id} value={planting._id}>
                        <ListItemText
                          primary={getPlantingLabel(planting)}
                          secondary={`ID: ${(planting._id || '').slice(-12)}`}
                        />
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      <em>{t('No plantings available')}</em>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('Crop')}
                value={getCropName()}
                disabled
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={12} sm={6}>
            {mode === 'execute' && (
              formData.tipo === 'aplicacion' || formData.tipo === 'application' ||
              formData.tipo === 'cosecha' || formData.tipo === 'harvesting'
            ) ? (
              <TextField
                fullWidth
                label={t('Crop')}
                value={formData.detalles?.cultivo?.descriptionES || 
                       formData.detalles?.cultivo?.descriptionEN || 
                       formData.detalles?.cultivo?.name || 
                       t('No crop selected')}
                disabled
                InputProps={{
                  readOnly: true,
                }}
              />
            ) : (
              <AutocompleteCultivo
                value={formData.detalles?.cultivo || ''}
                onChange={(value) => onFieldChange('cultivo', value)}
              />
            )}
          </Grid>
        )}

        {showActivityType && (
          <>
            <Grid item xs={12}>
              <SectionTitle>{t('Activity Details')}</SectionTitle>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('Activity Type')}:
                  </Typography>
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
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Campo Zafra para labores de preparación y siembra */}
        {(formData.tipo === 'siembra' || formData.tipo === 'sowing' ||
          formData.tipo === 'preparado' || formData.tipo === 'preparation') && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="zafra-label">{t('Zafra')}</InputLabel>
                <Select
                  labelId="zafra-label"
                  id="zafra"
                  value={formData.detalles?.zafra || ''}
                  label={t('Zafra')}
                  onChange={(e) => onFieldChange('zafra', e.target.value)}
                >
                  {selectedCampaign?.zafra && Array.isArray(selectedCampaign.zafra) ? (
                    selectedCampaign.zafra.map((zafra) => (
                      <MenuItem key={zafra} value={zafra}>
                        {zafra}
                      </MenuItem>
                    ))
                  ) : selectedCampaign?.zafra && typeof selectedCampaign.zafra === 'string' ? (
                    <MenuItem value={selectedCampaign.zafra}>
                      {selectedCampaign.zafra}
                    </MenuItem>
                  ) : (
                    <MenuItem disabled value="">
                      <em>{t('No hay zafras disponibles en la campaña')}</em>
                    </MenuItem>
                  )}
                </Select>
                <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                  {t('Seleccione la zafra de la campaña actual')}
                </Typography>
              </FormControl>
            </Grid>
          )}

        <Grid item xs={12} sm={6}>
          <AutocompleteContratista
            value={formData.detalles?.contratista || ''}
            onChange={(value) => onFieldChange('contratista', value)}
          />
        </Grid>

        <Grid item xs={12}>
          <SectionTitle>
            {mode === 'execute'
              ? t('Execution and Deposit')
              : t('Scheduling and Area')}
          </SectionTitle>
        </Grid>

        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label={t('Execution Date')}
              value={
                mode === 'execute'
                  ? formData.detalles?.fecha_ejecucion || new Date()
                  : formData.detalles?.fecha_ejecucion_tentativa
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
            {/* Campo Depósito solo aparece en la ejecución de Cosecha - T2-74 */}
            {(formData.tipo === 'cosecha' || formData.tipo === 'harvesting') && (
              <Grid item xs={12} sm={6}>
                <AutocompleteDeposito
                  value={formData.detalles?.deposito}
                  onChange={(value) => onFieldChange('deposito', value)}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <SectionTitle>{t('Schedule and Area')}</SectionTitle>
            </Grid>

            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <TimePicker
                  label={t('Start Time')}
                  value={formData.detalles?.fecha_hora_inicio || new Date()}
                  onChange={(newValue) =>
                    onFieldChange('fecha_hora_inicio', newValue)
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <TimePicker
                  label={t('End Time')}
                  value={formData.detalles?.fecha_hora_fin || new Date()}
                  onChange={(newValue) =>
                    onFieldChange('fecha_hora_fin', newValue)
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={4}>
              <NumberFieldWithUnits
                label={t('Hectares')}
                unit="ha"
                value={formData.detalles?.hectareas || 0}
                onChange={(e) => onFieldChange('hectareas', e.target.value)}
                allowNegative={false}
                allowDecimals={true}
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={12} sm={6}>
            <NumberFieldWithUnits
              label={t('Hectares to treat')}
              unit="ha"
              value={formData.detalles?.hectareas || 0}
              onChange={(e) => onFieldChange('hectareas', e.target.value)}
              allowNegative={false}
              allowDecimals={true}
            />
          </Grid>
        )}

        {formData.tipo === 'cosecha' && mode === 'execute' && (
          <Grid item xs={12}>
            <NumberFieldWithUnits
              size="small"
              fullWidth
              label={t('Yield Obtained (ton/ha)')}
              value={formData.detalles?.rinde_obtenido || ''}
              onChange={(e) => onFieldChange('rinde_obtenido', e.target.value)}
              unit="ton/ha"
              allowNegative={false}
              allowDecimals={true}
            />
          </Grid>
        )}
      </Grid>
    </CustomPaper>
  )
}

export default PersonalFormUnified
