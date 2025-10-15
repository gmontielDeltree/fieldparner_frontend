import React from 'react';
import UserMenu from './UserMenu';
import ProfileDrawer from './ProfileDrawer';
import SettingsDrawer from './SettingsDrawer';
import LogoutDialog from './LogoutDialog';
import { useUser, useUserMenu } from '../../hooks';
// import { userService } from '@/services/userService';
import { User, ProfileFormData, PasswordData } from '../../types';
import { uploadFile } from '../../helpers/fileUpload';
import { useTranslation } from 'react-i18next';
import { Loading } from '../Loading';
import NotificationService from '../../services/notificationService';

interface UserMenuContainerProps {
  user: User;
  onUserUpdate: (user: User) => void;
  onLogout: () => void;
}

const UserMenuContainer: React.FC<UserMenuContainerProps> = ({
  user,
  onLogout
}) => {
  // const { enqueueSnackbar } = useSnackbar();
  const { i18n, t } = useTranslation()
  const {
    profileDrawerOpen,
    settingsDrawerOpen,
    logoutDialogOpen,
    openProfileDrawer,
    closeProfileDrawer,
    openSettingsDrawer,
    closeSettingsDrawer,
    openLogoutDialog,
    closeLogoutDialog
  } = useUserMenu();

  const { isLoading, updateUser, changePassword } = useUser();

  const handleLanguageChange = (newLanguage: string) => {
    i18n.changeLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }


  const handleSaveProfile = async (data: ProfileFormData): Promise<void> => {
    try {
      if (data.avatar) await uploadFile(data.avatar);
      await updateUser({
        username: data.userName,
        language: data.language,
        photoName: data.avatar?.name
      });
      handleLanguageChange(data.language);

    } catch (error) {
      console.error('Error updating profile:', error);
      NotificationService.showError("Error al actualizar el perfil", {}, t("error_label"));
    }
  };

  const handleChangePassword = async (data: PasswordData): Promise<void> => {
    try {
      
      await changePassword(data.currentPassword, data.newPassword);
      NotificationService.showSuccess("Contraseña cambiada con éxito", {}, t("success_label"));
    } catch (error) {
      // enqueueSnackbar('Error al cambiar la contraseña', { variant: 'error' });
      NotificationService.showError("Error al cambiar la contraseña", {}, t("error_label"));
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      //   await userService.logout();
      onLogout();
    } catch (error) {
      // enqueueSnackbar('Error al cerrar sesión', { variant: 'error' });
      throw error;
    }
  };

  return (
    <>
      <Loading key="loading-user" loading={isLoading} />
      <UserMenu
        user={user}
        onProfileClick={openProfileDrawer}
        onSettingsClick={openSettingsDrawer}
        onLogoutClick={openLogoutDialog}
      />

      <ProfileDrawer
        open={profileDrawerOpen}
        onClose={closeProfileDrawer}
        user={user}
        onSave={handleSaveProfile}
      />

      <SettingsDrawer
        open={settingsDrawerOpen}
        onClose={closeSettingsDrawer}
        onChangePassword={handleChangePassword}
      />

      <LogoutDialog
        open={logoutDialogOpen}
        onClose={closeLogoutDialog}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default UserMenuContainer;