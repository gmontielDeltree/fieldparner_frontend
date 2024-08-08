import { Document } from '../types';

export interface LicenceUse extends Document {
    accountId: string;
    licenceId: string;
    country: string;
    category: string;
    status: string;
    startDateLicence: string;
    endDateLicence: string;
    licenceType: string;
    licence: string;
    amountLicencesAllowed: number;
}

