import React from 'react';
import {
  Box,
  Divider,
  ListItem,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

interface AutocompleteAddOptionProps {
  /** Props que vienen del renderOption del Autocomplete */
  props: any;
  /** Texto principal del botón */
  title?: string;
  /** Texto descriptivo debajo del título */
  description?: string;
  /** Color principal del botón (por defecto: #1976d2) */
  primaryColor?: string;
  /** Color de hover (por defecto: #1565c0) */
  hoverColor?: string;
  /** Color de fondo (por defecto: #f8f9fa) */
  backgroundColor?: string;
  /** Color de fondo en hover (por defecto: #e3f2fd) */
  hoverBackgroundColor?: string;
  /** Icono personalizado (por defecto: AddIcon) */
  icon?: React.ReactNode;
  /** Función callback cuando se hace clic */
  onClick?: () => void;
  /** Mostrar separador visual arriba */
  showDivider?: boolean;
  /** ID único para la opción */
  optionId?: string;
}

export const AutocompleteAddOption: React.FC<AutocompleteAddOptionProps> = ({
  props,
  title,
  primaryColor = '#1976d2',
  hoverColor = '#1565c0',
  backgroundColor = '#f8f9fa',
  hoverBackgroundColor = '#e3f2fd',
  icon = <AddIcon fontSize="small" />,
  onClick,
  showDivider = true,
  optionId = 'add-new-option',
}) => {
  const { t } = useTranslation();
  const finalTitle = title || t("_add");
  
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <React.Fragment key={optionId}>
      {/* Separador visual antes de la opción Agregar */}
      {showDivider && (
        <Divider 
          sx={{ 
            my: 1, 
            borderColor: '#e0e0e0', 
            borderWidth: 1 
          }} 
        />
      )}
      
      <ListItem
        {...props}
        onClick={handleClick}
        sx={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: backgroundColor,
          borderTop: `2px solid ${hoverBackgroundColor}`,
          color: primaryColor,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          opacity: 1, // ← Asegurar opacidad completa por defecto
          '&:hover': {
            backgroundColor: hoverBackgroundColor,
            color: hoverColor,
            transform: 'translateY(-1px)',
            boxShadow: `0 2px 8px ${primaryColor}26`,
            opacity: 1, // ← Forzar opacidad completa en hover
          },
          '&:focus': {
            backgroundColor: hoverBackgroundColor,
            color: hoverColor,
            outline: `2px solid ${primaryColor}`,
            outlineOffset: '-2px',
            opacity: 1, // ← Forzar opacidad completa en focus
          },
          '&.Mui-focused': {
            backgroundColor: hoverBackgroundColor,
            opacity: 1, // ← Opacidad para el estado focused de MUI
          },
          '&.Mui-focusVisible': {
            backgroundColor: hoverBackgroundColor,
            opacity: 1, // ← Opacidad para el estado focusVisible de MUI
          },
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          py: 1.5,
          px: 2,
          borderRadius: 0,
          minHeight: '56px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: primaryColor,
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
          }}
        >
          {icon}
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: 'inherit',
              fontSize: '1.1rem',
            }}
          >
            {finalTitle}
          </Typography>
        </Box>
      </ListItem>
    </React.Fragment>
  );
};