import React, { useState, ChangeEvent, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  LinearProgress,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

import { usePasswordValidation } from '../../hooks/usePasswordValidation';
import ValidationItem from './ValidationItem';
import { PasswordData } from '../../types';
import { useTranslation } from 'react-i18next';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  onChangePassword: (data: PasswordData) => Promise<void>;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  open,
  onClose,
  onChangePassword
}) => {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [disabled, setDisabled] = useState(false);

  const { validation, validate, getStrength, getStrengthColor } = usePasswordValidation();
  const { t } = useTranslation();

  const handlePasswordChange = (field: keyof PasswordData) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      const newValue = event.target.value;
      const newPasswordData = { ...passwordData, [field]: newValue };
      setPasswordData(newPasswordData);

      if (field === 'newPassword' || field === 'confirmPassword') {
        validate(
          field === 'newPassword' ? newValue : newPasswordData.newPassword,
          field === 'confirmPassword' ? newValue : newPasswordData.confirmPassword
        );
      }
    };

  const handleSubmit = async (): Promise<void> => {
    if (!isValid()) return;

    setLoading(true);
    try {
      await onChangePassword(passwordData);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      onClose();
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const isValid = React.useCallback((): boolean => {
    return Boolean(
      passwordData.currentPassword &&
      passwordData.newPassword &&
      passwordData.confirmPassword &&
      validate(passwordData.newPassword, passwordData.confirmPassword)
    );

  }, [passwordData]);

  useEffect(() => {
    if (passwordData.currentPassword &&
      passwordData.newPassword &&
      passwordData.confirmPassword) {
      console.log("valido", validate(passwordData.newPassword, passwordData.confirmPassword))
      setDisabled(!validate(passwordData.newPassword, passwordData.confirmPassword));
    }

  }, [passwordData])


  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">{t("_configuration")}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          {t("change_password")}
        </Typography>

        <TextField
          fullWidth
          type="password"
          label="Contraseña actual"
          value={passwordData.currentPassword}
          onChange={handlePasswordChange('currentPassword')}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          type="password"
          label="Nueva contraseña"
          value={passwordData.newPassword}
          onChange={handlePasswordChange('newPassword')}
          sx={{ mb: 1 }}
        />

        {passwordData.newPassword && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Fortaleza:
              </Typography>
              <LinearProgress
                variant="determinate"
                value={getStrength()}
                sx={{ flexGrow: 1, height: 6, borderRadius: 1 }}
                color={getStrengthColor()}
              />
            </Box>
            <Box sx={{ mt: 1 }}>
              <ValidationItem valid={validation.hasMinLength} text="Mínimo 8 caracteres" />
              <ValidationItem valid={validation.hasUppercase} text="Una letra mayúscula" />
              <ValidationItem valid={validation.hasDigit} text="Un dígito" />
              <ValidationItem valid={validation.hasSpecialChar} text="Un carácter especial" />
            </Box>
          </Box>
        )}

        <TextField
          fullWidth
          type="password"
          label="Confirmar nueva contraseña"
          value={passwordData.confirmPassword}
          onChange={handlePasswordChange('confirmPassword')}
          error={passwordData.confirmPassword !== '' && !validation.passwordsMatch}
          helperText={
            passwordData.confirmPassword !== '' && !validation.passwordsMatch
              ? 'Las contraseñas no coinciden'
              : ''
          }
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={disabled || loading}
        >
          {loading ? 'Cambiando...' : 'Cambiar contraseña'}
        </Button>
      </Box>
    </Drawer>
  );
};

export default SettingsDrawer;