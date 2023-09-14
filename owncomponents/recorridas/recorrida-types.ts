import { LngLatLike } from "mapbox-gl";
import { LastUpdateTag, CreatedTag } from "../depositos/depositos-types";
import { Feature, FeatureCollection } from "@turf/helpers";
import { uuidv7 } from "uuidv7";
import { format } from "date-fns";
import { get } from "lit-translate";

export const get_posibles_detalles = () => {
  return [
    {
      name: "Plaga",
      type: "string",
    },
    {
      name: "Enfermedad",
      type: "string",
    },
    { name: "Muestra", type: "string" },
  ];
};

interface PropertiesPunto {
  _id: string;
  nombre?: string;
  orden:number;
  fotos?: string[];
  notas?: string[];
  audio?: string;
  last_updated: LastUpdateTag;
  created: CreatedTag;
  // Detalles me sirve para poner cualquier cosa, crear distintos tipos de recorridas
  detalles?: { name: string; value: string }[];
}

export interface PuntoRecorrida extends Feature {
  _id: string;
  uuid: string;
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
  uuid: string;
  lote_uuid: string;
  tipo:"nota";
  type: "FeatureCollection";
  features: PuntoRecorrida[];
  fecha: string;
  nombre: string;
  proxima_visita?: string;
  last_updated: LastUpdateTag;
  created: CreatedTag;
}

/* Inicializadores */
const empty_punto_properties = (id: string, orden ?: number) => {
  let props: PropertiesPunto = {
    _id: id,
    orden:orden ?? -1,
    nombre: get("punto_#") + orden ?? "undefined",
    detalles:[],
    last_updated: { last_updated: "", last_updated_by: "" },
    created: { created: "", created_by: "" },
  };
  return props;
};

export const empty_punto = (coord: LngLatLike, orden? : number) => {
  let un_id = uuidv7();
  let empty_props = empty_punto_properties(un_id, orden);
  let punto: PuntoRecorrida = {
    _id: un_id,
    uuid:un_id,
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [coord.lng, coord.lat],
    },
    properties: empty_props,
  };
  return punto;
};

export const empty_recorrida = (lote_uuid : string, uuid ?: string ) => {
  let un_id = uuid ?? uuidv7()
  let er : Recorrida = {
    _id: un_id,
    uuid: un_id,
    lote_uuid : lote_uuid,
    type: "FeatureCollection",
    tipo:"nota",
    fecha: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    nombre: get("recorrida") + " " + format(new Date(), "yyyy-MM-dd"),
    proxima_visita: "",
    last_updated: { last_updated: "", last_updated_by: "" },
    created: { created: "", created_by: "" },
    features: [],
  };
  return er;
};

