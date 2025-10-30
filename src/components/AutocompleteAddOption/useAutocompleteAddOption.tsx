import { Box, Typography } from "@mui/material";
import { AutocompleteAddOption } from "./AutocompleteAddOption";
import React from "react";
import { useTranslation } from "react-i18next";

export const useAutocompleteAddOption = (
  options: any[], 
  addOptionConfig: {
    id?: string;
    name?: string;
    title?: string;
    description?: string;
    onClick?: () => void;
  },
  customRenderNormal?: (props: any, option: any) => React.ReactNode
) => {
  const { t } = useTranslation();
  
  const {
    id = 'add-new-option',
    name = t("_add"),
    title,
    description,
    onClick
  } = addOptionConfig;

  // Agregar la opción especial al final de las opciones
  const enhancedOptions = React.useMemo(() => {
    return [
      ...options,
      {
        _id: id,
        name: name,
        isAddOption: true,
        addTitle: title,
        addDescription: description,
        addOnClick: onClick,
      }
    ];
  }, [options, id, name, title, description, onClick]);

  // Función para usar en getOptionLabel
  const getOptionLabel = (option: any) => {
    if (typeof option === "string") {
      return option;
    }
    if (option.inputValue) {
      return option.inputValue;
    }
    // No mostrar la opción "Agregar" en el campo de texto
    if (option.isAddOption) {
      return '';
    }
    return option?.name || '';
  };

  // Función para usar en renderOption
  const renderOption = (props: any, option: any) => {
    if (option.isAddOption) {
      return (
        <AutocompleteAddOption
          key={option._id}
          props={props}
          title={option.addTitle || option.name}
          description={option.addDescription}
          onClick={option.addOnClick}
          optionId={option._id}
        />
      );
    }

    // Renderizar opción normal (personalizable)
    if (customRenderNormal) {
      return customRenderNormal(props, option);
    }

    // Renderizar opción normal por defecto
    return (
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
          {option?.name || option?.label}
        </Typography>
      </Box>
    );
  };

  return {
    enhancedOptions,
    getOptionLabel,
    renderOption,
  };
};