import { Document } from "@types";

export interface CampaingExpenses extends Document {
    accountId?: string;
    licenceId?: string;
    campaign: string;
    zafra?: string;
    field: string;
    lot: string;
    hectares: string;
    partial: string;
    listCamapingExpeses: ListCampingExpeses[];
    createdAt?: string;
    updatedAt?: string;
}

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
