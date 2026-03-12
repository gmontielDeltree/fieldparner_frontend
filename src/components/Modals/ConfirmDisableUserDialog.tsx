import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from 'react-i18next';

interface ConfirmDisableUserDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username?: string;
}

const ConfirmDisableUserDialog: React.FC<ConfirmDisableUserDialogProps> = ({
  open,
  onClose,
  onConfirm,
  username = '',
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningAmberIcon color="warning" />
          {t('disable_user_title', '¿Deshabilitar Usuario?')}
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t(
            'disable_user_message',
            `Esta acción deshabilitará al usuario "${username}". El usuario no podrá acceder al sistema hasta que sea habilitado nuevamente.`
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t('cancel', 'Cancelar')}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          {t('disable', 'Deshabilitar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDisableUserDialog;
