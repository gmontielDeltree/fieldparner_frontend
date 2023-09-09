import { LngLatLike } from "mapbox-gl";
import { LastUpdateTag, CreatedTag } from "../depositos/depositos-types";
import { Feature, FeatureCollection } from "@turf/helpers";
import { property } from "lit/decorators.js";
import { uuidv7 } from "uuidv7";

interface PropertiesPunto {
  _id:string,
  fotos?: string[];
  notas?: string[];
  audio?: string[];
  last_updated: LastUpdateTag;
  created: CreatedTag;
  // Detalles me sirve para poner cualquier cosa, crear distintos tipos de recorridas
  detalles?: [{ name: string; value: string }];
}

export interface PuntoRecorrida extends Feature {
  _id: string,
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: PropertiesPunto;
}

/**
 * La recorrida es un FeatureCollection y tambien un Doc
 */
export interface Recorrida extends PouchDB.Core.Document<FeatureCollection> {
  _id: string;
  _rev?: string;
  type: "FeatureCollection";
  features: PuntoRecorrida[];
  date: string;
  nombre: string;
  proxima_visita: string;
  last_updated: LastUpdateTag;
  created: CreatedTag;
}

/* Inicializadores */
const empty_punto_properties = (id:string) => {
  let props: PropertiesPunto = {
    _id:id,
    last_updated: { last_updated: "", last_updated_by: "" },
    created: { created: "", created_by: "" },
  };
  return props;
};

export const empty_punto = (coord: LngLatLike) => {
  let un_id = uuidv7()
  let empty_props = empty_punto_properties(un_id);
  let punto: PuntoRecorrida = {
    _id: un_id,
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [coord.lng, coord.lat],
    },
    properties: empty_props,
  };
  return punto;
};

export const empty_recorrida = () => {
  let er: Recorrida = {
    _id: uuidv7(),
    type: "FeatureCollection",
    date: "",
    nombre: "",
    proxima_visita: "",
    last_updated: { last_updated: "", last_updated_by: "" },
    created: { created: "", created_by: "" },
    features: [],
  };
  return er;
};
