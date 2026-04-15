import { Document } from "@types";

export interface CampaingExpenses extends Document {
    campaign: string;
    field: string;
    lot: string;
    hectares: string;
    partial: string;
    listCamapingExpeses: ListCampingExpeses[];
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
