import React, { useEffect, useState } from 'react'
import {
  FormControl,
  Grid,
  TextField,
  IconButton,
  Typography,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { styled } from '@mui/material/styles'
import uuid4 from 'uuid4'
import { useSupply, useCrops, useDeposit } from '../../../../hooks'
import { NumberFieldWithUnits } from '../../components/NumberField'
import { AutocompleteSupplies } from '../../components/AutocompleteSupplies'
import { AutocompleteDeposito } from '../../components/AutocompleteDeposito'
import Swal from 'sweetalert2'
import SuppliesList from './SuppliesList'
import { useTranslation } from 'react-i18next'

const Title = styled(Typography)({
  fontSize: '1.5em',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '20px',
})

const CustomPaper = styled(Paper)({
  padding: '20px',
  margin: '20px 0',
  backgroundColor: '#f7f7f7',
})

interface SuppliesFormProps {
  lot: any
  db: any
  formData: any
  setFormData: (data: any) => void
  mode?: 'plan' | 'execute'
}

function SuppliesForm({ lot, db, formData, setFormData, mode = 'execute' }: SuppliesFormProps) {
  const { t } = useTranslation()
  const [selectedSupply, setSelectedSupply] = useState<any>()
  const [dosificacion, setDosificacion] = useState('')
  const [total, setTotal] = useState('')
  const [nroLote, setNroLote] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [rows, setRows] = useState([])
  const [deposito, setDeposito] = useState<any>()
  const [formKey, setFormKey] = useState(0) // Add key for forcing re-render

  const { isLoading, supplies, getSupplies } = useSupply()
  const { getCrops, crops } = useCrops()
  const { deposits, getDeposits } = useDeposit()

  // Función para normalizar IDs y compararlos de forma flexible
  // Los IDs pueden tener formatos como: crop:xxx, crop:userDefined:xxx, cultivo:xxx, o solo el UUID
  const normalizeId = (id?: string) => {
    if (!id) return ''
    // Extraer la última parte del ID (después del último :) y convertir a minúsculas
    const parts = String(id).split(':')
    return parts[parts.length - 1].trim().toLowerCase()
  }

  // Función para verificar si un insumo es compatible con el cultivo de la actividad
  const isSupplyCompatibleWithCrop = (supply: any, cultivo: any) => {
    if (!supply?.cropId || !cultivo) return true // Si no hay cropId, es genérico/compatible
    
    const cultivoId = cultivo?._id || cultivo?.id
    if (!cultivoId) return true // No hay cultivo definido, permitir
    
    // Comparación 1: IDs normalizados
    const normalizedSupplyCropId = normalizeId(supply.cropId)
    const normalizedCultivoId = normalizeId(cultivoId)
    
    if (normalizedSupplyCropId === normalizedCultivoId) {
      return true
    }
    
    // Comparación 2: Buscar el cultivo del supply en la lista de crops y comparar por nombre
    const supplyCrop = crops.find((c: any) => 
      normalizeId(c._id) === normalizedSupplyCropId || 
      c._id === supply.cropId
    )
    
    if (supplyCrop) {
      // Comparar por nombres del cultivo
      const supplyCropName = (supplyCrop.descriptionES || supplyCrop.descriptionEN || supplyCrop.name || '').toLowerCase().trim()
      const activityCropName = (cultivo.descriptionES || cultivo.descriptionEN || cultivo.name || '').toLowerCase().trim()
      
      if (supplyCropName && activityCropName && supplyCropName === activityCropName) {
        return true
      }
    }
    
    // Comparación 3: Comparar directamente los nombres si están disponibles en cultivo
    const cultivoName = (cultivo.descriptionES || cultivo.descriptionEN || cultivo.name || '').toLowerCase().trim()
    if (supplyCrop && cultivoName) {
      const supplyCropNames = [
        supplyCrop.descriptionES?.toLowerCase().trim(),
        supplyCrop.descriptionEN?.toLowerCase().trim(),
        supplyCrop.name?.toLowerCase().trim()
      ].filter(Boolean)
      
      if (supplyCropNames.includes(cultivoName)) {
        return true
      }
    }
    
    console.log('🔍 Comparación de compatibilidad fallida:', {
      supplyCropId: supply.cropId,
      cultivoId,
      normalizedSupplyCropId,
      normalizedCultivoId,
      supplyCrop: supplyCrop ? { descriptionES: supplyCrop.descriptionES } : null,
      cultivoName
    })
    
    return false
  }

  const handleAddRow = () => {
    const supply = selectedSupply
    // T2-75: En cosecha, no es obligatorio agregar insumos
    if (!supply && formData.tipo !== 'cosecha') {
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('selectSupplyPlease'),
      })
      return
    }
    
    // Si no hay supply en cosecha, permitir continuar sin validación
    if (!supply && formData.tipo === 'cosecha') {
      return
    }

    // Validación de compatibilidad ANTES de agregar la fila
    // Se valida cualquier insumo que tenga cropId asociado
    if (supply && supply.cropId) {
      const cultivo = formData?.detalles?.cultivo
      const cultivoId = cultivo?._id || cultivo?.id

      console.log('🔍 handleAddRow - Validación:', { cultivoId, supplyCropId: supply.cropId })

      // Si el insumo tiene cropId pero NO hay cultivo definido en el ciclo
      if (!cultivoId) {
        console.log('⚠️ handleAddRow - No hay cultivo en ciclo')
        setTimeout(() => {
          Swal.fire({
            icon: 'warning',
            title: t('incompatibleSupply'),
            text: t('supplyNotCompatibleWithCrop') + ' (No hay cultivo definido en el ciclo)',
            customClass: {
              container: 'swal-above-mui-dialog'
            }
          })
        }, 100)
        return
      }

      // Usar la función de compatibilidad mejorada
      if (!isSupplyCompatibleWithCrop(supply, cultivo)) {
        console.log('❌ handleAddRow - INCOMPATIBLE')
        setTimeout(() => {
          Swal.fire({
            icon: 'error',
            title: t('incompatibleSupply'),
            text: t('supplyNotCompatibleWithCrop'),
            customClass: {
              container: 'swal-above-mui-dialog'
            }
          })
        }, 100)
        return
      }
    }

    // Use insumo instead of selectedOption to maintain consistency
    const newRow = {
      insumo: selectedSupply, // Changed from selectedOption to insumo
      dosificacion,
      total,
      deposito, // Always include deposito for both plan and execute modes
      ...(mode !== 'plan' && {
        nro_lote: nroLote,
        ubicacion,
      }),
      uuid: uuid4(),
    }
    
    console.log('🔍 DEBUG AGREGANDO INSUMO:')
    console.log('  dosificacion (cantidad x ha):', dosificacion)
    console.log('  total (cantidad total):', total)
    console.log('  hectareas del lote:', formData.detalles.hectareas)
    console.log('  newRow completo:', newRow)

    const newDetalles = [...formData.detalles.dosis, newRow]

    setFormData({
      ...formData,
      detalles: { ...formData.detalles, dosis: newDetalles },
    })

    // Limpiar campos después de agregar
    console.log('Clearing form fields after adding supply')
    setSelectedSupply(undefined)
    setDosificacion('')
    setTotal('')
    setDeposito(undefined) // Always clear deposit in both plan and execute modes
    if (mode !== 'plan') {
      setNroLote('')
      setUbicacion('')
    }
    // Force re-render of autocomplete components
    setFormKey(prev => prev + 1)
  }

  const handleSelectChange = (event: any) => {
    const supply = event

    console.log('🔍 handleSelectChange llamado con:', supply?.name)

    // Validación temprana de compatibilidad apenas se selecciona el insumo
    // Se valida cualquier insumo que tenga cropId asociado
    if (supply && supply.cropId) {
      const cultivo = formData?.detalles?.cultivo
      const cultivoId = cultivo?._id || cultivo?.id

      console.log('🔍 Validación de compatibilidad de insumo:', {
        supplyName: supply.name,
        supplyType: supply.type,
        supplyCropId: supply.cropId,
        cultivo,
        cultivoId,
        compatible: isSupplyCompatibleWithCrop(supply, cultivo)
      })

      // Si el insumo tiene cropId pero NO hay cultivo definido en el ciclo, mostrar alerta
      if (!cultivoId) {
        console.log('⚠️ Insumo tiene cropId pero el ciclo no tiene cultivo definido - Mostrando Swal')
        setSelectedSupply(undefined)
        setTimeout(() => {
          Swal.fire({
            icon: 'warning',
            title: t('incompatibleSupply'),
            text: t('supplyNotCompatibleWithCrop') + ' (No hay cultivo definido en el ciclo)',
            backdrop: true,
            allowOutsideClick: true,
            customClass: {
              container: 'swal-above-mui-dialog'
            }
          })
        }, 100)
        return
      }

      // Usar la función de compatibilidad mejorada
      if (!isSupplyCompatibleWithCrop(supply, cultivo)) {
        console.log('❌ INSUMO INCOMPATIBLE - Mostrando Swal')
        setSelectedSupply(undefined)
        setTimeout(() => {
          Swal.fire({
            icon: 'error',
            title: t('incompatibleSupply'),
            text: t('supplyNotCompatibleWithCrop'),
            backdrop: true,
            allowOutsideClick: true,
            customClass: {
              container: 'swal-above-mui-dialog'
            }
          })
        }, 100)
        return
      }
    }

    setSelectedSupply(supply)
  }

  const handleDosificacionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    // Allow typing decimal separator without immediately calculating
    setDosificacion(value)
    
    // Only calculate if we have a valid number (not ending with decimal separator)
    const numValue = parseFloat(value)
    if (value !== '' && !isNaN(numValue) && formData.detalles.hectareas && !value.endsWith('.') && !value.endsWith(',')) {
      const calculatedTotal = (numValue * formData.detalles.hectareas).toFixed(2)
      console.log('📊 Cálculo de total:', {
        dosificacion: value,
        hectareas: formData.detalles.hectareas,
        total: calculatedTotal
      })
      setTotal(calculatedTotal)
    } else if (value === '') {
      setTotal('')
    }
  }

  const handleDepositoChange = (event: any) => {
    console.log('Changing deposit:', event)
    setDeposito(event)
    // Solo limpiar ubicación si el nuevo depósito no tiene la ubicación actualmente seleccionada
    if (ubicacion && event?.locations && !event.locations.includes(ubicacion)) {
      console.log('Clearing location because it is not available in new deposit')
      setUbicacion('')
    }
  }

  const handleLotNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    // Only allow numbers for lot number
    if (value === '' || /^\d+$/.test(value)) {
      setNroLote(value)
    }
  }

  const handleLotNumberKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow control keys (backspace, delete, arrow keys, etc.)
    if (event.key.length > 1) return
    
    // Only allow numbers
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault()
    }
  }

  const handleUbicacionChange = (event: SelectChangeEvent<string>) => {
    setUbicacion(event.target.value)
  }

  const handleTotalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    // Allow typing decimal separator without immediately calculating
    setTotal(value)
    
    // Only calculate if we have a valid number (not ending with decimal separator)
    const numValue = parseFloat(value)
    if (value !== '' && !isNaN(numValue) && formData.detalles.hectareas && !value.endsWith('.') && !value.endsWith(',')) {
      setDosificacion(
        (numValue / formData.detalles.hectareas).toFixed(2),
      )
    } else if (value === '') {
      setDosificacion('')
    }
  }

  const handleUpdateRows = (updatedRows: any) => {
    setRows(updatedRows)
    setFormData({
      ...formData,
      detalles: { ...formData.detalles, dosis: updatedRows },
    })
  }

  useEffect(() => {
    getSupplies()
    getDeposits()
    getCrops()
  }, [])

  useEffect(() => {
    if (formData?.detalles?.dosis) {
      setRows(formData.detalles.dosis)
    }
  }, [formData])

  if (isLoading) return <div>{t('loading')}</div>

  return (
    <CustomPaper elevation={3}>
      <Title>{t('supplies')}</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          {/* Línea 1: Insumo, Descripción */}
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={6}>
              <AutocompleteSupplies
                key={`supply-${formKey}-${selectedSupply?._id || 'empty'}`}
                value={selectedSupply}
                onChange={handleSelectChange}
                activityType={formData?.tipo}
              />
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ width: '100%', padding: '17px' }}>
                {selectedSupply?.description && (
                  <Typography variant="body2" gutterBottom>
                    {selectedSupply?.description} {selectedSupply?.type}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Línea 2: Deposito, Ubicacion, Nro de Lote (Solo en ejecución) */}
          {mode !== 'plan' && (
            <Grid container item xs={12} spacing={1}>
              <Grid item xs={4}>
                <AutocompleteDeposito
                  key={`deposit-${formKey}-${deposito?._id || 'empty'}`}
                  value={deposito}
                  onChange={handleDepositoChange}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel id="ubicacion-label">{t('location')}</InputLabel>
                  <Select
                    key={`location-${formKey}-${deposito?._id || 'empty'}`}
                    labelId="ubicacion-label"
                    label={t('location')}
                    value={ubicacion}
                    onChange={handleUbicacionChange}
                    disabled={!deposito}
                  >
                    {deposito?.locations?.map((loc: string) => (
                      <MenuItem key={loc} value={loc}>
                        {loc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={t('batchNumber')}
                  value={nroLote}
                  onChange={handleLotNumberChange}
                  onKeyPress={handleLotNumberKeyPress}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                />
              </Grid>
            </Grid>
          )}

          {/* Línea 3: Cantidad, Cant Total */}
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={6}>
              <NumberFieldWithUnits
                fullWidth
                label={t('quantity') + ' x ' + t('hectares')}
                value={dosificacion}
                onChange={handleDosificacionChange}
                unit={selectedSupply?.unitMeasurement || 'unit'}
                allowNegative={false}
                allowDecimals={true}
              />
            </Grid>
            <Grid item xs={5}>
              <NumberFieldWithUnits
                fullWidth
                label={t('totalQuantity')}
                value={total}
                onChange={handleTotalChange}
                unit={selectedSupply?.unitMeasurement || 'unit'}
                allowNegative={false}
                allowDecimals={true}
              />
            </Grid>
            <Grid item xs={1}>
              <IconButton
                onClick={handleAddRow}
                color="primary"
                aria-label={t('add')}
              >
                <AddIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </FormControl>

      {/* Lista de insumos */}
      <SuppliesList
        rows={rows}
        formData={formData}
        onUpdateRows={handleUpdateRows}
      />
    </CustomPaper>
  )
}

export default SuppliesForm