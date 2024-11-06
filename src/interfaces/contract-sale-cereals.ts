import { Document } from '../types';

export interface ContractSaleCereals extends Document {
    nroContractSale: string;
    campaignId: string; //Campaña
    contractCorporateId: string; //Sociedad
    cropId: string; //Cultivo
    isOpenContract: boolean;
    dateCreated: string;
    kg: number;
    kms: number;
    currency: string;
    amountValue: string;
    kgDelivered: string;
    valueCollected: string;
    contractType: string;
    status: string;
}