interface Lot {
  id: string;
  type: string;
  properties: {
    nombre: string;
    campo_parent_id: string;
    uuid: string;
    hectareas: number;
  };
  geometry: {
    coordinates: number[][][];
    type: string;
  };
}

interface Field {
  nombre: string;
  campo_geojson: any;
  uuid: string;
  lotes: Lot[];
  _id: string;
  _rev?: string;
  accountId?: string;
}

export type { Lot, Field };
