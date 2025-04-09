import { Campaign, Crop, Deposit, Document, Field, StockMovement, Supply } from "../types";

export enum TipoStock {
    INSUMO = "insumo",
    CULTIVO = "cultivo",
}

export interface Stock extends Document {
    id: string; // insumoId o cultivoId
    tipo: TipoStock;
    accountId: string;
    depositId: string;
    location: string;
    nroLot: string;
    campaignId: string;
    fieldId: string;
    fieldLot: string;
    currentStock: number;
    reservedStock: number;
    lastUpdate: string;
}

export interface CropStockControl extends Document {
    accountId: string;
    campaignId: string;
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
    dataSupply?: Supply;
    dataMovements?: StockMovement[];
}
