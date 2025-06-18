import React, { useEffect, useState } from 'react'
import {
  FormControl,
  Grid,
  Select,
  InputLabel,
  MenuItem,
  TextField,
  IconButton,
  Paper,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { styled } from '@mui/material/styles'
import uuid4 from 'uuid4'
import { useAppSelector } from '../../../../hooks/useRedux'
import { useDeposit, useLaborsServices, useBusiness, useSupply } from '../../../../hooks'
import { AutocompleteContratista } from '../../components/AutocompleteContratista'
import ServicesList from './ServicesList'
import { useTranslation } from 'react-i18next'

/* --- Estilos de ejemplo --- */
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

interface ServicesFormProps {
  formData: any
  setFormData: (data: any) => void
}

function ServicesForm({ formData, setFormData }: ServicesFormProps) {
  const { t } = useTranslation()
  const { laborsServices, getLaborsServices } = useLaborsServices()
  const { businesses, getBusinesses } = useBusiness()
  const { isLoading, supplies, getSupplies } = useSupply()
  const { getDeposits } = useDeposit()
  const { user } = useAppSelector((state) => state.auth)

  const isBrazil = user?.countryId === 'BR'
  const isFitosanitaria = formData.detalles.fitosanitaria

  // Campos para agregar un nuevo servicio
  const [selectedServiceId, setSelectedServiceId] = useState('')   // ID del servicio seleccionado
  const [contractor, setContractor] = useState('')
  const [comment, setComment] = useState('')
  const [units, setUnits] = useState(0)
  const [art, setArt] = useState('')

  // Fila(s) de servicios agregados
  const [rows, setRows] = useState<any[]>([])

  // Trae datos iniciales
  useEffect(() => {
    getLaborsServices()
    getBusinesses()
    getSupplies()
    getDeposits()
  }, [])

  // Si hay datos en formData, los sincroniza con nuestro estado local
  useEffect(() => {
    if (formData?.detalles?.servicios) {
      setRows(formData.detalles.servicios)
    }
  }, [formData])

  // Agregar una fila de servicio al arreglo
  const handleAddRow = () => {
    if (!selectedServiceId) {
      alert(t('selectServiceBeforeAdding'))
      return
    }

    // Buscar el objeto servicio completo por ID
    const selectedService = laborsServices.find(service => service._id === selectedServiceId)
    if (!selectedService) return

    // Construye el objeto "servicio"
    const newService = {
      // Guardamos el objeto entero en "servicio":
      servicio: selectedService,
      contratista: contractor, // This could be an object from AutocompleteContratista
      comentario: comment,
      unidades: Number(units),
      art: isBrazil && isFitosanitaria ? art : undefined,
      uuid: uuid4(),
    }

    const updatedRows = [...rows, newService]
    setRows(updatedRows)

    // Actualiza en formData global
    setFormData({
      ...formData,
      detalles: {
        ...formData.detalles,
        servicios: updatedRows,
        art: isBrazil && isFitosanitaria ? art : undefined,
      },
    })

    // Limpia inputs
    setSelectedServiceId('')
    setContractor('')
    setComment('')
    setUnits(0)
    if (isBrazil && isFitosanitaria) setArt('')
  }

  // Para cuando ServicesList actualiza/borrra/edita filas
  const handleUpdateRows = (updatedRows: any) => {
    setRows(updatedRows)
    setFormData({
      ...formData,
      detalles: {
        ...formData.detalles,
        servicios: updatedRows,
      },
    })
  }

  if (isLoading) {
    return <div>{t('loading')}</div>
  }

  return (
    <CustomPaper elevation={3}>
      <Title>{t('services')}</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          {/* Si es Brasil + fitosanitaria => mostrar campo ART */}
          {isBrazil && isFitosanitaria && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('artBrazil')}
                variant="outlined"
                value={art}
                onChange={(e) => setArt(e.target.value)}
                helperText={t('phytosanitaryApplicationAuthNumber')}
              />
            </Grid>
          )}

          {/* Fila para "Servicio", "Contratista" y "Unidades" */}
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel id="service-dropdown-label">{t('service')}</InputLabel>
                <Select
                  labelId="service-dropdown-label"
                  id="service-dropdown"
                  value={selectedServiceId || ''} // si es null => ''
                  label={t('service')}
                  onChange={(e) => {
                    // e.target.value es el ID del servicio seleccionado
                    setSelectedServiceId(e.target.value as string)
                  }}
                >
                  {laborsServices.map((serviceObj) => (
                    <MenuItem
                      key={serviceObj._id}
                      value={serviceObj._id} // Guardamos solo el ID
                    >
                      {serviceObj.service}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={4}>
              <AutocompleteContratista
                value={contractor}
                onChange={setContractor}
                width={190}
              />
            </Grid>

            <Grid item xs={3}>
              <TextField
                fullWidth
                label={t('units')}
                type="number"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
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

          {/* Fila para "Comentario" */}
          <Grid container item xs={12} spacing={1} alignItems="flex-end">
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('comment')}
                variant="outlined"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Grid>
          </Grid>
        </Grid>
      </FormControl>

      {/* Lista de Servicios (parecido a SuppliesList) */}
      <ServicesList
        rows={rows}
        onUpdateRows={handleUpdateRows}
        isBrazil={isBrazil}
        isFitosanitaria={isFitosanitaria}
      />
    </CustomPaper>
  )
}

export default ServicesForm