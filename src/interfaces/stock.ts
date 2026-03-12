import { Campaign, Crop, Deposit, Document, Field, StockMovement, Supply } from "../types";

export enum TipoStock {
    INSUMO = "insumo",
    CULTIVO = "cultivo",
}
//STOCK DE INSUMO
export interface Stock extends Document {
    id: string; // insumoId o cultivoId
    tipo: TipoStock;
    accountId: string;
    depositId: string;
    location: string;
    nroLot?: string;
    campaignId: string;
    fieldId: string;
    fieldLot: string;
    currentStock: number;
    reservedStock: number;
    lastUpdate: string;
}

//STOCK DE CULTIVO
export interface CropStockControl extends Document {
    accountId: string;
    licenceId?: string;
    campaignId: string;
    zafra?: string;
    cropId: string;
    currentStock: number;
    committedStock: number;
    deliveredStock: number;
    lastUpdate: string;
}

export interface StockItem extends Stock {
    dataDeposit?: Deposit;
    dataCampaign?: Campaign;
    dataField?: Field;
    dataCrop?: Crop;
    zafra?: string;
    dataSupply?: Supply;
    dataMovements?: StockMovement[];
}

// Datos agregados para la vista/resumen de stock de cultivos
export interface CropStockData {
    _id: string;
    _rev?: string;
    cropId: string;
    cropName?: string;
    campaign: string;
    zafra: string;
    currentStock: number;
    committedStock: number;
    deliveredStock: number;
    available: number;
    pending: number;
}

export interface ListStockCropOrSupply {
    stockBySupplies: Stock[];
    stockByCrops: CropStockData[];
}
