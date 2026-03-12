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
  name?: string;
  localidad: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  localidades?: (LocalidadOption | string)[];
  disabled?: boolean;
  required?: boolean;
}

export const LocalidadSelect = ({ 
  name,
  localidad, 
  handleInputChange, 
  localidades = [],
  disabled = false,
  required = false
}: LocalidadSelectProps) => {
  const { t } = useTranslation();
  
  const resolvedName = name ?? "localidad";

  // Función para normalizar las localidades (soporta Brasil, Argentina, Paraguay)
  const getNormalizedLocalidades = React.useCallback(() => {
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
  }, [localidades]);

  const normalizedLocalidades = getNormalizedLocalidades();

  // Verificar si el valor actual es válido
  const isValidValue = React.useMemo(() => {
    return normalizedLocalidades.some(loc => loc.value === localidad);
  }, [normalizedLocalidades, localidad]);

  // Valor a mostrar en el campo
  const displayValue = React.useMemo(() => {
    if (isValidValue) return localidad;
    if (normalizedLocalidades.length === 1) return normalizedLocalidades[0].value;
    return '';
  }, [localidad, isValidValue, normalizedLocalidades]);

React.useEffect(() => {
  if (normalizedLocalidades.length === 1 && (!localidad || !isValidValue)) {
    handleInputChange({
      target: {
        name: resolvedName,
        value: normalizedLocalidades[0].value
      }
    } as React.ChangeEvent<HTMLInputElement>);
  } else if (!isValidValue && normalizedLocalidades.length > 0 && localidad) {
    handleInputChange({
      target: {
        name: resolvedName,
        value: ''
      }
    } as React.ChangeEvent<HTMLInputElement>);
  }
}, [normalizedLocalidades, localidad, isValidValue, handleInputChange, resolvedName]);

  return (
    <TextField
      select
      label={t("_locality")}
      variant="outlined"
      name={resolvedName}
      value={displayValue}
      onChange={handleInputChange}
      disabled={disabled || normalizedLocalidades.length === 0}
      error={required && !displayValue}
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