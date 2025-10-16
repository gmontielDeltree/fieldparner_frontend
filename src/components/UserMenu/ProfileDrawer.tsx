import React, { useState, ChangeEvent } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  SelectChangeEvent
} from '@mui/material';
import {
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { User, ProfileFormData } from '../../types';
import spanishFlagIcon from '../../images/icons/spain_flag.png'
import englishFlagIcon from '../../images/icons/usa_flag.png'
import brazilFlagIcon from '../../images/icons/brazil_flag.png'
import { urlImg } from '../../config';
import { useTranslation } from 'react-i18next';
import { Loading } from '../Loading';



interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onSave: (data: ProfileFormData) => Promise<void>;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  open,
  onClose,
  user,
  onSave
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ProfileFormData>({
    userName: user.username,
    language: user.language as 'es' | 'en' | 'pt',
    avatar: null,
    photoName: user.photoName
  });
  const [urlFile, setUrlFile] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const urlPhotoName = `${urlImg}${user.photoName}`;

  const getInitials = (name: string): string => {
    if (!name || name.length === 0) return "U";
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setFormData(prev => ({ ...prev, userName: event.target.value }));
  };

  const handleLanguageChange = (event: SelectChangeEvent<string>): void => {
    setFormData(prev => ({
      ...prev,
      language: event.target.value as 'es' | 'en' | 'pt'
    }));
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file, photoName: file.name }));
      setUrlFile(URL.createObjectURL(file));
    }
  };

  const handleClose = () => {
    setUrlFile("");
    setFormData(prev => ({ ...prev, avatar: null }));
    onClose();
  }

  const handleSave = async (): Promise<void> => {
    setLoading(true);
    try {

      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Loading key="loading-user" loading={loading} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">{t("user_profile")}</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={urlFile || urlPhotoName || undefined}
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'secondary.main',
              fontSize: '2rem',
              mb: 2
            }}
          >
            {!user.photoName && getInitials(formData?.userName || "")}
          </Avatar>
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCameraIcon />}
            size="small"
          >
            {t("change_photo")}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </Button>
        </Box>

        <TextField
          fullWidth
          label="Nombre"
          value={formData.userName}
          onChange={handleNameChange}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Email"
          value={user.email}
          disabled
          sx={{ mb: 3 }}
        />

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Idioma</InputLabel>
          <Select
            value={formData.language}
            label="Idioma"
            onChange={handleLanguageChange}
          >
            <MenuItem value="es">Español
              <img
                src={spanishFlagIcon}
                alt="Spanish"
                style={{ width: '24px', height: '24px', marginLeft: '8px' }}
              /></MenuItem>
            <MenuItem value="en">English
              <img
                src={englishFlagIcon}
                alt="English"
                style={{ width: '24px', height: '24px', marginLeft: '8px' }}
              /></MenuItem>
            <MenuItem value="pt">Português
              <img
                src={brazilFlagIcon}
                alt="Português"
                style={{ width: '24px', height: '24px', marginLeft: '8px' }}
              /></MenuItem>
          </Select>
        </FormControl>

        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? t("loading") : t("save_changes")}
        </Button>
      </Box>
    </Drawer>
  );
};

export default ProfileDrawer;