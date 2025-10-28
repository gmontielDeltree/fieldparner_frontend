import React from 'react';
import UserMenu from './UserMenu';
import ProfileDrawer from './ProfileDrawer';
import SettingsDrawer from './SettingsDrawer';
import LogoutDialog from './LogoutDialog';
import { useAuthStore, useUser, useUserMenu } from '../../hooks';
// import { userService } from '@/services/userService';
import { User, ProfileFormData, PasswordData, UpdateUserDTO } from '../../types';
import { uploadFile } from '../../helpers/fileUpload';
import { useTranslation } from 'react-i18next';
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

  const { checkAuthToken } = useAuthStore();
  const { updateUser, changePassword } = useUser();

  const handleLanguageChange = (newLanguage: string) => {
    i18n.changeLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  const reloadUserSession = (updateData: UpdateUserDTO) => {
    if (user) {
      const updatedUser = { ...user, ...updateData };
      console.log('updatedUser', updatedUser)
      localStorage.setItem('user_session', JSON.stringify(updatedUser));
    }
    checkAuthToken();
  }

  const handleSaveProfile = async (data: ProfileFormData): Promise<void> => {
    try {
      const updateDataUser = {
        username: data.userName,
        language: data.language,
        photoName: data.avatar?.name ?? user.photoName
      };
      //Si existe el archivo de foto, validar que sea diferente a la actual y subirla
      if (data.avatar && data?.photoName !== user?.photoName) await uploadFile(data.avatar);

      await updateUser(updateDataUser);
      handleLanguageChange(data.language);
      reloadUserSession(updateDataUser);
      NotificationService.showSuccess("Perfil actualizado con éxito", {}, t("success_label"));

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