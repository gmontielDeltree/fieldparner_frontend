import React, { useState, useEffect } from 'react'
import {
  IconButton,
  List,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  Collapse,
  Chip,
  Divider,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import InventoryIcon from '@mui/icons-material/Inventory'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import QrCodeIcon from '@mui/icons-material/QrCode'
import WarehouseIcon from '@mui/icons-material/Warehouse'
import { styled, keyframes, alpha } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { NumberFieldWithUnits } from '../../components/NumberField'
import { AutocompleteSupplies } from '../../components/AutocompleteSupplies'
import { AutocompleteDeposito } from '../../components/AutocompleteDeposito'
import { normalizeSupplyDoseLine, resolveSupplyDosificacion } from '../../../../utils/supplyDose'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
`

const CustomListItem = styled(Card)(({ theme, deleting }) => ({
  margin: '12px 0',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '16px',
  boxShadow:
    'rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  animation: deleting ? `${fadeOut} 0.5s forwards` : `${fadeIn} 0.5s ease-out`,
  border: '1px solid',
  borderColor:
    theme.palette.mode === 'dark'
      ? 'transparent'
      : alpha(theme.palette.grey[500], 0.12),

  '&:hover': {
    transform: deleting ? 'none' : 'translateY(-2px)',
    boxShadow: deleting
      ? 'none'
      : 'rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 24px 48px -4px',
  },
}))

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.75rem',
  height: '24px',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  '& .MuiChip-label': {
    padding: '0 8px',
  },
}))

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.action.active, 0.04),
  '&:hover': {
    backgroundColor: alpha(theme.palette.action.active, 0.12),
  },
}))

const ContentSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:not(:last-child)': {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  },
}))

const MetaInfo = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  '& svg': {
    fontSize: '1rem',
  },
}))

function SuppliesList({ rows, formData, onUpdateRows }) {
  const { t } = useTranslation()
  const [editIndex, setEditIndex] = useState(-1)
  const [editData, setEditData] = useState({
    insumo: null,
    dosificacion: '',
    nro_lote: '',
    ubicacion: '',
    total: '',
    deposito: null,
    uuid: '',
  })

  const [deletingIndex, setDeletingIndex] = useState(null)

  const handleEditRow = (index) => {
    const rowToEdit = rows[index]
    if (!rowToEdit) return
    const normalizedRow = normalizeSupplyDoseLine(
      rowToEdit,
      formData?.detalles?.hectareas,
    )

    console.log('Starting edit for row:', normalizedRow)

    // Hacer una copia profunda de los datos, cambiando selectedOption a insumo
    const editDataCopy = {
      insumo: normalizedRow.insumo
        ? { ...normalizedRow.insumo }
        : normalizedRow.selectedOption // Fallback to selectedOption if insumo doesn't exist (for backward compatibility)
          ? { ...normalizedRow.selectedOption }
          : null,
      dosificacion: normalizedRow.dosificacion ?? '',
      nro_lote: normalizedRow.nro_lote ?? '',
      ubicacion: normalizedRow.ubicacion ?? '',
      total: normalizedRow.total ?? '',
      deposito: normalizedRow.deposito ? { ...normalizedRow.deposito } : null,
      precio: normalizedRow.precio ?? '',
      uuid: normalizedRow.uuid,
    }

    console.log('Edit data initialized as:', editDataCopy)
    setEditData(editDataCopy)
    setEditIndex(index)
  }

  const handleDeleteRow = async (index) => {
    setDeletingIndex(index)
    const updatedRows = [...rows]
    updatedRows[index] = { ...updatedRows[index], deleting: true }
    onUpdateRows(updatedRows)

    setTimeout(() => {
      const filteredRows = rows.filter((_, idx) => idx !== index)
      onUpdateRows(filteredRows)
      setDeletingIndex(null)
    }, 500)
  }

  const handleSaveEdit = () => {
    const originalRow = rows[editIndex]
    const normalizedOriginalRow = normalizeSupplyDoseLine(
      originalRow,
      formData?.detalles?.hectareas,
    )
    console.log('Original row:', originalRow)
    console.log('Edit data:', editData)

    // Creamos el objeto actualizado con los valores editados o los originales si no se modificaron
    const updatedRow = {
      ...originalRow, // Mantenemos todas las propiedades originales como base
      insumo:
        editData.insumo !== null
          ? editData.insumo
          : originalRow.insumo || originalRow.selectedOption, // Fallback to selectedOption
      // Remove selectedOption completely if we have insumo
      selectedOption: undefined,
      dosificacion:
        editData.dosificacion !== ''
          ? editData.dosificacion
          : normalizedOriginalRow.dosificacion,
      dosis:
        editData.dosificacion !== ''
          ? editData.dosificacion
          : normalizedOriginalRow.dosificacion,
      nro_lote:
        editData.nro_lote !== '' ? editData.nro_lote : originalRow.nro_lote,
      ubicacion:
        editData.ubicacion !== '' ? editData.ubicacion : originalRow.ubicacion,
      total: editData.total !== '' ? editData.total : normalizedOriginalRow.total,
      deposito:
        editData.deposito !== null ? editData.deposito : originalRow.deposito,

      uuid: originalRow.uuid,
    }

    console.log('Updated row before save:', updatedRow)

    // Validación adicional
    if (!updatedRow.insumo) {
      console.error('insumo is required')
      return
    }

    console.log('Updated row:', updatedRow) // Debug log

    const updatedRows = [...rows]
    updatedRows[editIndex] = updatedRow
    onUpdateRows(updatedRows)

    // Reset edit state
    setEditIndex(-1)
    setEditData({
      insumo: null, // Changed from selectedOption to insumo
      dosificacion: '',
      nro_lote: '',
      ubicacion: '',
      total: '',
      deposito: null,
      precio: '',
      uuid: '',
    })
  }


  const handleCancelEdit = () => {
    setEditIndex(-1)
    setEditData({
      selectedOption: null,
      dosificacion: '',
      nro_lote: '',
      ubicacion: '',
      total: '',
      deposito: null,
      precio: '',
      uuid: '',
    })
  }

  const handleEditSupplyChange = (value) => {
    console.log('Supply changed to:', value) // Debug log
    setEditData((prev) => ({
      ...prev,
      insumo: value, // Changed from selectedOption to insumo
    }))
  }

  const handleEditDepositoChange = (value) => {
    setEditData((prev) => ({
      ...prev,
      deposito: value,
    }))
  }

  const handleEditCantidadPorHaChange = (event) => {
    const value = event.target.value
    setEditData((prev) => ({
      ...prev,
      dosificacion: value,
      total: formData?.detalles?.hectareas
        ? (value * formData.detalles.hectareas).toFixed(2)
        : value,
    }))
  }

  const handleEditCantidadTotalChange = (event) => {
    const value = event.target.value
    setEditData((prev) => ({
      ...prev,
      total: value,
      dosificacion: formData?.detalles?.hectareas
        ? (value / formData.detalles.hectareas).toFixed(2)
        : value,
    }))
  }

  const handleEditNroLoteChange = (event) => {
    const value = event.target.value
    // Only allow numbers for lot number
    if (value === '' || /^\d+$/.test(value)) {
      setEditData((prev) => ({
        ...prev,
        nro_lote: value,
      }))
    }
  }

  const handleNroLoteKeyPress = (event) => {
    // Allow control keys (backspace, delete, arrow keys, etc.)
    if (event.key.length > 1) return
    
    // Only allow numbers
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault()
    }
  }

  const handleEditUbicacionChange = (event) => {
    setEditData((prev) => ({
      ...prev,
      ubicacion: event.target.value,
    }))
  }

  const abrUnit = (unit) => {
    if (!unit) return 'unit'
    let splited = unit.split('/')
    if (splited.length > 0) {
      let ns = splited.map((u) => (u.length > 7 ? u.slice(0, 7) + '..' : u))
      return ns.join('/')
    } else {
      let ns = unit.length > 6 ? unit.slice(6) + '..' : unit
      return ns
    }
  }

  // Agregar logs para depuración
  useEffect(() => {
    console.log('Current rows:', rows)
  }, [rows])

  useEffect(() => {
    console.log('Current editData:', editData)
  }, [editData])

  return (
    <Box mt={4}>
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontWeight: 600,
        }}
      >
        <InventoryIcon sx={{ fontSize: '1.5rem' }} />
        {t('addedSupplies')}
      </Typography>
      <List sx={{ position: 'relative' }}>
        {rows.map((row, index) => {
          // Get the supply object from either insumo or selectedOption for backward compatibility
          const supply = row.insumo || row.selectedOption;
          const displayDosificacion = resolveSupplyDosificacion(
            row,
            formData?.detalles?.hectareas,
          );

          // If no supply information is available, skip rendering this row
          if (!supply) {
            console.warn('Row missing supply information:', row);
            return null;
          }

          return (
            <CustomListItem
              key={row.uuid || index}
              deleting={deletingIndex === index}
            >
              <CardContent sx={{ p: 0 }}>
                {editIndex === index ? (
                  <ContentSection>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <AutocompleteSupplies
                          value={editData.insumo}
                          onChange={handleEditSupplyChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <AutocompleteDeposito
                          value={editData.deposito}
                          onChange={handleEditDepositoChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <NumberFieldWithUnits
                          size="small"
                          fullWidth
                          label={t('quantityPerHectare')}
                          value={editData.dosificacion}
                          onChange={handleEditCantidadPorHaChange}
                          unit={
                            editData.insumo?.unitMeasurement
                              ? `${editData.insumo.unitMeasurement}/ha`
                              : 'unit/ha'
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <NumberFieldWithUnits
                          fullWidth
                          label={t('totalQuantity')}
                          value={editData.total}
                          onChange={handleEditCantidadTotalChange}
                          unit={
                            editData.insumo?.unitMeasurement || 'unit'
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label={t('batchNumber')}
                          value={editData.nro_lote}
                          onChange={handleEditNroLoteChange}
                          onKeyPress={handleNroLoteKeyPress}
                          inputProps={{
                            inputMode: 'numeric',
                            pattern: '[0-9]*'
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label={t('location')}
                          value={editData.ubicacion}
                          onChange={handleEditUbicacionChange}
                        />
                      </Grid>
                    </Grid>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mt: 2,
                        gap: 1,
                      }}
                    >
                      <ActionButton
                        color="primary"
                        onClick={handleSaveEdit}
                        size="small"
                      >
                        <SaveIcon />
                      </ActionButton>
                      <ActionButton
                        color="error"
                        onClick={handleCancelEdit}
                        size="small"
                      >
                        <CloseIcon />
                      </ActionButton>
                    </Box>
                  </ContentSection>
                ) : (
                  <>
                    <ContentSection>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            {supply.name}
                          </Typography>
                          {supply.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {supply.description}
                            </Typography>
                          )}
                        </Box>
                        {supply.type && (
                          <StyledChip label={supply.type} />
                        )}
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <MetaInfo variant="body2">
                            <QrCodeIcon />
                            <strong>{t('quantityPerHectare')}:</strong>{' '}
                            {displayDosificacion}{' '}
                            {abrUnit(supply?.unitMeasurement)}/ha
                          </MetaInfo>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <MetaInfo variant="body2">
                            <InventoryIcon />
                            <strong>{t('totalQuantity')}:</strong> {row.total}{' '}
                            {abrUnit(supply?.unitMeasurement)}
                          </MetaInfo>
                        </Grid>
                      </Grid>
                    </ContentSection>

                    <ContentSection>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <MetaInfo variant="body2">
                            <WarehouseIcon />
                            <strong>{t('deposit')}:</strong> {row.deposito ? row.deposito.description : t('notSpecified')}
                          </MetaInfo>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <MetaInfo variant="body2">
                            <LocationOnIcon />
                            <strong>{t('location')}:</strong> {row.ubicacion || t('notSpecified')}
                          </MetaInfo>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <MetaInfo variant="body2">
                            <QrCodeIcon />
                            <strong>{t('batchNumber')}:</strong> {row.nro_lote || t('notSpecified')}
                          </MetaInfo>
                        </Grid>
                      </Grid>
                    </ContentSection>

                    <ContentSection
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1,
                        backgroundColor: (theme) =>
                          alpha(theme.palette.background.default, 0.5),
                      }}
                    >
                      <ActionButton
                        color="primary"
                        onClick={() => handleEditRow(index)}
                        size="small"
                      >
                        <EditIcon />
                      </ActionButton>
                      <ActionButton
                        color="error"
                        onClick={() => handleDeleteRow(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </ActionButton>
                    </ContentSection>
                  </>
                )}
              </CardContent>
            </CustomListItem>
          );
        })}
      </List>
    </Box>
  );
}
export default SuppliesList
