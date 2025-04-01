import React from 'react'
import {
  TextField,
  FormControl,
  Grid,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { NumberFieldWithUnits } from '../../components/NumberField'
import { useTranslation } from 'react-i18next'

const CustomPaper = styled(Paper)({
  padding: '20px',
  margin: '20px 0',
  backgroundColor: '#f7f7f7',
})

const Title = styled(Typography)({
  fontSize: '1.5em',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '20px',
})

interface OtherDetailsFormProps {
  lot: any
  formData: any
  setFormData: (formData: any) => void
}

const OtherDetailsForm: React.FC<OtherDetailsFormProps> = ({
  lot,
  formData,
  setFormData,
}) => {
  const { t } = useTranslation()

  const handleInputChange = (field) => (event) => {
    const { value } = event.target

    setFormData({
      ...formData,
      detalles: {
        ...formData.detalles,
        [field]: value,
      },
    })
  }

  return (
    <CustomPaper elevation={3}>
      <Title>{t('otherData')}</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              style={{ width: '100%' }}
              select
              id="tipo_siembra"
              label={t('seedingType')}
              value={formData.detalles.tipo_siembra || ''}
              onChange={handleInputChange('tipo_siembra')}
            >
              {/* Mantenemos los valores originales para no afectar la lógica de la aplicación */}
              {/* Solo traducimos las etiquetas visibles para el usuario */}
              <MenuItem value="Siembra Directa">{t('directSeeding')}</MenuItem>
              <MenuItem value="Siembra Tradicional">
                {t('traditionalSeeding')}
              </MenuItem>
              <MenuItem value="Al voleo">{t('broadcast')}</MenuItem>
              <MenuItem value="Siembra por fila/surcos">
                {t('rowSeeding')}
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <NumberFieldWithUnits
              value={formData.detalles.densidad_objetivo}
              onChange={handleInputChange('densidad_objetivo')}
              unit="plantas/ha"
              label={t('targetDensity')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <NumberFieldWithUnits
              id="profundidad"
              label={t('depth')}
              type="number"
              value={formData.detalles.profundidad || ''}
              onChange={handleInputChange('profundidad')}
              fullWidth
              unit="cm"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <NumberFieldWithUnits
              id="distancia"
              label={t('rowSpacing')}
              type="number"
              value={formData.detalles.distancia}
              onChange={handleInputChange('distancia')}
              fullWidth
              unit="cm"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <NumberFieldWithUnits
              id="peso_1000"
              label={t('thousandSeedWeight')}
              type="number"
              value={formData.detalles.peso_1000}
              onChange={handleInputChange('peso_1000')}
              unit="grs"
              fullWidth
            />
          </Grid>
        </Grid>
      </FormControl>
    </CustomPaper>
  )
}

export default OtherDetailsForm