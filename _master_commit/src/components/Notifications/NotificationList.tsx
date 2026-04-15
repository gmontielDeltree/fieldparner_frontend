import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  Paper,
  Box,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Close,
  DirectionsCar,
  Warning,
  Build,
  Notifications,
  CheckCircle,
  Agriculture,
  Event,
  ErrorOutline,
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';


//TODO: agregar traductor

const NotificationList: React.FC = () => {
  const { notifications, markAsRead, clearNotification, markAllAsRead } = useNotifications();
  const { t, i18n } = useTranslation();
  
  const getLocale = () => {
    switch (i18n.language) {
      case 'es': return es;
      case 'pt': return ptBR;
      default: return enUS;
    }
  };

  const getFormattedTime = (timestamp: Date | string) => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return 'Hace un momento';
      }

      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: getLocale()
      });
    } catch (error) {
      console.error('Error formatting time:', error, timestamp);
      return 'Hace un momento';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'vehicle_maintenance':
        return <Build color="warning" />;
      case 'vehicle_alert':
        return <Warning color="error" />;
      case 'activity_field_overdue':
        return <ErrorOutline color="error" />;
      case 'activity_field_due_soon':
        return <Event color="warning" />;
      case 'vehicle_update':
        return <DirectionsCar color="primary" />;
      default:
        return <Agriculture color="primary" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'vehicle_maintenance':
        return 'warning';
      case 'vehicle_alert':
        return 'error';
      case 'activity_field_overdue':
        return 'error';
      case 'activity_field_due_soon':
        return 'warning';
      default:
        return 'primary';
    }
  };

  if (notifications.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {t('no_notifications')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {t('notifications')} ({notifications.filter(n => !n.read).length})
        </Typography>
        {notifications.some(n => !n.read) && (
          <Tooltip title={t('mark_all_read')}>
            <IconButton size="small" onClick={markAllAsRead}>
              <CheckCircle fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Divider />
      <List dense>
        {notifications.map((notification, index) => (
          <React.Fragment key={`${notification.id}-${index}`}>
            <ListItem
              sx={{
                backgroundColor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': { backgroundColor: 'action.selected' }
              }}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: notification.read ? 'normal' : 'bold',
                        flex: 1
                      }}
                    >
                      {notification.message}
                    </Typography>
                    {!notification.read && (
                      <Chip 
                        size="small" 
                        label={t('new')} 
                        color={getNotificationColor(notification.type) as any}
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {'vehicle' in notification && notification.vehicle
                        ? notification.vehicle.patent
                        : 'activity' in notification && notification.activity
                        ? `${notification.activity.tipo} - ${notification.activity.campaña?.name || 'Sin campaña'}`
                        : "-"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      •
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getFormattedTime(notification.timestamp)}
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Tooltip title={t('dismiss')}>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
            {index < notifications.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default NotificationList;
