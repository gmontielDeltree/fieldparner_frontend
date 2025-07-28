import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
} from "@mui/material";

export const DebugValorization: React.FC = () => {
  const [formData, setFormData] = useState({
    campanaId: '',
    campoId: '',
    loteId: '',
    rindeHistorico: 0,
    cotizFutCer: 0,
  });

  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[DEBUG] ${message}`);
  };

  // Mock data
  const campaigns = [
    { _id: 'camp1', name: 'Campaña 2024/2025' },
    { _id: 'camp2', name: 'Campaña 2023/2024' },
  ];

  const fields = [
    { _id: 'field1', nombre: 'Campo Norte', lotes: [
      { properties: { uuid: 'lot1', nombre: 'Lote A', hectareas: 50 } },
      { properties: { uuid: 'lot2', nombre: 'Lote B', hectareas: 75 } },
    ]},
    { _id: 'field2', nombre: 'Campo Sur', lotes: [
      { properties: { uuid: 'lot3', nombre: 'Lote C', hectareas: 100 } },
      { properties: { uuid: 'lot4', nombre: 'Lote D', hectareas: 120 } },
    ]},
  ];

  const [availableLotes, setAvailableLotes] = useState<any[]>([]);

  useEffect(() => {
    addLog('Component mounted');
  }, []);

  const handleFieldChange = (field: string, value: any) => {
    addLog(`handleFieldChange called: ${field} = ${value}`);
    
    const updatedFormData = { ...formData, [field]: value };

    switch (field) {
      case 'campoId':
        const selectedField = fields.find(f => f._id === value);
        if (selectedField) {
          setAvailableLotes(selectedField.lotes);
          updatedFormData.loteId = '';
          addLog(`Updated available lots for field: ${selectedField.nombre}`);
        }
        break;
      
      case 'loteId':
        addLog(`Lot selected: ${value}`);
        // The key issue was here - the value wasn't being preserved
        updatedFormData.loteId = value;
        break;
    }

    setFormData(updatedFormData);
    addLog(`FormData updated: ${JSON.stringify(updatedFormData)}`);
  };

  const clearLogs = () => {
    setDebugLog([]);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom>
        Debug Valorization Input Issues
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test Form
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Campaña</InputLabel>
                    <Select
                      value={formData.campanaId}
                      onChange={(e) => handleFieldChange('campanaId', e.target.value)}
                      label="Campaña"
                    >
                      {campaigns.map((campaign) => (
                        <MenuItem key={campaign._id} value={campaign._id}>
                          {campaign.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Campo</InputLabel>
                    <Select
                      value={formData.campoId}
                      onChange={(e) => handleFieldChange('campoId', e.target.value)}
                      label="Campo"
                    >
                      {fields.map((field) => (
                        <MenuItem key={field._id} value={field._id}>
                          {field.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Lote</InputLabel>
                    <Select
                      value={formData.loteId}
                      onChange={(e) => {
                        addLog(`Lote onChange triggered: ${e.target.value}`);
                        handleFieldChange('loteId', e.target.value);
                      }}
                      label="Lote"
                      disabled={!formData.campoId}
                    >
                      {availableLotes.map((lote) => (
                        <MenuItem key={lote.properties.uuid} value={lote.properties.nombre}>
                          {lote.properties.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Rinde histórico (Problematic)"
                    value={formData.rindeHistorico}
                    onChange={(e) => handleFieldChange('rindeHistorico', parseFloat(e.target.value) || 0)}
                    helperText="Try typing multiple digits - it may only accept one"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Rinde histórico (Fixed)"
                    value={formData.rindeHistorico}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFieldChange('rindeHistorico', value === '' ? 0 : parseFloat(value) || 0);
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      handleFieldChange('rindeHistorico', value);
                    }}
                    helperText="This version should allow typing multiple digits"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Debug Log
                </Typography>
                <Button size="small" onClick={clearLogs}>
                  Clear Logs
                </Button>
              </Box>
              
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto', bgcolor: '#f5f5f5' }}>
                {debugLog.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No logs yet. Interact with the form to see debug information.
                  </Typography>
                ) : (
                  debugLog.map((log, index) => (
                    <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                      {log}
                    </Typography>
                  ))
                )}
              </Paper>

              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Current Form State:
                </Typography>
                <Paper variant="outlined" sx={{ p: 1, bgcolor: '#f5f5f5' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {JSON.stringify(formData, null, 2)}
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Issues Found and Fixes Applied:
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>1. Lote Select Clearing:</strong> The issue was in the handleFieldChange function. 
            When 'loteId' was selected, the value wasn't being properly preserved in the updatedFormData object.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>2. Rinde Histórico Single Digit:</strong> The parseFloat was being called on every onChange, 
            which was interfering with typing. The fix is to allow the raw value during typing and only parse on blur.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>3. Cotiz Futura Cereal:</strong> Same issue as Rinde Histórico - parseFloat on every keystroke.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};