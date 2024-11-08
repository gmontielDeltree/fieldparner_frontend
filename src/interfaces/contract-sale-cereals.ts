import { Document } from '../types';

export interface ContractSaleCereals extends Document {
    nroContractSale: string;
    campaignId: string; //Campaña
    contractCorporateId: string; //Sociedad
    cropId: string; //Cultivo
    producerId: string //Productor/Vendedor
    buyerId: string; //Comprador/Detinatario
    destinationId: string; //Destino
    delivererId: string; //Entregador
    brokerId: string; //Corredor
    brokerPercentage: number;
    brokerAmountValue: number;
    comissionAgentId: string; //Comisionista
    comissionAgentPercentage: number;
    comissionAgentAmountValue: number;
    condition:string;
    mothodPayment: string;
    isOpenContract: boolean;
    dateCreated: string;
    kg: number;
    kms: number;
    quintalQuote: number;
    valueQuote: number;
    USDQuote: number;
    valueUSDQuote: number;
    currency: string;
    amountValue: string;
    kgDelivered: string;
    valueCollected: string;
    contractType: string;
    status: string;
}