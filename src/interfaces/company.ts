import { DataFileName, Document } from "@types";

export interface Company extends Document {
    accountId: string;
    licenceId: string;
    country: string;
    companyId: string;
    email: string;
    name: string;
    fantasyName: string;
    trybutaryCode: string;
    companyLogo: DataFileName;
    zipCode: string;
    phone: string;
    socialReason: string;
    secondaryContact: string;
    observation: string;
    website: string;
    address: string;
    locality: string;
    province: string;
}
