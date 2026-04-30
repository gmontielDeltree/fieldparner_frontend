import { Document } from "@types";

/**
 * CabGastosCampania - documento principal por (campaña/zafra/campo/lote).
 *
 * El backend espera, segun la mejora A079 v2, persistir en cuatro tablas
 * (CabGastosCampania, InsumosxLabor, ServiciosxLabor, DetGastosCampania).
 * El front no tiene esas tablas separadas: guardamos todo dentro de este
 * documento (que sincroniza a la base couch `campaing-expenses`) y el
 * backend puede denormalizar como prefiera. Ese es el contrato pragmatico.
 *
 * Los campos de la primera version (campaign, field, lot, hectares,
 * partial, listCamapingExpeses) se preservan como opcionales para no
 * romper documentos previos.
 */
export interface CampaingExpenses extends Document {
    accountId?: string;
    licenceId?: string;

    // Compatibilidad con la version inicial.
    campaign: string;
    field: string;
    lot: string;
    hectares: string;
    partial?: string;
    listCamapingExpeses?: ListCampingExpeses[];

    // Seccion A - cabecera (A079 v2).
    campaignName?: string;
    zafra?: string;
    fieldId?: string;
    fieldName?: string;
    lotId?: string;
    lotName?: string;
    cropId?: string;
    cropName?: string;
    hectareas?: number;
    monedaAlternativa?: string;
    cotizacionMonedaAlternativa?: number;
    estaCerrada?: boolean;

    // Lineas (Secciones B/C/D/F).
    insumosLabor?: InsumoLaborLine[];
    cosechaLine?: CosechaLine | null;
    serviciosLabor?: ServicioLaborLine[];
    detalleGastos?: DetalleGastoLine[];

    // Auditoria.
    creationDate?: string;
    lastUpdate?: string;
}

/** Forma vieja, se conserva para no romper docs sincronizados. */
export interface ListCampingExpeses {
    id: string;
    date: string;
    company: string;
    labor: string;
    costCode: string;
    amount: string;
    detail: string;
    reference: string;
}

/**
 * Seccion B (insumos de labores ejecutadas).
 * Tambien usado para Seccion C (cosecha) - en C el insumo es el cultivo
 * y la "Cantidad x Ha" es el rinde.
 */
export interface InsumoLaborLine {
    id: string;
    actividadId?: string;          // IActividadPlanificacion._id
    insumoLineaId?: string;        // IInsumosPlanificacion._id
    laborId?: string;
    laborNombre?: string;
    insumoId?: string;
    insumoNombre?: string;
    cantidadPorHa?: number;
    unidad?: string;
    sociedadId?: string;
    sociedadNombre?: string;
    contratoId?: string;
    contratoNombre?: string;
    valorUnidad?: number;
    valorTotal?: number;
    valorTotalMonAlt?: number;
}

/** Seccion C (cosecha). */
export interface CosechaLine {
    actividadId?: string;
    laborId?: string;
    cultivoId?: string;
    cultivoNombre?: string;
    rindeUnidad?: string;          // ej. "Tn", "Sacas"
    rindeCantidad?: number;
    sociedadId?: string;
    sociedadNombre?: string;
    contratoId?: string;
    contratoNombre?: string;
    valorUnidad?: number;
    valorTotal?: number;
    valorTotalMonAlt?: number;
}

/** Seccion D (servicios de labores ejecutadas). */
export interface ServicioLaborLine {
    id: string;
    actividadId?: string;
    laborLineaId?: string;          // ILaboresPlanificacion._id
    fecha?: string;
    laborId?: string;
    laborNombre?: string;
    servicio?: string;
    contratante?: string;
    unidadPorHa?: number;
    unidad?: string;
    hectareas?: number;
    valorUnidad?: number;
    valorTotal?: number;
    valorTotalMonAlt?: number;
}

/** Seccion F (gastos adicionales, ex DetGastosCampania). */
export interface DetalleGastoLine {
    id: string;
    fecha: string;
    laborId?: string;
    laborNombre?: string;
    sociedadId?: string;
    sociedadNombre?: string;
    contratoId?: string;
    contratoNombre?: string;
    tipoGastoId?: string;
    tipoGastoNombre?: string;
    gasto?: string;
    importe: number;
    referencia?: string;
}

export const isCampaignExpenseClosed = (doc?: CampaingExpenses | null): boolean =>
    Boolean(doc?.estaCerrada);
