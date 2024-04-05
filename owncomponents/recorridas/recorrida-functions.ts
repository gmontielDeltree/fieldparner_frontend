import axios from "axios";
import { gbl_state } from "../state";
import { Recorrida, RecorridaInforme } from "./recorrida-types";
import { format, parseISO } from "date-fns";
import jsreport from "@jsreport/browser-client";
import { uuidv7 } from "uuidv7";
import { get_lote_detalles_by_uuid } from "../helpers";

export const getRecorrida = async (id: string) => {
  return await gbl_state.db.get(id);
};

export const saveRecorrida = async (r: Recorrida) => {
  console.log("R1", r);
  // Get el documento existente
  if (r._rev) {
    let doc: Recorrida = await gbl_state.db.get(r._id);
    if (doc.fecha !== r.fecha) {
      // Las fechas son diferentes, borrar el doc existe
      await gbl_state.db.remove(doc);
      delete r._rev;
    }
  }

  let nota_uuid = r.uuid;
  let fecha = format(parseISO(r.fecha), "yyyyMMdd");

  r._id = "actividad:" + fecha + ":" + nota_uuid;
  console.log("R2", r);

  return gbl_state.db.put(r);
};

export const deleteRecorrida = (r: Recorrida) => {
  return gbl_state.db.remove((<unknown>r) as PouchDB.Core.RemoveDocument);
};

const mapbox_static_url = (geojson) =>
  `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/static/geojson(${geojson})/auto/500x300?access_token=pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw`;

const make_report = async (r: Recorrida) => {
  let uuid = uuidv7();

  let lote_geojson = await get_lote_detalles_by_uuid(r.lote_uuid);
  r.features.push(lote_geojson);
  r.features = r.features.reverse();
  console.log("LOTE PARA RECORRIDA", lote_geojson, r);
  let recorrida_static_map_url = mapbox_static_url(
    encodeURIComponent(JSON.stringify(r))
  );
  console.log("Recorrida MB URL", recorrida_static_map_url);

  let report: RecorridaInforme = {
    _id: uuid,
    uuid: uuid,
    recorrida: r,
    recorrida_map_url: "https://i.stack.imgur.com/dApg7.png",
    meteorologia: [],
    logo_compania:
      "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg",
    indices: [
      { name: "NDVI", url: "test" },
      { name: "NDRE", url: "https://i.stack.imgur.com/dApg7.png" }
    ]
  };

  return report;
};

export const openReportRecorrida = async (r: Recorrida) => {
  let report = make_report(r);
  console.log("Reporte JSON", report);

  jsreport.serverUrl = import.meta.env.VITE_REPORTS_URL;
  jsreport.headers["Authorization"] =
    "Basic " + btoa(import.meta.env.VITE_REPORTS_CRED);

  const report_pdf = await jsreport.render({
    template: {
      name: "/recorrida/invoice-main"
    },
    data: report
  });

  // report_pdf.openInWindow({ title: r.nombre })
};
