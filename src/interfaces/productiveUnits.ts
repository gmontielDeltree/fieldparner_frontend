import { Document } from '../types';

export interface ListProductiveUnits  {
  lotes: string;
  id: string;
  fieldName: string; 
  campo_geojson: any;
}
  export interface ProductiveUnits extends Document {
    units: string;
    description: string;
    fieldList:ListProductiveUnits[];
}
  export interface ProductiveUnitsState {
    productiveUnitsActive: ProductiveUnits| null;
    ProductiveUnits: ProductiveUnits[];
}
  
  export interface ListProductiveUnitsState {
    listProductiveUnitsActive: ListProductiveUnits| null;
    ListProductiveUnits: ListProductiveUnits[];
  }
