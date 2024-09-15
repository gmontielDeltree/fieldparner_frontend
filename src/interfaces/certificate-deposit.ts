import { Document } from "@types";


export interface CertificateDeposit extends Document {
    certificateNumber: string;
    emissionDate: string;
    campaignId: string;
    // business: string;
    cultiveId: string;
    certificateType: string;
    cuitDepositary: string;
    cuitDepositors: string;
    floor: string;
    analysisNumber: string;
    fileCertificate: string;
    product: string;
    quantity: number;
    origin: string;
    destination: string;
    status: string;
    type: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}