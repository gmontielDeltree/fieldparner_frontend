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

function ServicesForm({ formData, setFormData }) {
  const { laborsServices, getLaborsServices } = useLaborsServices()
  const { businesses, getBusinesses } = useBusiness()
  const { isLoading, supplies, getSupplies } = useSupply()
  const { getDeposits } = useDeposit()
  const { user } = useAppSelector((state) => state.auth)

  const isBrazil = user?.countryId === 'BR'
  const isFitosanitaria = formData.detalles.fitosanitaria

  // Campos para agregar un nuevo servicio
  const [selectedService, setSelectedService] = useState(null)   // Aquí guardaremos el objeto entero
  const [contractor, setContractor] = useState('')
  const [comment, setComment] = useState('')
  const [units, setUnits] = useState(0)
  const [unitPrice, setUnitPrice] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [art, setArt] = useState('')

  // Fila(s) de servicios agregados
  const [rows, setRows] = useState([])

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

  // Recalcula el total al cambiar unidades o precio
  useEffect(() => {
    const total = Number(units) * Number(unitPrice)
    setTotalCost(total.toFixed(2))
  }, [units, unitPrice])

  // Agregar una fila de servicio al arreglo
  const handleAddRow = () => {
    if (!selectedService) {
      alert('Seleccione un servicio antes de agregar')
      return
    }

    // Construye el objeto "servicio"
    const newService = {
      // Guardamos el objeto entero en "servicio":
      servicio: selectedService,
      contratista: contractor, // This could be an object from AutocompleteContratista
      comentario: comment,
      unidades: Number(units),
      precio_unidad: Number(unitPrice),
      costo_total: Number(totalCost),
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
    setSelectedService(null)
    setContractor('')
    setComment('')
    setUnits(0)
    setUnitPrice(0)
    setTotalCost(0)
    if (isBrazil && isFitosanitaria) setArt('')
  }

  // Para cuando ServicesList actualiza/borrra/edita filas
  const handleUpdateRows = (updatedRows) => {
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
    return <div>Loading...</div>
  }

  return (
    <CustomPaper elevation={3}>
      <Title>Servicios</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          {/* Si es Brasil + fitosanitaria => mostrar campo ART */}
          {isBrazil && isFitosanitaria && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ART (Brasil)"
                variant="outlined"
                value={art}
                onChange={(e) => setArt(e.target.value)}
                helperText="Nro de Autorización para aplicación fitosanitaria"
              />
            </Grid>
          )}

          {/* Fila para "Servicio", "Contratista" y "Comentario" */}
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel id="service-dropdown-label">Servicio</InputLabel>
                <Select
                  labelId="service-dropdown-label"
                  id="service-dropdown"
                  value={selectedService || ''} // si es null => ''
                  label="Servicio"
                  onChange={(e) => {
                    // e.target.value es el OBJETO "service" seleccionado
                    setSelectedService(e.target.value)
                  }}
                >
                  {laborsServices.map((serviceObj) => (
                    <MenuItem
                      key={serviceObj._id}
                      value={serviceObj} // Guardamos el objeto completo
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
                label="Comentario"
                variant="outlined"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Grid>

            <Grid item xs={1}>
              <IconButton
                onClick={handleAddRow}
                color="primary"
                aria-label="add"
              >
                <AddIcon />
              </IconButton>
            </Grid>
          </Grid>

          {/* Fila para "Unidades", "Valor Unidad" y "Valor Total" */}
          <Grid container item xs={12} spacing={1} alignItems="flex-end">
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Unidades"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Valor Unidad"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </Grid>

            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Valor Total Servicio"
                value={totalCost}
                InputProps={{
                  readOnly: true,
                }}
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