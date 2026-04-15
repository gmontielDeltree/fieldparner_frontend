import { LastUpdateTag, CreatedTag } from "./activity";
import { LngLatLike } from "mapbox-gl";

export interface Proveedor {
  _id: string;
  _rev?: string;
  uuid: string;
  nombre: string;
  cuit: string;
  direccion: string;
  posicion?: LngLatLike;
  telefono: string;
  obs: string;
  last_updated: LastUpdateTag;
  created: CreatedTag;
}
