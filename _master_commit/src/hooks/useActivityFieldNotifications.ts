import { useEffect, useMemo } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Actividad } from '../interfaces/activity';

/**
 * Hook personalizado para integrar notificaciones de actividades de campo
 * Monitorea las notificaciones de actividades con estado "pendiente" y fechas vencidas o por vencer
 */
export const useActivityFieldNotifications = () => {
  const { activityFieldNotifications, isConnected } = useNotifications();

  useEffect(() => {
    if (activityFieldNotifications.length > 0) {
      console.log(`Received ${activityFieldNotifications.length} activity field notifications`);
    }
  }, [activityFieldNotifications]);

  // Filtrar notificaciones por tipo
  const overdue = useMemo(
    () => activityFieldNotifications.filter(n => n.type === 'activity_field_overdue'),
    [activityFieldNotifications]
  );

  const dueSoon = useMemo(
    () => activityFieldNotifications.filter(n => n.type === 'activity_field_due_soon'),
    [activityFieldNotifications]
  );

  // Obtener notificaciones no leídas
  const unreadNotifications = useMemo(
    () => activityFieldNotifications.filter(n => !n.read),
    [activityFieldNotifications]
  );

  // Agrupar por tipo de actividad
  const notificationsByType = useMemo(() => {
    const grouped: Record<string, typeof activityFieldNotifications> = {};

    activityFieldNotifications.forEach(notification => {
      const tipo = notification.activity.tipo;
      if (!grouped[tipo]) {
        grouped[tipo] = [];
      }
      grouped[tipo].push(notification);
    });

    return grouped;
  }, [activityFieldNotifications]);

  // Función helper para verificar si una actividad está vencida
  const isActivityOverdue = (activity: Actividad): boolean => {
    if (!activity.detalles?.fecha_ejecucion_tentativa) return false;
    const dueDate = new Date(activity.detalles.fecha_ejecucion_tentativa);
    const now = new Date();
    return dueDate < now;
  };

  // Función helper para verificar si una actividad vence pronto (2 días)
  const isActivityDueSoon = (activity: Actividad): boolean => {
    if (!activity.detalles?.fecha_ejecucion_tentativa) return false;
    const dueDate = new Date(activity.detalles.fecha_ejecucion_tentativa);
    const now = new Date();
    const twoDaysFromNow = new Date(now);
    twoDaysFromNow.setDate(now.getDate() + 2);
    return dueDate >= now && dueDate <= twoDaysFromNow;
  };

  return {
    // Notificaciones
    activityFieldNotifications,
    overdueNotifications: overdue,
    dueSoonNotifications: dueSoon,
    unreadNotifications,
    notificationsByType,

    // Estadísticas
    totalCount: activityFieldNotifications.length,
    overdueCount: overdue.length,
    dueSoonCount: dueSoon.length,
    unreadCount: unreadNotifications.length,

    // Estado de conexión
    isConnected,

    // Funciones helper
    isActivityOverdue,
    isActivityDueSoon,
  };
};
