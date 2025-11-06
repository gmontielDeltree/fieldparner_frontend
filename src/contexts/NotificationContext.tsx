import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../hooks';
import { Vehicle } from '../types';
import { Actividad } from '../interfaces/activity';
import { getEnvVariables } from '../helpers/getEnvVariables';

interface VehicleNotification {
  id: string;
  type: 'vehicle_maintenance' | 'vehicle_alert' | 'vehicle_update';
  vehicle: Vehicle;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface ActivityFieldNotification {
  id: string;
  type: 'activity_field_due_soon' | 'activity_field_overdue';
  activity: Actividad;
  message: string;
  timestamp: Date;
  read: boolean;
}

type Notification = VehicleNotification | ActivityFieldNotification;

interface NotificationContextType {
  notifications: Notification[];
  vehicleNotifications: VehicleNotification[];
  activityFieldNotifications: ActivityFieldNotification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [_socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!user) return;
    
    // Configurar conexión de Socket.IO
    const newSocket = io(getEnvVariables().VITE_SOCKET_URL, {
      transports: ['websocket'],
      query: { token: token }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to notification server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from notification server');
    });

    // Escuchar notificaciones de vehículos
    newSocket.on('vehicle_notification', (newNotification: VehicleNotification) => {
      console.log('evento de notificación de vehículo', newNotification);
      
      setNotifications(prev => {
        // Verificar duplicados usando el estado más actualizado
        if (prev.some(n => n.id === newNotification.id)) {
          console.log('Notificación duplicada, omitiendo:', newNotification.id);
          return prev; // No agregar si ya existe
        }
        
        console.log("Agregando nueva notificación:", newNotification.id);
        return [  
          {
            ...newNotification,
            timestamp: new Date(newNotification.timestamp), // Asegurar conversión a Date
            read: false
          },
          ...prev
        ];
      });
    });

    // Escuchar cambios en la base de datos de vehículos
    newSocket.on('vehicle_changed', (data: { vehicle: Vehicle, changeType: 'created' | 'updated' | 'deleted' }) => {
      const { vehicle, changeType } = data;
      
      let message = '';
      let type: VehicleNotification['type'] = 'vehicle_update';
      
      switch (changeType) {
        case 'created':
          message = `Nuevo vehículo registrado: ${vehicle.patent}`;
          break;
        case 'updated':
          message = `Vehículo actualizado: ${vehicle.patent}`;
          break;
        case 'deleted':
          message = `Vehículo eliminado: ${vehicle.patent}`;
          break;
      }

      // Verificar si el vehículo necesita mantenimiento
    //   if (vehicle.maintenanceDate && new Date(vehicle.maintenanceDate) <= new Date()) {
    //     type = 'vehicle_maintenance';
    //     message = `¡Mantenimiento vencido para ${vehicle.patent}!`;
    //   }

      const notification: VehicleNotification = {
        id: `${Date.now()}-${vehicle._id}`,
        type,
        vehicle,
        message,
        timestamp: new Date(), // Crear nueva fecha válida
        read: false
      };

      setNotifications(prev => {
        // Verificar duplicados para vehicle_changed también
        if (prev.some(n => n.id === notification.id)) {
          console.log('Notificación de cambio duplicada, omitiendo:', notification.id);
          return prev;
        }

        return [notification, ...prev];
      });
    });

    // ========== LISTENERS PARA ACTIVITY FIELD ==========

    // Escuchar notificaciones de actividades de campo
    newSocket.on('activity_field_notification', (newNotification: ActivityFieldNotification) => {
      // console.log('evento de notificación de actividad de campo', newNotification);

      setNotifications(prev => {
        // Verificar duplicados
        if (prev.some(n => n.id === newNotification.id)) {
          // console.log('Notificación de actividad duplicada, omitiendo:', newNotification.id);
          return prev;
        }

        return [
          {
            ...newNotification,
            timestamp: new Date(newNotification.timestamp),
            read: false
          },
          ...prev
        ];
      });
    });

    // Escuchar cambios en actividades de campo
    newSocket.on('activity_field_changed', (data: { activity: Actividad, changeType: 'created' | 'updated' | 'deleted' }) => {
      const { activity, changeType } = data;

      let message = '';
      let type: ActivityFieldNotification['type'] = 'activity_field_due_soon';

      switch (changeType) {
        case 'created':
          message = `Nueva actividad de campo creada: ${activity.tipo}`;
          break;
        case 'updated':
          message = `Actividad de campo actualizada: ${activity.tipo}`;
          break;
        case 'deleted':
          message = `Actividad de campo eliminada: ${activity.tipo}`;
          break;
      }

      const notification: ActivityFieldNotification = {
        id: `${Date.now()}-${activity._id}`,
        type,
        activity,
        message,
        timestamp: new Date(),
        read: false
      };

      setNotifications(prev => {
        if (prev.some(n => n.id === notification.id)) {
          console.log('Notificación de cambio de actividad duplicada, omitiendo:', notification.id);
          return prev;
        }

        return [notification, ...prev];
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Filtrar notificaciones por tipo
  const vehicleNotifications = notifications.filter(
    (n): n is VehicleNotification => 'vehicle' in n && n.vehicle !== undefined
  );

  const activityFieldNotifications = notifications.filter(
    (n): n is ActivityFieldNotification => 'activity' in n && n.activity !== undefined
  );

  return (
    <NotificationContext.Provider value={{
      notifications,
      vehicleNotifications,
      activityFieldNotifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotification,
      isConnected
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Exportar tipos para uso externo
export type { VehicleNotification, ActivityFieldNotification, Notification };
