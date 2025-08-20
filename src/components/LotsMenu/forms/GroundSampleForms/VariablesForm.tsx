import { TextField, FormControl, Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomPaper = styled(Paper)({
  padding: '20px',
  margin: '20px 0',
  backgroundColor: '#f7f7f7',
});

const Title = styled(Typography)({
  fontSize: '1.5em',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '20px',
});

function VariablesForm({ formData, setFormData }) {
  const onFieldChange = (fieldName, value) => {
    // Permitir entrada vacía
    if (value === '') {
      const updatedSoilVariables = {
        ...formData.soilVariables,
        [fieldName]: '',
      };
      setFormData({ ...formData, soilVariables: updatedSoilVariables });
      return;
    }

    // Validación para números con máximo 3 decimales
    const isValidDecimal = /^-?\d*[.,]?\d{0,3}$/.test(value);
    if (!isValidDecimal) {
      return;
    }

    // Actualizar el valor
    const updatedSoilVariables = {
      ...formData.soilVariables,
      [fieldName]: value,
    };
    setFormData({ ...formData, soilVariables: updatedSoilVariables });
  };

  return (
    <CustomPaper elevation={3}>
      <Title>Variables</Title>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          {[
            'carbono_organico',
            'materia_organica',
            'fosforo_bray',
            'fosforo_ii',
            'fosforo_iii',
            'calcio',
            'potasio',
            'sodio',
            'azufre',
            'zinc_zn',
            'nitratos_no3',
            'sulfatos_s_so4',
            'nitratos_n_n03',
            'nitrogeno_total',
            'humedad',
            'conductividad_electrica',
          ].map(field => (
            <Grid item xs={12} sm={6} md={4} key={field}>
              <TextField
                id={field}
                label={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                fullWidth
                type='text'
                value={formData.soilVariables?.[field] ?? ''}
                onChange={e => onFieldChange(field, e.target.value)}
                inputProps={{
                  inputMode: 'text', // Cambiado de 'decimal' a 'text'
                  style: { fontSize: '16px' },
                }}
                sx={{
                  '& input': {
                    color: 'rgba(0, 0, 0, 0.87)',
                  },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </FormControl>
    </CustomPaper>
  );
}

export default VariablesForm;
