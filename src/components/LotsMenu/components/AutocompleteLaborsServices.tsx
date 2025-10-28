import React, { useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  TextField,
  Typography,
  createFilterOptions,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../hooks';
import { uiOpenModal } from '../../../redux/ui';
import { DisplayModals } from '../../../types';
import { LaborsServices } from '../../../types';
import { useLaborsServices } from '../../../hooks';
import { useAutocompleteAddOption } from '../../AutocompleteAddOption';
import { ViewComponentModal } from '../../';
import { LaborsServicesFormModal } from './LaborsServicesFormModal';


interface FilmOptionType {
  inputValue?: string;
  name: string;
}

const filter = createFilterOptions<FilmOptionType>();

interface LaborsServicesOptionType extends LaborsServices {
  inputValue?: string;
}

interface AutocompleteLaborsServicesProps {
  value?: LaborsServicesOptionType | null;
  onChange: (value: LaborsServicesOptionType | null) => void;
  width?: number;
  label?: string;
  selectedServiceId?: string;
  onServiceIdChange?: (serviceId: string) => void;
}

export const AutocompleteLaborsServices: React.FC<AutocompleteLaborsServicesProps> = ({ 
  value, 
  onChange, 
  width = 300,
  label,
  selectedServiceId,
  onServiceIdChange
}) => {
  const [_value, setValue] = React.useState<LaborsServicesOptionType | null>(value || null);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { laborsServices, getLaborsServices } = useLaborsServices();

  // Función personalizada para renderizar opciones normales de servicios laborales
  const renderNormalOption = (props: any, option: any) => (
    <Box
      {...props}
      key={option?._id || option?.id}
      sx={{
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      <Typography variant="subtitle1">
        {option?.service}
      </Typography>
    </Box>
  );

  // Hook reutilizable para la opción agregar (DEBE estar DESPUÉS de la declaración de laborsServices)
  const { enhancedOptions, getOptionLabel: hookGetOptionLabel, renderOption } = useAutocompleteAddOption(
    laborsServices,
    {
      onClick: () => dispatch(uiOpenModal(DisplayModals.LaborsServicesForm))
    },
    renderNormalOption
  );

  // getOptionLabel personalizado para servicios laborales
  const getOptionLabel = (option: any) => {
    if (typeof option === "string") {
      return option;
    }
    if (option.inputValue) {
      return option.inputValue;
    }
    // Si es la opción agregar, no mostrar nada en el campo de texto
    if (option.isAddOption) {
      return '';
    }
    return option?.service || '';
  };

  useEffect(() => {
    getLaborsServices();
  }, []);

  // Sync internal state when parent value changes
  useEffect(() => {
    setValue(value || null);
  }, [value]);

  useEffect(() => {
    if (onChange) {
      onChange(_value);
    }
    // También actualizar el selectedServiceId si se proporciona la función
    if (onServiceIdChange && _value) {
      onServiceIdChange(_value._id || '');
    }
  }, [_value, onChange, onServiceIdChange]);

  const handleLaborsServiceCreated = (newLaborsService: LaborsServices) => {
    setValue(newLaborsService as LaborsServicesOptionType);
    getLaborsServices(); // Refresh the list
  };

  return (
    <>
      <Autocomplete
        value={_value}
        onChange={(event, newValue) => {
          if (typeof newValue === "string") {
            setValue({
              service: newValue,
            } as LaborsServicesOptionType);
          } else if (newValue && newValue.inputValue) {
            // Create a new value from the user input
            setValue({
              service: newValue.inputValue,
            } as LaborsServicesOptionType);
          } else {
            setValue(newValue as LaborsServicesOptionType);
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options as FilmOptionType[], params);
          const { inputValue } = params;
          // Suggest the creation of a new value
          const isExisting = options.some((option: any) => inputValue === option.service);
          if (inputValue !== "" && !isExisting) {
            filtered.push({
              inputValue,
              name: `Add "${inputValue}"`,
            } as FilmOptionType);
          }
          return filtered as any;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        id="autocomplete-labors-services"
        options={enhancedOptions}
        getOptionLabel={getOptionLabel}
        renderOption={renderOption}
        sx={{ width: width }}
        freeSolo
        renderInput={(params) => (
          <TextField {...params} label={label || t('service')} />
        )}
      />

      {/* ViewComponentModal para agregar nuevo servicio */}
      <ViewComponentModal
        title={`${t("_quick_add")}`}
        disableBackdropClick={false}
        disableEscapeKeyDown={false}
        modalType={DisplayModals.LaborsServicesForm}
      >
        <LaborsServicesFormModal 
          onLaborsServiceCreated={(newService) => {
            // Cuando se crea un nuevo servicio, actualizamos la lista y lo seleccionamos
            console.log('Nuevo servicio creado:', newService);
            setValue(newService);
            onChange(newService);
            // Recargar la lista de servicios
            getLaborsServices();
          }}
        />
      </ViewComponentModal>
    </>
  );
};