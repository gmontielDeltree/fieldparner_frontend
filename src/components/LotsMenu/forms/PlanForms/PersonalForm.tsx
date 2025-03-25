import React, { useState, useEffect, useRef } from 'react'
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
  activities = [], // Actividades disponibles
}) {
  console.log("🔍 PersonalFormUnified - Renderizando con activities:", activities?.length);

  const [fertilizacionChecked, setFertilizacionChecked] = useState(
    formData.detalles.fertilizacion || false,
  )
  const [fitosanitariaChecked, setFitosanitariaChecked] = useState(
    formData.detalles.fitosanitaria || false,
  )
  const [siembras, setSiembras] = useState([])
  const [selectedSiembra, setSelectedSiembra] = useState(null)
  const { businesses, getBusinesses } = useBusiness()

  // Flag para registrar si ya procesamos alguna vez
  const procesadoAlgunaVez = useRef(false);

  // Mostrar el tipo de actividad y el modo actual
  console.log("🔍 PersonalFormUnified - Tipo:", formData.tipo, "Modo:", mode);
  console.log("🔍 PersonalFormUnified - shouldShowSiembraSelection:",
    mode === 'plan' && (formData.tipo === 'aplicacion' || formData.tipo === 'cosecha'));

  useEffect(() => {
    getBusinesses()
  }, [])

  // Primer efecto: log de datos iniciales al montar
  useEffect(() => {
    console.log("🔍 PersonalFormUnified - Montado inicial");
    console.log("🔍 Activities al inicio:", activities);
    console.log("🔍 formData.tipo:", formData.tipo);
    console.log("🔍 shouldShowSiembraSelection:",
      mode === 'plan' && (formData.tipo === 'aplicacion' || formData.tipo === 'cosecha'));

    // Forzar el procesamiento inicial si hay actividades
    if (activities && activities.length > 0) {
      console.log("🔍 Procesando actividades iniciales:", activities.length);
      procesarActividadesDeSiembra();
      procesadoAlgunaVez.current = true;
    }
  }, []);

  // Segundo efecto: procesar cuando cambian las actividades
  useEffect(() => {
    console.log("🔍 Activities actualizadas:", activities?.length);

    // Siempre intentar procesar si hay actividades disponibles
    if (activities && activities.length > 0) {
      console.log("🔍 Ejecutando procesarActividadesDeSiembra con", activities.length, "actividades");
      procesarActividadesDeSiembra();
      procesadoAlgunaVez.current = true;
    } else {
      console.log("🔍 No hay actividades para procesar");
    }
  }, [activities]);

  // Tercer efecto: mostrar mensaje si nunca se procesaron actividades
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!procesadoAlgunaVez.current) {
        console.log("⚠️ ALERTA: Nunca se procesaron actividades. Verifique que se estén pasando correctamente.");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const procesarActividadesDeSiembra = () => {
    console.log('⚡ Procesando actividades de siembra, total actividades:', activities?.length);

    // Verificar si hay actividades antes de procesar
    if (!activities || activities.length === 0) {
      console.log('⚡ No hay actividades disponibles para procesar');
      setSiembras([]);
      return;
    }

    // Imprimir los primeros elementos para depuración
    const muestra = activities.slice(0, 3);
    console.log('⚡ Muestra de actividades:', muestra.map(a => ({
      tipo: a.actividad?.tipo || a.tipo,
      id: a.actividad?._id || a.actividad?.uuid || a._id || a.uuid
    })));

    // Filtrar solo las actividades de tipo siembra
    const actividadesSiembra = activities
      .filter(activity => {
        // Verificar si la actividad o su propiedad anidada existen
        if (!activity) return false;

        // Obtener el tipo, ya sea de la actividad directa o anidada
        const tipo = activity.actividad?.tipo || activity.tipo;

        // Depuración para cada actividad
        console.log('⚡ Evaluando:', tipo);

        // Verificar si el tipo es siembra (insensible a mayúsculas/minúsculas)
        return tipo && tipo.toLowerCase() === 'siembra';
      })
      .map(activity => {
        // Normalizar para manejar tanto el formato anidado como el directo
        const actividadNormalizada = activity.actividad || activity;

        console.log('⚡ Siembra encontrada:',
          actividadNormalizada._id || actividadNormalizada.uuid,
          'con cultivo:', actividadNormalizada.detalles?.cultivo?.descriptionES || 'sin cultivo');

        // Asegurarse de que detalles exista
        const detalles = actividadNormalizada.detalles || {};

        // Formato de fecha si existe
        let fechaEjecucion = 'Sin fecha';
        if (detalles.fecha_ejecucion_tentativa) {
          try {
            const fecha = new Date(detalles.fecha_ejecucion_tentativa);
            fechaEjecucion = isNaN(fecha.getTime()) ? 'Sin fecha' : format(fecha, 'dd/MM/yyyy');
          } catch (error) {
            console.error('Error al formatear fecha:', error);
          }
        }

        // Obtener información del cultivo de forma segura
        const cultivoNombre =
          detalles.cultivo?.descriptionES ||
          detalles.cultivo?.descriptionEN ||
          detalles.cultivo?.name ||
          'Sin cultivo';

        // Asegurar que el ID sea único y esté presente
        const id = actividadNormalizada._id || actividadNormalizada.uuid;

        if (!id) {
          console.warn('⚠️ Actividad sin ID encontrada:', actividadNormalizada);
        }

        // Crear descripción amigable para el dropdown
        return {
          ...actividadNormalizada,
          _id: id,
          descripcionRica: `${cultivoNombre} - ${fechaEjecucion} - ${detalles.hectareas || 0}ha`
        };
      });

    console.log('⚡ Actividades de siembra filtradas:', actividadesSiembra.length);

    if (actividadesSiembra.length > 0) {
      console.log('⚡ Primera siembra:', actividadesSiembra[0]);
      console.log('⚡ IDs de siembras:', actividadesSiembra.map(s => s._id));
    }

    // Actualizar las siembras disponibles
    setSiembras(actividadesSiembra);

    // Si hay una siembra inicial seleccionada, establecerla
    if (formData.detalles.siembra_inicial) {
      console.log('⚡ Buscando siembra inicial:', formData.detalles.siembra_inicial);
      const siembraInicial = actividadesSiembra.find(s => {
        const sId = s._id;
        return sId === formData.detalles.siembra_inicial;
      });

      if (siembraInicial) {
        console.log('⚡ Siembra inicial encontrada:', siembraInicial._id);
        setSelectedSiembra(siembraInicial);
      } else {
        console.log('⚡ No se encontró la siembra inicial');
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

  const handleSiembraChange = (event) => {
    const siembraId = event.target.value;
    console.log('Siembra seleccionada ID:', siembraId);

    const selectedSiembra = siembras.find((s) => s._id === siembraId);

    if (selectedSiembra) {
      console.log('Siembra encontrada:', selectedSiembra);
      setSelectedSiembra(selectedSiembra);

      // Actualizar el formulario con la información de la siembra seleccionada
      setFormData((prevData) => ({
        ...prevData,
        detalles: {
          ...prevData.detalles,
          siembra_inicial: siembraId,
          cultivo: selectedSiembra.detalles?.cultivo || null,
        },
      }));
    } else {
      console.error('No se encontró la siembra con ID:', siembraId);
    }
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

  const getSiembraLabel = (siembra) => {
    if (!siembra) return '';

    // Usar la descripción enriquecida si existe
    if (siembra.descripcionRica) {
      return siembra.descripcionRica;
    }

    // Fallback: usar comentario o id como referencia
    return siembra.comentario ||
      siembra.detalles?.comentario ||
      `Siembra ${(siembra._id || '').slice(0, 8)}`;
  }

  // Función auxiliar para obtener el nombre del cultivo seleccionado
  const getCultivoNombre = () => {
    if (selectedSiembra?.detalles?.cultivo) {
      return selectedSiembra.detalles.cultivo.descriptionES ||
        selectedSiembra.detalles.cultivo.descriptionEN ||
        selectedSiembra.detalles.cultivo.name ||
        'Sin nombre';
    }
    return '';
  }

  // Al final del componente, mostrar logs de estado importante
  console.log("🔍 Estado actual - siembras:", siembras.length);
  console.log("🔍 Estado actual - shouldShowSiembraSelection:", shouldShowSiembraSelection);

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
                  {business.razonSocial || business.nombreCompleto || `Entidad ${business._id.slice(0, 8)}`}
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
                  renderValue={(selected) => {
                    const siembra = siembras.find(s => s._id === selected);
                    return getSiembraLabel(siembra);
                  }}
                >
                  {siembras.length > 0 ? (
                    siembras.map((siembra) => (
                      <MenuItem key={siembra._id} value={siembra._id}>
                        <ListItemText
                          primary={getSiembraLabel(siembra)}
                          secondary={`ID: ${(siembra._id || '').slice(-12)}`}
                        />
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      <em>No hay siembras disponibles</em>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cultivo"
                value={getCultivoNombre()}
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