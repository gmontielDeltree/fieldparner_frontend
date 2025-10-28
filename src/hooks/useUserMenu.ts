import { useState, useCallback } from 'react';

interface UseUserMenuReturn {
  profileDrawerOpen: boolean;
  settingsDrawerOpen: boolean;
  logoutDialogOpen: boolean;
  openProfileDrawer: () => void;
  closeProfileDrawer: () => void;
  openSettingsDrawer: () => void;
  closeSettingsDrawer: () => void;
  openLogoutDialog: () => void;
  closeLogoutDialog: () => void;
}

export const useUserMenu = (): UseUserMenuReturn => {
  const [profileDrawerOpen, setProfileDrawerOpen] = useState<boolean>(false);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState<boolean>(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState<boolean>(false);

  const openProfileDrawer = useCallback(() => setProfileDrawerOpen(true), []);
  const closeProfileDrawer = useCallback(() => setProfileDrawerOpen(false), []);
  
  const openSettingsDrawer = useCallback(() => setSettingsDrawerOpen(true), []);
  const closeSettingsDrawer = useCallback(() => setSettingsDrawerOpen(false), []);
  
  const openLogoutDialog = useCallback(() => setLogoutDialogOpen(true), []);
  const closeLogoutDialog = useCallback(() => setLogoutDialogOpen(false), []);

  return {
    profileDrawerOpen,
    settingsDrawerOpen,
    logoutDialogOpen,
    openProfileDrawer,
    closeProfileDrawer,
    openSettingsDrawer,
    closeSettingsDrawer,
    openLogoutDialog,
    closeLogoutDialog
  };
};