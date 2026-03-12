import React, { useRef } from 'react';
import {
  TextField,
  FormControl,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Divider,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  Download,
  Upload,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import {
  exportSoilVariablesToExcel,
  importSoilVariablesFromExcel,
  generateSoilVariablesTemplate
} from '../../../../helpers/groundSampleExcel';

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

const ExcelButton = styled(Button)({
  textTransform: 'none',
  fontWeight: 500,
  padding: '8px 16px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const ExcelSection = styled(Box)({
  backgroundColor: '#f0f7ff',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '24px',
  border: '1px solid #e3f2fd',
});

function VariablesForm({ lot, formData, setFormData }) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
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

  // Handle Excel export
  const handleExportExcel = () => {
    const soilVariables = {};
    // Convert string values to numbers for export
    Object.entries(formData.soilVariables || {}).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        const numValue = parseFloat(value.toString().replace(',', '.'));
        if (!isNaN(numValue)) {
          soilVariables[key] = numValue;
        }
      }
    });

    const lotName = lot?.nombre || 'Lote';
    const result = exportSoilVariablesToExcel(soilVariables, lotName);

    if (result.success) {
      setImportMessage({
        type: 'success',
        text: t('exportSuccess') || `Archivo ${result.fileName} exportado exitosamente`
      });
      setTimeout(() => setImportMessage(null), 3000);
    } else {
      setImportMessage({
        type: 'error',
        text: t('exportError') || 'Error al exportar el archivo'
      });
    }
  };

  // Handle Excel import
  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await importSoilVariablesFromExcel(file);

    if (result.success && result.data) {
      // Convert imported data to string format for the form
      const updatedSoilVariables = { ...formData.soilVariables };
      Object.entries(result.data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          updatedSoilVariables[key] = value.toString();
        }
      });

      setFormData({ ...formData, soilVariables: updatedSoilVariables });
      setImportMessage({
        type: 'success',
        text: t('importSuccess') || 'Datos importados exitosamente'
      });
    } else {
      setImportMessage({
        type: 'error',
        text: result.error || t('importError') || 'Error al importar el archivo'
      });
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Clear message after 5 seconds
    setTimeout(() => setImportMessage(null), 5000);
  };

  // Handle template download
  const handleDownloadTemplate = () => {
    const result = generateSoilVariablesTemplate();
    if (result.success) {
      setImportMessage({
        type: 'success',
        text: t('templateDownloaded') || `Plantilla ${result.fileName} descargada`
      });
      setTimeout(() => setImportMessage(null), 3000);
    }
  };

  return (
    <CustomPaper elevation={3}>
      <Title>{t('variables') || 'Variables'}</Title>

      {/* Excel Import/Export Section */}
      <ExcelSection>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              <FileSpreadsheet size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              {t('excelTools') || 'Herramientas Excel'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('excelToolsDescription') || 'Importe o exporte las variables del análisis de suelo'}
            </Typography>
          </Box>

          <Box display="flex" gap={1} flexWrap="wrap">
            {/* Download Template Button */}
            <ExcelButton
              variant="outlined"
              color="info"
              onClick={handleDownloadTemplate}
              size="small"
            >
              <FileSpreadsheet size={18} />
              {t('downloadTemplate') || 'Plantilla'}
            </ExcelButton>

            {/* Import Button */}
            <ExcelButton
              variant="contained"
              color="primary"
              onClick={() => fileInputRef.current?.click()}
              size="small"
            >
              <Upload size={18} />
              {t('importExcel') || 'Importar Excel'}
            </ExcelButton>

            {/* Export Button */}
            <ExcelButton
              variant="contained"
              color="success"
              onClick={handleExportExcel}
              disabled={!formData.soilVariables || Object.keys(formData.soilVariables).length === 0}
              size="small"
            >
              <Download size={18} />
              {t('exportExcel') || 'Exportar Excel'}
            </ExcelButton>
          </Box>
        </Box>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleImportExcel}
        />

        {/* Import/Export messages */}
        {importMessage && (
          <Alert
            severity={importMessage.type}
            onClose={() => setImportMessage(null)}
            sx={{ mt: 2 }}
            icon={importMessage.type === 'error' ? <AlertCircle size={20} /> : null}
          >
            {importMessage.text}
          </Alert>
        )}
      </ExcelSection>

      <Divider sx={{ mb: 3 }} />

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
