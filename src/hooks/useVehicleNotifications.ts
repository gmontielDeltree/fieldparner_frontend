import { useEffect } from 'react';
import { useVehicle } from './useVehicle';
import { useNotifications } from '../contexts/NotificationContext';
import { Vehicle } from '../types';

/**
 * Hook personalizado para integrar notificaciones de vehículos
 * Monitorea cambios en la base de datos local y genera notificaciones automáticas
 */
export const useVehicleNotifications = () => {
  const { vehicles, getVehicles } = useVehicle();
  const { notifications } = useNotifications();

  useEffect(() => {
    // Cargar vehículos al montar el componente
    getVehicles();
  }, []);

  // Función para verificar vehículos que necesitan mantenimiento
  const checkMaintenanceAlerts = (vehicleList: Vehicle[]) => {
    const today = new Date();
    const maintenanceAlerts = vehicleList.filter(vehicle => {
      if (vehicle.lastMaintenance) {
        const lastMaintenanceDate = new Date(vehicle.lastMaintenance);
        // Calcular si han pasado más de 6 meses desde el último mantenimiento
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return lastMaintenanceDate <= sixMonthsAgo;
      }
      return false;
    });

    return maintenanceAlerts;
  };

  // Función para verificar vehículos con seguro vencido
  const checkInsuranceAlerts = (vehicleList: Vehicle[]) => {
    const today = new Date();
    return vehicleList.filter(vehicle => {
      if (vehicle.insurenceDueDate) {
        const insuranceDueDate = new Date(vehicle.insurenceDueDate);
        return insuranceDueDate <= today;
      }
      return false;
    });
  };

  // Función para verificar problemas reportados (basándose en campos disponibles)
  const checkGeneralAlerts = (vehicleList: Vehicle[]) => {
    return vehicleList.filter(vehicle => {
      // Verificar vehículos sin datos críticos
      return !vehicle.patent || !vehicle.chassisNumber || !vehicle.make;
    });
  };

  useEffect(() => {
    if (vehicles.length > 0) {
      // Verificar vehículos que necesitan mantenimiento
      const maintenanceVehicles = checkMaintenanceAlerts(vehicles);
      const insuranceVehicles = checkInsuranceAlerts(vehicles);
      const generalAlerts = checkGeneralAlerts(vehicles);

      // Estas verificaciones podrían generar notificaciones automáticas
      // pero para evitar spam, podrían estar limitadas por tiempo
      console.log('Maintenance alerts:', maintenanceVehicles.length);
      console.log('Insurance alerts:', insuranceVehicles.length);
      console.log('General alerts:', generalAlerts.length);
    }
  }, [vehicles]);

  return {
    vehicles,
    notifications,
    maintenanceVehicles: checkMaintenanceAlerts(vehicles),
    insuranceVehicles: checkInsuranceAlerts(vehicles),
    generalAlerts: checkGeneralAlerts(vehicles),
  };
};
