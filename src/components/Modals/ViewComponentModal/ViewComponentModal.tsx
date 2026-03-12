import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { uiCloseModal } from '../../../redux/ui';
import { DisplayModals } from '../../../types';

interface ViewComponentModalProps {
  children: React.ReactNode;
  title?: string;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  modalType?: DisplayModals;
}

export const ViewComponentModal: React.FC<ViewComponentModalProps> = ({
  children,
  title = 'Vista de Componente',
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  modalType = DisplayModals.ViewComponent,
}) => {
  const dispatch = useAppDispatch();
  const { showModal } = useAppSelector((state) => state.ui);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const isOpen = showModal === modalType;

  const handleClose = () => {
    dispatch(uiCloseModal());
  };

  // A4 dimensions in pixels (at 72 DPI)
  const A4_WIDTH = 595;
  const A4_HEIGHT = 842;

  // Calculate responsive dimensions
  const getModalDimensions = () => {
    if (isExtraSmallScreen) {
      // Mobile: Full screen with margins
      return {
        width: '95vw',
        height: '90vh',
        maxWidth: 'none',
        maxHeight: 'none',
      };
    } else if (isSmallScreen) {
      // Tablet: Maintain aspect ratio but scale down
      const scale = 0.8;
      return {
        width: A4_WIDTH * scale,
        height: A4_HEIGHT * scale,
        maxWidth: '90vw',
        maxHeight: '85vh',
      };
    } else {
      // Desktop: Full A4 size with viewport constraints
      return {
        width: A4_WIDTH,
        height: A4_HEIGHT,
        maxWidth: '85vw',
        maxHeight: '90vh',
      };
    }
  };

  const modalDimensions = getModalDimensions();

  return (
    <Dialog
      open={isOpen}
      onClose={disableBackdropClick ? undefined : handleClose}
      disableEscapeKeyDown={disableEscapeKeyDown}
      maxWidth={false}
      fullWidth={false}
      PaperProps={{
        sx: {
          ...modalDimensions,
          margin: isExtraSmallScreen ? '16px' : '32px',
          borderRadius: '12px',
          boxShadow: theme.shadows[24],
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
      aria-labelledby="view-component-modal-title"
      aria-describedby="view-component-modal-description"
    >
      <DialogTitle
        id="view-component-modal-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: theme.spacing(2, 3),
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
          minHeight: '64px',
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontSize: isExtraSmallScreen ? '1.1rem' : '1.25rem',
          }}
        >
          {title}
        </Typography>
        <IconButton
          aria-label="cerrar modal"
          onClick={handleClose}
          sx={{
            color: theme.palette.grey[500],
            padding: '8px',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.text.primary,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent
        id="view-component-modal-description"
        sx={{
          flex: 1,
          padding: 0,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.grey[100],
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.grey[400],
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: theme.palette.grey[600],
            },
          },
        }}
      >
        <Box
          sx={{
            padding: theme.spacing(3),
            flex: 1,
            minHeight: 0, // Important for proper scrolling
          }}
        >
          {children}
        </Box>
      </DialogContent>
    </Dialog>
  );
};


