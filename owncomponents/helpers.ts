import { Campo } from "./tipos/campos";
import { format, isAfter, isBefore, isWithinInterval } from "date-fns";
import { gbl_state } from "./state";
import parseISO from "date-fns/parseISO";
import { ro } from "date-fns/locale";
import { Actividad } from "./depositos/depositos-types";
import { Lote } from "./tipos/lotes";
import { RouterLocation } from "@vaadin/router";
import { Campana } from "./tipos/tipos-varios";
import { Cultivo, CultivoAplicacion } from "./insumos/insumos-types";

import axios from "axios";
var img_bucket_url =
  "https://testbucketgarrapollo.s3.us-south.cloud-object-storage.appdomain.cloud/";

const emptyGJ = {
  type: "FeatureCollection",
  features: []
};

let touchEvent = "ontouchstart" in window ? "touchstart" : "click";

async function hashMessage(message) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}

const layer_visibility = (map, layer_id, status) => {
  map.setLayoutProperty(layer_id, "visibility", status ? "visible" : "none");
};

const base_url = import.meta.env.VITE_COUCHDB_URL;

export const base_url_tele = import.meta.env.VITE_TELEMETRIA_URL;

const deepcopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

const sendEvent = (name, details) => {
  let event = new CustomEvent(name, {
    detail: details,
    bubbles: true,
    composed: true
  });
  this.dispatchEvent(event);
};

const normalizar_username = (un) => {
  let minusculas = un.replaceAll(" ", "_").toLowerCase();
  return minusculas;
};

const get_lote_doc = async (db: PouchDB.Database, uuid: string) => {
  let campos_result = await db.allDocs({
    include_docs: true,
    startkey: "campos_",
    endkey: "campos_\ufff0"
  });

  let campos_docs = campos_result.rows;

  let result = undefined;
  campos_docs.forEach(({ doc }) => {
    // console.log(doc);
    let _lote_doc = doc.lotes.find((lote) => lote.properties.uuid === uuid);

    if (_lote_doc) {
      result = _lote_doc;
    }
  });

  return result;

  // .then((doc) => {
  //   this._campo_doc = doc;
  //   this._lote_doc =
  //     doc.lotes.filter(
  //       (lote) => lote.properties.nombre === this.lote_nombre
  //     )[0] || {};

  //   const someContext = aplicacionMachine.initialState.context;
  //   someContext.detalles.hectareas = this._lote_doc.properties.hectareas;
  //   this.init_fsm(someContext);

  //   this.reload_actividades();

  // document.getElementById('actividades-timeline').actividades = this._lote_doc.properties.actividades;
};

const get_lote_by_names = async (
  db: PouchDB.Database,
  campo_id: string,
  lote_nombre: string
) => {
  let campo_doc = await db.get(campo_id);

  let result = undefined;

  let _lote_doc = campo_doc.lotes.find(
    (lote) => lote.properties.nombre === lote_nombre
  );

  if (_lote_doc) {
    result = _lote_doc;
  }
  return result;
};

const get_actividad_by_uuid = async (uuid) => {};

export const gbl_docs_starting = async (
  key: string,
  devolver_docs: boolean = false,
  attachments: boolean = false,
  binary: boolean = false
) => {
  return gbl_state.db
    .allDocs({
      include_docs: devolver_docs,
      attachments: attachments,
      binary: binary,
      startkey: key,
      endkey: key + "\ufff0"
    })
    .then((result) => {
      return result;
    });
};

export const only_docs = (alldocs: PouchDB.Core.AllDocsResponse<{}>) => {
  if (alldocs.rows.length > 0) {
    return alldocs.rows.map((row) => {
      return row.doc;
    });
  } else {
    return [];
  }
};

export const actividades_y_ejecuciones = async (uuid_del_lote) => {
  let acts: Actividad[] = await gbl_docs_starting(
    "actividad",
    true,
    true,
    true
  ).then(only_docs);

  let s = acts.filter(({ lote_uuid }) => lote_uuid === uuid_del_lote);

  let _actividades_docs = filtro_esta_temporada(s.reverse());

  console.log("ACTIVIDADES", _actividades_docs, acts);

  let result = await gbl_state.db.allDocs({
    startkey: "ejecucion:",
    endkey: "ejecucion:\ufff0"
  });

  let respuesta: { actividad: Actividad; ejecucion_id: string }[] = [];

  if (result.rows) {
    // Iter 1: Actividades
    _actividades_docs.forEach((actividad) => {
      let midoc = result.rows.find((doc) => doc.id.includes(actividad.uuid));
      respuesta.push({ actividad: actividad, ejecucion_id: midoc?.id });
    });

    // Ordenar respuesta teniendo en cuenta la ejecución.
    respuesta.sort((a, b) => {
      // Si tiene ejecucion usar la fecha de ejecucion
      let fecha_1 = a.ejecucion_id
        ? parseISO(a.ejecucion_id.split(":")[1])
        : parseISO(
            a.actividad.tipo === "nota"
              ? a.actividad.fecha
              : a.actividad.detalles.fecha_ejecucion_tentativa
          );
      let fecha_2 = b.ejecucion_id
        ? parseISO(b.ejecucion_id.split(":")[1])
        : parseISO(
            b.actividad.tipo === "nota"
              ? b.actividad.fecha
              : b.actividad.detalles.fecha_ejecucion_tentativa
          );
      return isBefore(fecha_1, fecha_2) ? 1 : -1;
    });
  }

  console.log("Respuesta actividades y ejecuciones post orden", respuesta);

  return respuesta;
};

const filtro_esta_temporada = (actividades: Actividad[]) => {
  let inicio = parseISO(gbl_state.campana_seleccionada.inicio);
  let fin = parseISO(gbl_state.campana_seleccionada.fin);
  let deesta = actividades.filter((act) => {
    let fecha_str =
      act.tipo === "nota" ? act.fecha : act.detalles.fecha_ejecucion_tentativa;
    let fecha = parseISO(fecha_str);
    return isWithinInterval(fecha, { start: inicio, end: fin });
  });
  return deesta;
};

export const es_esta_campana = (isofecha) => {
  let end = parseISO(gbl_state.campana_seleccionada.fin);
  let start = parseISO(gbl_state.campana_seleccionada.inicio);
  let fecha = parseISO(isofecha);
  return isWithinInterval(fecha, { start: start, end: end });
};

const crearWorkspaceDB = (nombre, user, pass) => {};

const setPermisosWorkspaceDB = (nombre, user, pass) => {};

const getPermisosWorkspaceDB = (nombre, user, pass) => {};

/** la fecha/hora en utc */
export const format_iso_c = (date) => format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
export const format_min = (date) => format(date, "yyyy-MM-dd'T'HH:mm");

export const createMenuDots = (iconName: string) => {
  const item = document.createElement("vaadin-context-menu-item");
  item.setAttribute("style", "padding:0px;");
  const icon = document.createElement("vaadin-icon");
  icon.setAttribute("icon", `vaadin:${iconName}`);
  item.appendChild(icon);
  return item;
};

export const get_lote_detalles_by_uuid = async (uuid: string) => {
  let campos_docs = await gbl_docs_starting("campos_", true).then(only_docs);

  let result: Lote = null;
  campos_docs.forEach((doc) => {
    console.log(doc);
    let _lote_doc: Lote = doc.lotes.find(
      (lote) => lote.properties.uuid === uuid
    );

    if (_lote_doc) {
      result = _lote_doc;
    }
  });

  return result;
};

export const get_campo_detalles_by_uuid = async (uuid: string) => {
  let campos_docs = await gbl_docs_starting(uuid, true).then(only_docs);

  let result: Object = null;
  if (campos_docs.length > 0) {
    result = campos_docs;
  }
  return result;
};

export const url_param = (location: RouterLocation, param) => {
  return new URLSearchParams(location.search).get(param);
};

export const buscar_ultima_siembra = async (lote_uuid: string) => {
  // Act y ejecucioes para esta campaña ordenadas
  let aye = await actividades_y_ejecuciones(lote_uuid);
  let siembra = aye.find((a) => {
    let act = a.actividad;
    return act.tipo === "siembra";
  });

  let cultivo: Cultivo = null;
  if (siembra) {
    let t = siembra.actividad.detalles.dosis.find(
      (d) => d.insumo.tipo?.key === "semillas"
    );
    // t es la primera linea de dosis con semillas
    if (t) {
      cultivo = t.insumo.cultivo;
    }
  }
  console.log("Ultima Siembra", lote_uuid, siembra, cultivo);
  return cultivo;
};

function djb2(str) {
  var hash = 5381;
  for (var i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i); /* hash * 33 + c */
  }
  return hash;
}

function hashStringToColor(str) {
  var hash = djb2(str);
  var r = (hash & 0xff0000) >> 16;
  var g = (hash & 0x00ff00) >> 8;
  var b = hash & 0x0000ff;
  return (
    "#" +
    ("0" + r.toString(16)).substr(-2) +
    ("0" + g.toString(16)).substr(-2) +
    ("0" + b.toString(16)).substr(-2)
  );
}



export const campo_guardar = async (campodoc: Campo) => {
  return gbl_state.db.put(campodoc);
};

export const upload_file = async (fileblob: File) => {
  let formData = new FormData();
  formData.append("file", fileblob, fileblob.name);
  // const data = new URLSearchParams();
  // data.append('file',fileblob);

  return fetch("/attachments", {
    method: "post",
    body: formData
  });
};

export const empty_feature_collection = () => {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          coordinates: [],
          type: "Polygon"
        }
      }
    ]
  };
};

export const r2 = (d: number) => {
  return parseFloat(d.toFixed(2));
};

export const fp_platform_files = async (doc: string) => {
  let url =
    "https://agrotools.qts-ar.com.ar/couchdb/" + "fieldpartner-platform/" + doc;

  console.log("URL", url);
  let r = await axios.get(url, {
    auth: {
      username: "appreader",
      password: "fieldpartner"
    }
  });
  return r.data;
};

export {
  emptyGJ,
  base_url,
  touchEvent,
  deepcopy,
  sendEvent,
  layer_visibility,
  hashMessage,
  normalizar_username,
  get_lote_doc,
  crearWorkspaceDB,
  setPermisosWorkspaceDB,
  getPermisosWorkspaceDB,
  get_lote_by_names
};
