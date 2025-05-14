import { Document } from '../types';

export interface FieldsByProductUnit extends Document {
  // lotes: string;
  id: string;
  fieldName: string;
  fieldId:string;
  hectares: string;
  // campo_geojson: any;
  productiveUnitId: string;
}

export interface ProductUnits extends Document {
  idProductiveUnit: string;
  accountId: string;
  licenceId: string;
  units: string;
  description: string;
  // fieldList: ListProductiveUnits[];
}
export interface ProductiveUnitsState {
  productiveUnitsActive: ProductUnits | null;
  productiveUnits: ProductUnits[];
}

export interface ListProductiveUnitsState {
  listProductiveUnitsActive: FieldsByProductUnit | null;
  listProductiveUnits: FieldsByProductUnit[];
}
