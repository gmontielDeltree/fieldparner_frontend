import { Lote } from './lotes';
export interface Campo{
    _id:string,
    _rev?:string,
    uuid:string,
    nombre:string,
    campo_geojson:CampoGeoJson,
    lotes: Lote[]
        
}

export interface CampoGeoJson{
        id: string;
        type: "Feature";
        properties: {
          hectareas: number;
        };
        geometry: {
          coordinates: [number, number][][];
          type: "Polygon";
        };
      
}