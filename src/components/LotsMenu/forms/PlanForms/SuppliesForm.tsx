import React, { useEffect, useState } from 'react'
import {
  FormControl,
  Grid,
  TextField,
  IconButton,
  Typography,
  Paper,
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

function SuppliesForm({ lot, db, formData, setFormData }) {
  const [selectedSupply, setSelectedSupply] = useState()
  const [dosificacion, setDosificacion] = useState('')
  const [total, setTotal] = useState('')
  const [precio, setPrecio] = useState('')
  const [costoTotal, setCostoTotal] = useState(0)
  const [nroLote, setNroLote] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [rows, setRows] = useState([])
  const [deposito, setDeposito] = useState()

  const { isLoading, supplies, getSupplies } = useSupply()
  const { getCrops, crops } = useCrops()
  const { deposits, getDeposits } = useDeposit()

  const handleAddRow = () => {
    const supply = selectedSupply
    if (!supply) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor seleccione un insumo',
      })
      return
    }

    // Validación de compatibilidad de semillas
    if (supply && supply.type === 'Semillas') {
      const { _id } = formData.detalles.cultivo
      const cropId = supply?.cropId
      if (cropId && cropId !== _id) {
        Swal.fire({
          icon: 'error',
          title: 'Insumo incompatible',
          text: 'El insumo seleccionado no es compatible con el cultivo',
        })
        return
      }
    }
    const newRow = {
      selectedOption: selectedSupply,
      dosificacion,
      total,
      deposito,
      nro_lote: nroLote,
      ubicacion,
      precio, // ojo: en vez de precio_estimado
      uuid: uuid4(),
    }

    const newDetalles = [...formData.detalles.dosis, newRow]

    setFormData({
      ...formData,
      detalles: { ...formData.detalles, dosis: newDetalles },
    })

    // Limpiar campos después de agregar
    setSelectedSupply('')
    setDosificacion('')
    setTotal('')
    setDeposito('')
    setNroLote('')
    setUbicacion('')
    setPrecio('')
  }

  const handleSelectChange = (event) => {
    setSelectedSupply(event)
  }

  const handleDosificacionChange = (event) => {
    setDosificacion(event.target.value)
    setTotal((+event.target.value * formData.detalles.hectareas).toFixed(2))
    setCostoTotal(
      (+event.target.value * formData.detalles.hectareas * +precio).toFixed(2),
    )
  }

  const handleDepositoChange = (event) => {
    setDeposito(event)
  }

  const handleLotNumberChange = (event) => {
    setNroLote(event.target.value)
  }

  const handleUbicacionChange = (event) => {
    setUbicacion(event.target.value)
  }

  const handleTotalChange = (event) => {
    setTotal(event.target.value)
    setDosificacion(
      (+event.target.value / formData.detalles.hectareas).toFixed(2),
    )
    setCostoTotal((+event.target.value * +precio).toFixed(2))
  }

  const handlePrecioChange = (event) => {
    setPrecio(event.target.value)
    setCostoTotal((+event.target.value * +total).toFixed(2))
  }

  const handleUpdateRows = (updatedRows) => {
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

  if (isLoading) return <div>Loading...</div>

  return (
    <CustomPaper elevation={3}>
      <Title>Insumos</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          {/* Línea 1: Insumo, Descripción */}
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={6}>
              <AutocompleteSupplies
                value={selectedSupply}
                onChange={handleSelectChange}
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

          {/* Línea 2: Deposito, Nro de Lote, Ubicacion */}
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={4}>
              <AutocompleteDeposito
                value={deposito}
                onChange={handleDepositoChange}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Nro de Lote"
                value={nroLote}
                onChange={handleLotNumberChange}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Ubicacion"
                value={ubicacion}
                onChange={handleUbicacionChange}
              />
            </Grid>
          </Grid>

          {/* Línea 3: Cantidad, Cant Total */}
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={6}>
              <NumberFieldWithUnits
                fullWidth
                label="Cantidad"
                value={dosificacion}
                onChange={handleDosificacionChange}
                unit={selectedSupply?.unitMeasurement || 'unit'}
              />
            </Grid>
            <Grid item xs={5}>
              <NumberFieldWithUnits
                fullWidth
                label="Cant Total"
                value={total}
                onChange={handleTotalChange}
                unit={selectedSupply?.unitMeasurement || 'unit'}
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
