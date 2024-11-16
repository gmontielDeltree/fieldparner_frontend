import { Campaign, Crops, Document, OriginDestinations } from '../types';
import { Company } from './company';
import { Business } from './socialEntity';

export interface ContractSaleCereal extends Document {
    accountId: string;
    licenceId: string;
    contractSaleNumber: string;
    campaignId: string; //Campaña
    companyId: string; //Sociedad
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
    condition: string;
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

export interface ContractDeliveyDate extends Document {
    contractSaleNumber: string;
    deliveryDate: string;
    dateCreated: string;
}

export interface ContractSaleCerealItem extends ContractSaleCereal {
    campaign: Campaign;
    company: Company;
    crop: Crops;
    producer: Business;
    buyer: Business;
    destination: OriginDestinations;
    deliver: Business;
    broker: Business;
    comssionAgent: Business;
}