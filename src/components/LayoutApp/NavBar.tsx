import React, { useState } from 'react'
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
  Box,
  Dialog,
  DialogContent,
} from '@mui/material'
import { styled, keyframes } from '@mui/system'
import { useTranslation } from 'react-i18next'
import { RootState } from '../../redux/store'
import iconoCampo from '../../images/icons/iconodecampo2D.png'
import integrationsIcon from '../../images/icons/integrations.png'
import logoImage from '/assets/images/logos/agrootolss_logo_sol.png'

import {
  Notifications,
  NotificationsActive,
  MenuOutlined,
  CalendarMonth,
} from '@mui/icons-material'
import { NavBarProps } from '../../types'
import CompanyNavBar from '../CompanyNavBar'
import CampaignMenu from './components/CampaignMenu'
import { NotificationPopover } from '../Notifications'
import { ActivitiesCalendar } from '../ActivitiesCalendar'
import UserMenuContainer from '../UserMenu/UserMenuContainer'

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

  const { startLogout } = useAuthStore()
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const isNotificationPopoverOpen = Boolean(notificationAnchorEl)
  const [calendarOpen, setCalendarOpen] = useState(false)


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
    <>
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

              {/* Calendar Button */}
              <Tooltip
                title="Calendario de Actividades"
                enterDelay={500}
                leaveDelay={200}
              >
                <IconButton
                  onClick={() => setCalendarOpen(true)}
                  sx={{
                    marginRight: '18px',
                    width: 40,
                    height: 40,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    color: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    border: '2px solid rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      backgroundColor: 'rgba(25, 118, 210, 0.2)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                      border: '2px solid rgba(25, 118, 210, 0.5)',
                    },
                  }}
                >
                  <CalendarMonth sx={{ fontSize: 24 }} />
                </IconButton>
              </Tooltip>

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

              {
                user && (<UserMenuContainer
                  user={user}
                  onUserUpdate={() => { }}
                  onLogout={handleLogout}
                />)
              }

            </Grid>
          </Grid>
        </Toolbar>
      </GlassAppBar>

      {/* Activities Calendar Dialog */}
      <Dialog
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            borderRadius: 2,
            overflow: 'hidden',
          },
        }}
      >
        <DialogContent sx={{ p: 0, height: '100%' }}>
          <ActivitiesCalendar onClose={() => setCalendarOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
