import { Document } from '../types';

export interface CompanyByContract extends Document {
    id: string,
    contractId: string;
    companyId: string;
    percentageOfParticipation: number;
    activity:string;
}
  export interface CorporateContract extends Document {
    accountId: string;
    licenceId: string;    
    idContract: string;
    description: string;
    status: EnumStatusContract;
    totalCompany: number;
    campaignId?: string;
  }
  export interface CorporateContractState {
    corporateContractActive: CorporateContract| null;
    CorporateContract: CorporateContract[];
  }
  
  export interface ListCorporateContractState {
    listCorporateContractActive: CompanyByContract| null;
    ListCorporateContract: CompanyByContract[];
  }

  
  export enum EnumStatusContract {
    Activo = "Activo",
    Inactivo = "Inactivo",
  }