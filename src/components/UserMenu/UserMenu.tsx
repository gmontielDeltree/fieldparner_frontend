import React, { useState, MouseEvent } from 'react';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { User } from '../../types';
import { urlImg } from '../../config';
import { useTranslation } from 'react-i18next';


interface UserMenuProps {
  user: User;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onProfileClick,
  onSettingsClick,
  onLogoutClick
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const urlPhotoName = `${urlImg}${user?.photoName}`;
  const {t} = useTranslation();

  const getInitials = (name: string): string => {
    if (!name || name.length === 0) return "U";
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleMenuOpen = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
  };

  const handleProfileClick = (): void => {
    onProfileClick();
    handleMenuClose();
  };

  const handleSettingsClick = (): void => {
    onSettingsClick();
    handleMenuClose();
  };

  const handleLogoutClick = (): void => {
    onLogoutClick();
    handleMenuClose();
  };

  return (
    <>
      <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
        <Avatar
          src={user.photoName ? urlPhotoName : undefined}
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'secondary.main',
            cursor: 'pointer',
            border: '2px solid',
            borderColor: 'background.paper'
          }}
        >
          {!user.photoName && getInitials(user?.username || 'User')}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5
            }
          }
        }}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("user_profile")}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("_configuration")}</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogoutClick}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>
            <Typography color="error">Cerrar sesión</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;