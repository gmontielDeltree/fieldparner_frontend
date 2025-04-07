import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import { useTranslation } from 'react-i18next';
import React from 'react';

interface LocalidadOption {
  value: string;
  label: string;
}

interface LocalidadSelectProps {
  localidad: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  localidades?: (LocalidadOption | string)[];
  disabled?: boolean;
}

export const LocalidadSelect = ({ 
  localidad, 
  handleInputChange, 
  localidades = [],
  disabled = false
}: LocalidadSelectProps) => {
  const { t } = useTranslation();

  // Función para normalizar las localidades (soporta Brasil, Argentina, Paraguay)
  const getNormalizedLocalidades = () => {
    const unique = new Map<string, string>();
    
    localidades.forEach(loc => {
      // Caso 1: Ya es un objeto {value, label}
      if (typeof loc === 'object' && loc.value) {
        if (!unique.has(loc.value)) {
          unique.set(loc.value, loc.label || loc.value);
        }
      } 
      // Caso 2: Es un string (para Brasil y otros países)
      else if (typeof loc === 'string') {
        if (!unique.has(loc)) {
          unique.set(loc, loc);
        }
      }
    });

    return Array.from(unique.entries()).map(([value, label]) => ({ 
      value, 
      label: label || value 
    }));
  };

  const normalizedLocalidades = getNormalizedLocalidades();


  React.useEffect(() => {
    if (normalizedLocalidades.length === 1 && !localidad) {
      handleInputChange({
        target: {
          name: "localidad",
          value: normalizedLocalidades[0].value
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [normalizedLocalidades, localidad, handleInputChange]);

  return (
    <TextField
      select
      label={t("_locality")}
      variant="outlined"
      name="localidad"
      value={localidad}
      onChange={handleInputChange}
      disabled={disabled || normalizedLocalidades.length === 0}
      InputProps={{
        startAdornment: <InputAdornment position="start" />
      }}
      fullWidth
    >
      {normalizedLocalidades.length > 0 ? (
        normalizedLocalidades.map((loc) => (
          <MenuItem key={loc.value} value={loc.value}>
            {loc.label}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled value="">
          {t("no_localities_available")}
        </MenuItem>
      )}
    </TextField>
  );
};