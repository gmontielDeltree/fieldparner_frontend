import { Document } from "@types";


export interface CertificateDeposit extends Document {
    certificateNumber: string;
    date: string;
    business: string;
    vehicle: string;
    driver: string;
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