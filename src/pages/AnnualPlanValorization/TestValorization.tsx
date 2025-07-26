import React, { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';

// Componente de prueba para verificar el problema del Select
export const TestValorization = () => {
  const [formData, setFormData] = useState({
    campo: '',
    lote: ''
  });

  const campos = [
    { id: '1', nombre: 'Campo 1', lotes: [{ id: '11', nombre: 'Lote A' }, { id: '12', nombre: 'Lote B' }] },
    { id: '2', nombre: 'Campo 2', lotes: [{ id: '21', nombre: 'Lote C' }, { id: '22', nombre: 'Lote D' }] }
  ];

  const [availableLotes, setAvailableLotes] = useState<any[]>([]);

  const handleFieldChange = (field: string, value: string) => {
    console.log(`Cambiando ${field} a ${value}`);
    
    if (field === 'campo') {
      const selectedCampo = campos.find(c => c.id === value);
      if (selectedCampo) {
        setAvailableLotes(selectedCampo.lotes);
        setFormData({
          campo: value,
          lote: '' // Reset lote cuando cambia campo
        });
      }
    } else if (field === 'lote') {
      setFormData(prev => ({
        ...prev,
        lote: value
      }));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <h2>Test de Selects</h2>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Campo</InputLabel>
        <Select
          value={formData.campo}
          onChange={(e) => handleFieldChange('campo', e.target.value)}
          label="Campo"
        >
          {campos.map(campo => (
            <MenuItem key={campo.id} value={campo.id}>
              {campo.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Lote</InputLabel>
        <Select
          value={formData.lote}
          onChange={(e) => handleFieldChange('lote', e.target.value)}
          label="Lote"
          disabled={!formData.campo}
        >
          {availableLotes.map(lote => (
            <MenuItem key={lote.id} value={lote.id}>
              {lote.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ mt: 2 }}>
        <p>Campo seleccionado: {formData.campo}</p>
        <p>Lote seleccionado: {formData.lote}</p>
      </Box>
    </Box>
  );
};