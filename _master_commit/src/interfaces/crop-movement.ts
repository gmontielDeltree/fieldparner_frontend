import { Document } from '../types';

// CropMovement (MovimCultivo)
// Registra entradas/salidas de cultivos con trazabilidad completa
export interface CropMovement extends Document {
    accountId: string;
    licenceId?: string;
    depositId: string;
    cropId: string;
    campaignId: string;
    zafra?: string;
    fieldId?: string; // Campo
    lotId?: string; // Lote
    inOut: 'E' | 'S'; // Entrada / Salida
    date: string; // Fecha de la operación
    movement: string; // e.g. "Cosecha", "Salida Campo", "Transformacion"
    detail?: string; // Detalle libre (Campaña+Zafra, Motivo, etc.)
    amountKg: number; // Cantidad en kilogramos
}



