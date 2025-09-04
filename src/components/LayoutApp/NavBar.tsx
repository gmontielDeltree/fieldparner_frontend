import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { showFieldList, hideFieldList } from '../../redux/fieldsList'
import { useAppSelector, useAuthStore } from '../../hooks'
import { useNotifications } from '../../contexts/NotificationContext'
import { useNavigate } from 'react-router-dom'
import {
  Badge,
  Tooltip,
  AppBar,
  Grid,
  IconButton,
  Toolbar,
  Typography,
  Avatar,
  ButtonBase,
  Menu,
  MenuItem,
  Box,
} from '@mui/material'
import { styled, keyframes } from '@mui/system'
import { useTranslation } from 'react-i18next'
import { RootState } from '../../redux/store'
import iconoCampo from '../../images/icons/iconodecampo2D.png'
import integrationsIcon from '../../images/icons/integrations.png'
import logoImage from '/assets/images/logos/agrootolss_logo_sol.png'
import spanishFlagIcon from '../../images/icons/spain_flag.png'
import englishFlagIcon from '../../images/icons/usa_flag.png'
import brazilFlagIcon from '../../images/icons/brazil_flag.png'

import {
  Notifications,
  NotificationsActive,
  MenuOutlined,
  ExitToApp,
} from '@mui/icons-material'
import { NavBarProps } from '../../types'
import CompanyNavBar from '../CompanyNavBar'
import CampaignMenu from './components/CampaignMenu'
import { NotificationPopover } from '../Notifications'

// Animación para el fondo "parpadeante" o con un sutil cambio de color
const backgroundPulse = keyframes({
  '0%': {
    backgroundPosition: '0% 50%',
  },
  '50%': {
    backgroundPosition: '100% 50%',
  },
  '100%': {
    backgroundPosition: '0% 50%',
  },
})

const GlassAppBar = styled(AppBar)(({ theme }) => ({
  // Efecto "glass" sutil + gradient con animación
  background:
    'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%)',
  backdropFilter: 'blur(6px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  color: theme.palette.text.primary,
  animation: `${backgroundPulse} 10s ease infinite`,
  transition: 'all 0.3s ease-in-out',
}))

// Animación de latido ("pulse") para notificaciones
const pulseAnimation = {
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.5)',
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)',
    },
  },
}

export const NavBar: React.FC<NavBarProps> = ({
  drawerWidth = 240,
  open,
  handleSideBarOpen,
}) => {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const { unreadCount, isConnected } = useNotifications()
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<HTMLElement | null>(null)
  const [language, setLanguage] = useState(
    localStorage.getItem('language') || 'es',
  )
  const { startLogout } = useAuthStore()
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()
  const [languageAnchorEl, setLanguageAnchorEl] = useState<null | HTMLElement>(
    null,
  )
  const isLanguageMenuOpen = Boolean(languageAnchorEl)
  const isNotificationPopoverOpen = Boolean(notificationAnchorEl)

  useEffect(() => {
    i18n.changeLanguage(localStorage.getItem('language') || 'es')
  }, [i18n])

  const handleLanguageMenu = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchorEl(event.currentTarget)
  }

  const handleLanguageChange = (newLanguage: string) => {
    i18n.changeLanguage(newLanguage)
    setLanguage(newLanguage)
    setLanguageAnchorEl(null)
    localStorage.setItem('language', newLanguage)
  }

  const handleLanguageMenuClose = () => {
    setLanguageAnchorEl(null)
  }

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget)
  }

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null)
  }

  const handleLogout = () => {
    startLogout()
  }

  const isVisible = useSelector((state: RootState) => state.fieldList.isVisible)
  const selectAvatar = () => {
    if (isVisible) {
      dispatch(hideFieldList())
    } else {
      dispatch(showFieldList())
    }
  }

  // Avatar con microtransiciones
  const avatarStyle = () => ({
    width: 34,
    height: 34,
    transition:
      'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
    transform: isVisible ? 'scale(1.2)' : 'scale(1)',
    boxShadow: isVisible ? '0 3px 10px 0 rgba(0,0,0,0.2)' : 'none',
    border: '2px solid',
    borderColor: isVisible ? '#1976d2' : 'transparent',
    borderRadius: '50%',
    backgroundColor: isVisible ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
    '&:hover': {
      transform: 'scale(1.25)',
      boxShadow: '0 3px 10px 0 rgba(0,0,0,0.2)',
    },
  })

  return (
    <GlassAppBar
      position="fixed"
      sx={{
        ...(open && {
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }),
      }}
    >
      <Toolbar>
        <IconButton
          color="default"
          edge="start"
          onClick={handleSideBarOpen}
          sx={{
            mr: 2,
            transition: 'transform 0.3s ease',
            ...(open && { display: 'none' }),
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }}
        >
          <MenuOutlined />
        </IconButton>

        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          wrap="nowrap"
        >
          <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Logo y FieldPartner */}
            <Avatar
              alt="Logo"
              src={logoImage}
              sx={{ width: 40, height: 40, mr: 1 }}
            />
            <Typography
              onClick={() => navigate('/init/overview/fields')}
              variant="h6"
              noWrap
              component="div"
              sx={{
                color: 'black',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                marginRight: '32px',
                '&:hover': {
                  color: '#1976d2',
                  transition: 'color 0.3s',
                },
              }}
            >
              FieldPartner
            </Typography>

            <ButtonBase
              onClick={selectAvatar}
              sx={{ borderRadius: '50%', marginRight: '18px' }}
              title="Campos"
            >
              <Avatar alt="Campo" src={iconoCampo} sx={avatarStyle()} />
            </ButtonBase>
            <ButtonBase
              onClick={() => navigate('/init/overview/fields/integrations')}
              sx={{ borderRadius: '50%', marginRight: '18px' }}
              title="Integraciones"
            >
              <Avatar
                alt="Integrations"
                src={integrationsIcon}
                sx={avatarStyle()}
              />
            </ButtonBase>

            <Tooltip
              title={t('notifications')}
              enterDelay={500}
              leaveDelay={200}
            >
              <IconButton
                color={unreadCount > 0 ? 'secondary' : 'default'}
                onClick={handleNotificationClick}
                sx={{
                  ml: 2,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                  ...(unreadCount > 0 ? pulseAnimation : {}),
                  position: 'relative',
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  {unreadCount > 0 ? (
                    <NotificationsActive />
                  ) : (
                    <Notifications />
                  )}
                </Badge>
                {/* Indicador de conexión */}
                {isConnected && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 20,
                      width: 8,
                      height: 8,
                      backgroundColor: 'success.main',
                      borderRadius: '50%',
                      zIndex: 1,
                    }}
                  />
                )}
              </IconButton>
            </Tooltip>

            {/* Popover de notificaciones */}
            <NotificationPopover
              anchorEl={notificationAnchorEl}
              open={isNotificationPopoverOpen}
              onClose={handleNotificationClose}
            />

            {/* CampaignMenu */}
            <CampaignMenu />
          </Grid>

          <Grid item sm={4}>
            <CompanyNavBar key="combobox-companies" />
          </Grid>

          <Grid item className="d-flex align-items-center">
            <Typography variant="h6" display="inline-block" sx={{ mr: 1 }}>
              {user?.username}
            </Typography>

            <IconButton
              color="inherit"
              aria-label="change-language"
              onClick={handleLanguageMenu}
              sx={{
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <img
                src={
                  language === 'es'
                    ? spanishFlagIcon
                    : language === 'en'
                      ? englishFlagIcon
                      : brazilFlagIcon
                }
                alt={language}
                style={{ width: '24px', height: '24px' }}
              />
            </IconButton>

            {/* Language Menu */}
            <Menu
              anchorEl={languageAnchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={isLanguageMenuOpen}
              onClose={handleLanguageMenuClose}
            >
              <MenuItem onClick={() => handleLanguageChange('es')}>
                <img
                  src={spanishFlagIcon}
                  alt="Spanish"
                  style={{ width: '24px', height: '24px' }}
                />
              </MenuItem>
              <MenuItem onClick={() => handleLanguageChange('en')}>
                <img
                  src={englishFlagIcon}
                  alt="English"
                  style={{ width: '24px', height: '24px' }}
                />
              </MenuItem>
              <MenuItem onClick={() => handleLanguageChange('pt')}>
                <img
                  src={brazilFlagIcon}
                  alt="Brazilian"
                  style={{ width: '24px', height: '24px' }}
                />
              </MenuItem>
            </Menu>

            <IconButton
              edge="end"
              color="inherit"
              aria-label="logout"
              onClick={handleLogout}
              sx={{
                ml: 1,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <ExitToApp />
            </IconButton>
          </Grid>
        </Grid>
      </Toolbar>
    </GlassAppBar>
  )
}
