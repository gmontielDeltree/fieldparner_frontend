import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../hooks';
import { Vehicle } from '../types';
import { getEnvVariables } from '../helpers/getEnvVariables';

interface VehicleNotification {
  id: string;
  type: 'vehicle_maintenance' | 'vehicle_alert' | 'vehicle_update';
  vehicle: Vehicle;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: VehicleNotification[];
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
  const [notifications, setNotifications] = useState<VehicleNotification[]>([]);
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

  return (
    <NotificationContext.Provider value={{
      notifications,
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
