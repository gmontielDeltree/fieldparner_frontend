import { Document } from '../types';

export interface ListCorporateContract  {
    id: string,
    companie: string;
    percentageOfParticipation: string;
    activity:string;
    
}
  export interface CorporateContract extends Document {
    idContract: string;
    description: string;
    status: EnumStatusContract;
    contractsList: ListCorporateContract[];  
    totalCompany: number;
  }
  export interface CorporateContractState {
    corporateContractActive: CorporateContract| null;
    CorporateContract: CorporateContract[];
  }
  
  export interface ListCorporateContractState {
    listCorporateContractActive: ListCorporateContract| null;
    ListCorporateContract: ListCorporateContract[];
  }

  
  export enum EnumStatusContract {
    Activo = "Activo",
    Inactivo = "Inactivo",
  }