import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button
} from '@mui/material';

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const LogoutDialog: React.FC<LogoutDialogProps> = ({
  open,
  onClose,
  onConfirm
}) => {
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleConfirm = async (): Promise<void> => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Cerrar sesión</DialogTitle>
      <DialogContent>
        <Typography>
          ¿Está seguro que desea cerrar sesión?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="error"
          disabled={loading}
        >
          {loading ? 'Cerrando...' : 'Cerrar sesión'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutDialog;