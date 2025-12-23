import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IAnnualPlan } from "../interfaces/annualPlanValorization";
import { ICiclosPlanificacion } from "../interfaces/planification";
import { NotificationService } from "../services/notificationService";
import { useAppSelector } from "./";
import { dbContext } from "../services/pouchdbService";
import { useCampaign, useField, useCrops } from "./";

export const useAnnualPlanValorization = () => {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [annualPlanValorizations, setAnnualPlanValorizations] = useState<IAnnualPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { campaigns } = useCampaign();
  const { fields } = useField();
  const { crops } = useCrops();

  const db = dbContext.fields;

  const getAnnualPlanValorizations = async () => {
    setIsLoading(true);
    try {
      // Buscar ciclos de planificación en dbContext.fields
      const result = await db.allDocs({
        include_docs: true,
        startkey: "ciclo:",
        endkey: "ciclo:\ufff0",
      });

      const ciclos = result.rows
        .filter((row) => row.doc && !row.id.startsWith("_"))
        .map((row) => row.doc as unknown as ICiclosPlanificacion);

      // Transformar ciclos a formato AnnualPlan
      const valorizations: IAnnualPlan[] = ciclos.map((ciclo) => {
        const campaign = campaigns.find((c) => c._id === ciclo.campanaId);
        const field = fields.find((f) => f._id === ciclo.campoId);
        const lote = field?.lotes?.find(
          (l: any) => l.properties?.id === ciclo.loteId || l.properties?.nombre === ciclo.loteId
        );
        const crop = crops.find((c) => c._id === ciclo.cultivoId);

        const hectareas = lote?.properties?.hectareas || lote?.properties?.area || 0;

        // Determinar status basado en la campaña
        const campaignStatus = campaign?.status || 'abierto';
        const status = campaignStatus === 'cerrado' ? 'cerrado' : 'abierto';

        return {
          _id: ciclo._id,
          _rev: ciclo._rev,
          campanaId: ciclo.campanaId,
          zafra: ciclo.zafra || '',
          campoId: ciclo.campoId,
          campoNombre: field?.name || '',
          loteId: ciclo.loteId,
          loteNombre: lote?.properties?.nombre || ciclo.loteId,
          has: hectareas,
          cultivoId: ciclo.cultivoId,
          cultivoNombre: crop?.name || '',
          cosechaEstimada: 0,
          status: status as 'abierto' | 'cerrado' | 'en_proceso',
          // Campos de valorización (se actualizan después)
          rindeHistorico: (ciclo as any).rindeHistorico,
          monedaAlterId: (ciclo as any).monedaAlterId,
          cotizMonAlt: (ciclo as any).cotizMonAlt,
          operacMonAlt: (ciclo as any).operacMonAlt,
          cotizFutCer: (ciclo as any).cotizFutCer,
          valorizada: (ciclo as any).valorizada || false,
          // Campos de FPDocument
          accountId: ciclo.accountId || user?.accountId || '',
          created: ciclo.created || { userId: '', date: '' },
          modified: ciclo.modified || { userId: '', date: '' },
        } as IAnnualPlan;
      });

      // Filtrar solo campañas abiertas para valorización
      const openValorizations = valorizations.filter(v => v.status === 'abierto');

      setAnnualPlanValorizations(openValorizations);
    } catch (error) {
      console.error("Error loading annual plan valorizations:", error);
      NotificationService.showError(
        t("error_loading_valorizations"),
        error,
        t("valorization_label")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateAnnualPlanValorization = async (valorization: IAnnualPlan) => {
    try {
      // Actualizar el ciclo en dbContext.fields con los datos de valorización
      const ciclo = await db.get(valorization._id!) as unknown as ICiclosPlanificacion;

      const updatedCiclo = {
        ...ciclo,
        rindeHistorico: valorization.rindeHistorico,
        monedaAlterId: valorization.monedaAlterId,
        cotizMonAlt: valorization.cotizMonAlt,
        operacMonAlt: valorization.operacMonAlt,
        cotizFutCer: valorization.cotizFutCer,
        valorizada: true,
      };

      await db.put(updatedCiclo as any);
      await getAnnualPlanValorizations();

      NotificationService.showUpdated(
        valorization,
        t("valorization_label")
      );

      return valorization;
    } catch (error) {
      console.error("Error updating valorization:", error);
      NotificationService.showError(
        t("error_updating_valorization"),
        error,
        t("valorization_label")
      );
      throw error;
    }
  };

  const deleteAnnualPlanValorization = async (id: string, rev: string) => {
    // No eliminamos el ciclo, solo limpiamos los datos de valorización
    try {
      const ciclo = await db.get(id) as any;

      const updatedCiclo = {
        ...ciclo,
        rindeHistorico: undefined,
        monedaAlterId: undefined,
        cotizMonAlt: undefined,
        operacMonAlt: undefined,
        cotizFutCer: undefined,
        valorizada: false,
      };

      await db.put(updatedCiclo);
      await getAnnualPlanValorizations();

      NotificationService.showSuccess(
        t("valorization_cleared"),
        null,
        t("valorization_label")
      );
    } catch (error) {
      console.error("Error clearing valorization:", error);
      NotificationService.showError(
        t("error_clearing_valorization"),
        error,
        t("valorization_label")
      );
      throw error;
    }
  };

  return {
    annualPlanValorizations,
    isLoading,
    getAnnualPlanValorizations,
    updateAnnualPlanValorization,
    deleteAnnualPlanValorization,
  };
};
