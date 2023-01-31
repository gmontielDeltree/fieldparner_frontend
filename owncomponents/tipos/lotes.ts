export interface Lote {
  id: string;
  type: "Feature";
  properties: {
    nombre: string;
    campo_parent_id: string;
    uuid: string; // Same as id
    hectareas: number;
  };
  geometry: {
    coordinates: [number, number][][];
    type: "Polygon";
  };
}
