import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { showFieldList, hideFieldList } from '../../redux/fieldsList'
import { useAppSelector, useAuthStore } from '../../hooks'
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
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { RootState } from '../../redux/store'
import iconoCampo from '../../images/icons/iconodecampo2D.webp'
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

export const NavBar: React.FC<NavBarProps> = ({
  drawerWidth = 240,
  open,
  handleSideBarOpen,
}) => {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const [hasNotifications, setHasNotifications] = useState(true)
  const [notificationCount, setNotificationCount] = useState(3)
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

  useEffect(() => {
    i18n.changeLanguage(localStorage.getItem('language') || 'es')
  }, [])

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

  const handleNotificationClick = () => {
    setHasNotifications(!hasNotifications)
    setNotificationCount(hasNotifications ? 0 : 3)
  }

  const pulseAnimation = {
    animation: 'pulse 2s infinite',
    '@keyframes pulse': {
      '0%': {
        boxShadow: '0 0 0 0 rgba(0, 123, 255, 0.7)',
      },
      '70%': {
        boxShadow: '0 0 0 10px rgba(0, 123, 255, 0)',
      },
      '100%': {
        boxShadow: '0 0 0 0 rgba(0, 123, 255, 0)',
      },
    },
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

  const avatarStyle = () => ({
    width: 30,
    height: 30,
    transition:
      'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
    transform: isVisible ? 'scale(1.2)' : 'scale(1)',
    boxShadow: isVisible ? '0 3px 10px 0 rgba(0,0,0,0.2)' : 'none',
    border: '2px solid',
    borderColor: isVisible ? '#1976d2' : 'transparent',
    borderRadius: '50%',
    backgroundColor: isVisible ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
  })

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: 'white',
        color: 'black',
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
          sx={{ mr: 2, ...(open && { display: 'none' }) }}
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
            {/* Logo and FieldPartner Text */}
            <Avatar
              alt="Logo"
              src={logoImage}
              sx={{ width: 30, height: 30, marginRight: 2 }}
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
                marginRight: '40px',
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
                color={hasNotifications ? 'secondary' : 'default'}
                onClick={handleNotificationClick}
                sx={{
                  ml: 2,
                  ...(hasNotifications ? pulseAnimation : {}),
                }}
              >
                <Badge badgeContent={notificationCount} color="error">
                  {hasNotifications ? (
                    <NotificationsActive />
                  ) : (
                    <Notifications />
                  )}
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Include CampaignMenu component here */}
            <CampaignMenu />
          </Grid>
          <Grid item sm={4}>
            <CompanyNavBar key="combobox-companies" />
          </Grid>
          <Grid item className="d-flex align-items-center">
            <Typography variant="h6" display="inline-block">
              {user?.username}
            </Typography>

            <IconButton
              color="inherit"
              aria-label="change-language"
              onClick={handleLanguageMenu}
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
            >
              <ExitToApp />
            </IconButton>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  )
}
