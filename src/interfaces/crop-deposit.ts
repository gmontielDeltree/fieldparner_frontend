import { Campaign, Crop, Deposit, Document } from "@types";
import { Field } from "./field";

//STOCK DE CULTIVO
export interface CropDeposit extends Document {
    accountId: string;
    licenceId: string;
    campaignId: string;
    depositId: string;
    location: string;
    cropId: string;
    fieldId: string;
    lotId: string;
    zafra: string;
    description: string;
    currentStock: number;
    unitMeasurement: string;
    lastUpdate: string;
}

export interface CropDepositItem extends CropDeposit {
    dataDeposit?: Deposit;
    dataCampaign?: Campaign;
    dataField?: Field;
    dataCrop?: Crop;
    dataLot?: string;
}