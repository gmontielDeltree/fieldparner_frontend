import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { IAnnualPlan } from "../interfaces/annualPlanValorization";
import { ICiclosPlanificacion } from "../interfaces/planification";
import { NotificationService } from "../services/notificationService";
import { useAppSelector } from "./";
import { dbContext } from "../services/pouchdbService";
import { useCampaign, useField, useCrops } from "./";

// Helper para buscar en qué campo está un lote dado
const normalizeValue = (value: unknown) => (value ?? '').toString().trim();

const findFieldForLote = (
  loteId: string,
  fields: any[],
  campoId?: string,
): { field: any; lote: any } | null => {
  if (!loteId) return null;

  const preferredFields = campoId
    ? [
        ...fields.filter((field) =>
          [field?._id, field?.uuid, (field as any)?.id]
            .map(normalizeValue)
            .includes(normalizeValue(campoId)),
        ),
        ...fields.filter((field) =>
          ![field?._id, field?.uuid, (field as any)?.id]
            .map(normalizeValue)
            .includes(normalizeValue(campoId)),
        ),
      ]
    : fields;

  for (const field of preferredFields) {
    if (!field.lotes || !Array.isArray(field.lotes)) continue;
    for (const lote of field.lotes) {
      // Buscar por múltiples identificadores posibles:
      // 1. lote.id - ID del Feature GeoJSON (más común en ciclos de planificación)
      // 2. properties.uuid - UUID almacenado en properties
      // 3. properties.nombre - Nombre del lote (fallback)
      // 4. _id - ID de documento PouchDB (si existe)
      const loteGeoId = lote.id;
      const loteUuid = lote.properties?.uuid;
      const loteNombre = lote.properties?.nombre;
      const lotePouchId = lote._id;

      // Comparar con todos los identificadores posibles
      const matches = [loteGeoId, loteUuid, loteNombre, lotePouchId]
        .filter(Boolean)
        .some((id) => normalizeValue(id) === normalizeValue(loteId));

      if (matches) {
        return { field, lote };
      }
    }
  }
  return null;
};

// Debug helper
const debugFirstField = (fields: any[]) => {
  if (fields.length > 0) {
    const f = fields[0];
    const firstLote = f.lotes?.[0];
    console.log('[DEBUG] Sample field:', {
      _id: f._id,
      nombre: f.nombre,
      lotesCount: f.lotes?.length || 0,
      firstLote: firstLote ? {
        id: firstLote.id,
        type: firstLote.type,
        uuid: firstLote.properties?.uuid,
        propId: firstLote.properties?.id,
        nombre: firstLote.properties?.nombre,
        hectareas: firstLote.properties?.hectareas,
        // Mostrar todas las keys del lote para debug
        loteKeys: Object.keys(firstLote),
        propertiesKeys: firstLote.properties ? Object.keys(firstLote.properties) : [],
      } : null
    });
  }
};

export const useAnnualPlanValorization = () => {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [annualPlanValorizations, setAnnualPlanValorizations] = useState<IAnnualPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { campaigns } = useCampaign();
  const { fields } = useField();
  const { crops } = useCrops();

  const db = dbContext.fields;

  const getAnnualPlanValorizations = useCallback(async () => {
    setIsLoading(true);
    try {
      // Asegurar que los datos base están cargados
      // Solo cargar si no hay datos disponibles
      let currentFields = fields;
      let currentCampaigns = campaigns;
      let currentCrops = crops;

      // Cargar campos directamente - usar allDocs para evitar problemas de selector/índice
      if (fields.length === 0) {
        console.log('[useAnnualPlanValorization] Loading fields directly...');
        const fieldsResult = await dbContext.fields.allDocs({ include_docs: true });
        currentFields = fieldsResult.rows
          .filter((row) => row.doc && row.id?.includes("campos_"))
          .map((row) => row.doc as any);
        console.log('[useAnnualPlanValorization] Fields loaded:', currentFields.length);
      }

      // Cargar campañas directamente - usar allDocs
      if (campaigns.length === 0) {
        console.log('[useAnnualPlanValorization] Loading campaigns directly...');
        const campaignsResult = await dbContext.campaigns.allDocs({ include_docs: true });
        currentCampaigns = campaignsResult.rows
          .filter((row) => row.doc && !row.id.startsWith("_"))
          .map((row) => row.doc as any);
        console.log('[useAnnualPlanValorization] Campaigns loaded:', currentCampaigns.length);
      }

      // Cargar cultivos directamente
      if (crops.length === 0) {
        console.log('[useAnnualPlanValorization] Loading crops directly...');
        const cropsResult = await dbContext.crops.allDocs({ include_docs: true });
        currentCrops = cropsResult.rows
          .filter((row) => row.doc && !row.id.startsWith("_"))
          .map((row) => row.doc as any);
        console.log('[useAnnualPlanValorization] Crops loaded:', currentCrops.length);
      }

      console.log('[useAnnualPlanValorization] Data loaded - Fields:', currentFields.length, 'Campaigns:', currentCampaigns.length, 'Crops:', currentCrops.length);
      debugFirstField(currentFields);

      // Buscar ciclos de planificación en dbContext.fields
      const result = await db.allDocs({
        include_docs: true,
        startkey: "ciclo:",
        endkey: "ciclo:\ufff0",
      });

      const ciclos = result.rows
        .filter((row) => row.doc && !row.id.startsWith("_"))
        .map((row) => row.doc as unknown as ICiclosPlanificacion);

      console.log('[useAnnualPlanValorization] Ciclos found:', ciclos.length);
      if (ciclos.length > 0) {
        console.log('[useAnnualPlanValorization] Sample ciclo:', ciclos[0]);
        // Debug: intentar encontrar el campo para el primer ciclo
        const sampleCiclo = ciclos[0];
        const sampleFieldData = findFieldForLote(sampleCiclo.loteId, currentFields, sampleCiclo.campoId);
        console.log('[useAnnualPlanValorization] Sample ciclo loteId:', sampleCiclo.loteId);
        console.log('[useAnnualPlanValorization] Found field for sample:', sampleFieldData ? {
          fieldId: sampleFieldData.field?._id,
          fieldNombre: sampleFieldData.field?.nombre,
          loteNombre: sampleFieldData.lote?.properties?.nombre,
        } : 'NOT FOUND');
      }

      const normalize = (val: any) => (val ?? '').toString();
      const currentAccountId = normalize(user?.accountId);
      const ciclosByAccount = currentAccountId
        ? ciclos.filter((ciclo) => normalize((ciclo as any).accountId) === currentAccountId)
        : ciclos;

      console.log('[useAnnualPlanValorization] Ciclos by account:', ciclosByAccount.length, 'of', ciclos.length);

      // Transformar ciclos a formato AnnualPlan
      // NO filtramos por campoId ya que no está guardado en los ciclos
      const valorizations: IAnnualPlan[] = ciclosByAccount
        .filter(ciclo => ciclo.campanaId && ciclo.loteId) // Solo necesitamos campanaId y loteId
        .map((ciclo) => {

          const campaign = currentCampaigns.find((c: any) =>
            normalize(c?._id) === normalize(ciclo.campanaId) ||
            normalize((c as any)?.campaignId) === normalize(ciclo.campanaId)
          );
          
          // Derivar el campo desde el loteId buscando en todos los campos
          const fieldData = findFieldForLote(ciclo.loteId, currentFields, ciclo.campoId);
          const field = fieldData?.field;
          const lote = fieldData?.lote;

          const crop = currentCrops.find((c: any) =>
            [
              c?._id,
              (c as any)?.id,
              (c as any)?.uuid,
              (c as any)?.codigo,
              (c as any)?.code,
              (c as any)?.cultivoId,
            ].some(val => normalize(val) === normalize(ciclo.cultivoId))
          );

          const hectareas = lote?.properties?.hectareas || lote?.properties?.area || 0;

          // Determinar status basado en la campaña
          // Campaign.state puede ser 'Activo', 'Inactivo', 'Todos' (enum Estado)
          const campaignState = campaign?.state || campaign?.status || 'Activo';
          const status = campaignState === 'Inactivo' ? 'cerrado' : 'abierto';

          // Obtener nombre del cultivo - puede estar en diferentes campos
          const cropName =
            (crop as any)?.crop ||
            (crop as any)?.descriptionES ||
            (crop as any)?.name ||
            (crop as any)?.nombre ||
            (crop as any)?.description ||
            '';

          const campanaName = campaign?.name || (campaign as any)?.description || ciclo.campanaId;
          const zafra =
            ciclo.zafra ||
            (Array.isArray(campaign?.zafra) ? campaign.zafra[0] : campaign?.zafra) ||
            (campaign as any)?.harvest ||
            '';

          return {
            _id: ciclo._id,
            _rev: ciclo._rev,
            campanaId: ciclo.campanaId,
            campanaName,
            zafra,
            campoId: field?._id || (field as any)?.id || ciclo.campoId || '',
            campoNombre: field?.nombre || (field as any)?.name || (field as any)?.description || '',
            loteId: ciclo.loteId,
            loteNombre: lote?.properties?.nombre || lote?.properties?.name || lote?.properties?.description || ciclo.loteId,
            has: hectareas,
            cultivoId: ciclo.cultivoId,
            cultivoNombre: cropName,
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

      console.log('[useAnnualPlanValorization] Valorizations transformed:', valorizations.length);
      // Debug: mostrar primer valorización para ver si los datos están correctos
      if (valorizations.length > 0) {
        console.log('[useAnnualPlanValorization] Sample valorization:', {
          campanaName: valorizations[0].campanaName,
          campoNombre: valorizations[0].campoNombre,
          loteNombre: valorizations[0].loteNombre,
          has: valorizations[0].has,
          cultivoNombre: valorizations[0].cultivoNombre,
          zafra: valorizations[0].zafra,
        });
        // Contar cuántos tienen campo
        const withField = valorizations.filter(v => v.campoNombre).length;
        const withLote = valorizations.filter(v => v.loteNombre && v.loteNombre !== v.loteId).length;
        console.log('[useAnnualPlanValorization] With field name:', withField, '/ Without:', valorizations.length - withField);
        console.log('[useAnnualPlanValorization] With lote name:', withLote, '/ Without:', valorizations.length - withLote);
      }

      // Mostrar todas las valorizaciones - el filtro de la UI se encargará del estado
      console.log('[useAnnualPlanValorization] Total valorizations:', valorizations.length);
      const openCount = valorizations.filter(v => v.status === 'abierto').length;
      const closedCount = valorizations.filter(v => v.status === 'cerrado').length;
      console.log('[useAnnualPlanValorization] By status - Open:', openCount, 'Closed:', closedCount);

      setAnnualPlanValorizations(valorizations);
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
  }, [campaigns, fields, crops, user?.accountId, t]);

  const createAnnualPlanValorization = async (valorizationData: any) => {
    try {
      // Find the matching ciclo by campanaId + loteId
      const result = await db.allDocs({
        include_docs: true,
        startkey: "ciclo:",
        endkey: "ciclo:\ufff0",
      });

      const ciclos = result.rows
        .filter((row) => row.doc && !row.id.startsWith("_"))
        .map((row) => row.doc as unknown as ICiclosPlanificacion);

      const matchingCiclo = ciclos.find(c =>
        c.campanaId === valorizationData.campanaId &&
        (c.loteId === valorizationData.loteId || c.loteId === valorizationData.loteName)
      );

      if (!matchingCiclo) {
        throw new Error('No matching planning cycle found for this campaign and lot');
      }

      // Update the ciclo with valorization data
      const updatedCiclo = {
        ...matchingCiclo,
        rindeHistorico: valorizationData.rindeHistorico,
        monedaAlterId: valorizationData.monedaAlterId,
        cotizMonAlt: valorizationData.cotizMonAlt,
        operacMonAlt: valorizationData.operacMonAlt,
        cotizFutCer: valorizationData.cotizFutCer,
        valorizada: true,
      };

      await db.put(updatedCiclo as any);
      await getAnnualPlanValorizations();

      NotificationService.showSuccess(
        t("valorization_created") || "Valorization created",
        null,
        t("valorization_label")
      );

      return updatedCiclo;
    } catch (error) {
      console.error("Error creating valorization:", error);
      NotificationService.showError(
        t("error_creating_valorization") || "Error creating valorization",
        error,
        t("valorization_label")
      );
      throw error;
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

  const deleteAnnualPlanValorization = async (id: string, rev?: string) => {
    // Ahora eliminamos el ciclo completo para que desaparezca de la tabla
    try {
      const doc = await db.get(id);
      const revToUse = rev || doc._rev;

      await db.remove(doc._id, revToUse);
      setAnnualPlanValorizations(prev => prev.filter(v => v._id !== id));

      NotificationService.showSuccess(
        t("valorization_cleared"),
        null,
        t("valorization_label")
      );
    } catch (error) {
      console.error("Error deleting valorization:", error);
      NotificationService.showError(
        t("error_clearing_valorization"),
        error,
        t("valorization_label")
      );
      throw error;
    } finally {
      // Refrescar la lista para mantener consistencia con base
      getAnnualPlanValorizations();
    }
  };

  return {
    annualPlanValorizations,
    isLoading,
    getAnnualPlanValorizations,
    createAnnualPlanValorization,
    updateAnnualPlanValorization,
    deleteAnnualPlanValorization,
  };
};
