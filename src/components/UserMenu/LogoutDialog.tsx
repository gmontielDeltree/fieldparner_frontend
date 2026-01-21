import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
      <DialogTitle>{t('title_close_session')}</DialogTitle>
      <DialogContent>
        <Typography>
          {t('confirm_close_session')}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? t("closing") : t("title_close_session")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutDialog;