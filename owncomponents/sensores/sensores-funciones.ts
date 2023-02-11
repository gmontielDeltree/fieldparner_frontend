import { filter } from "jszip";
import distance from "@turf/distance";
import { gbl_state } from "../state";
import { DeviceDetalles } from "./sensores-types";
import devices_modelos from "./devices_modelos";
import { parseISO } from "date-fns";
import { LngLatLike } from "mapbox-gl";
import { get_lote_detalles_by_uuid, only_docs } from "../helpers";
import centroid from "@turf/centroid";
import format from "date-fns/format";

/**
 *
 * @returns Devuelve una lista de los detalles de los sensored/dispositivos
 */
export const listar_sensores = async () => {
  return gbl_state.db_sensores_pro
    .get("lista_public_devices:unico")
    .then((lista) => {
      let public_devices = lista.public_devices as string[];
      // crear keys y hacer una sola request
      return sensores_detalles_single_call(public_devices);
      //return Promise.all(public_devices.map(sensores_detalles));
    });
};

export const sensores_detalles = async (uuid: string) => {
  return gbl_state.db_sensores_pro.get(uuid + ":detalles").then((d) => {
    return d as unknown as DeviceDetalles;
  });
};

export const sensores_detalles_single_call = async (uuids: string[]) => {
  let keys = uuids.map((uuid) => uuid + ":detalles");
  return gbl_state.db_sensores_pro
    .allDocs({ include_docs: true, keys: keys })
    .then(only_docs)
    .then((d) => {
      return d as unknown as DeviceDetalles[];
    });
};

/*
  Devuelve una lista con los promedios.
  {temperatura : {..._stats,avg},
  humedad: {..._stats,avg}
  ...
}
*/
export const sensores_valores_promedios = async (
  dev: DeviceDetalles,
  start_str: string,
  end_str: string
) => {
  let start_ts = Math.floor(parseISO(start_str).getTime() / 1000);
  let end_ts = Math.floor(parseISO(end_str).getTime() / 1000);

  // Que series/sensores contiene este device
  let lista_sensores: string[] = devices_modelos[
    dev.tipo
  ].sensores_reales.filter((a: string) =>
    ["temperatura", "humedad", "velocidad", "humedad_suelo"].includes(a)
  );
  let result = lista_sensores.map((tsname) =>
    get_timeseries_avg_by_name(dev.device_id, tsname, start_ts, end_ts)
  );
  let promedios = await Promise.all(result);
  //console.log('promedios',promedios)
  // Rearange para que sea facil acceso y calculo el promedio
  let promedios_rearranged: Object = {};
  promedios.forEach((p) => {
    if (p) {
      //p puede ser null
      let con_2_dec = +(p.sum / p.count).toFixed(1);
      promedios_rearranged[p.tsname] = { ...p, avg: con_2_dec };
    }
  });
  return promedios_rearranged;
};

export const get_timeseries_by_name = async (uuid, tsname, start, end) => {
  let key = [uuid, tsname, start];
  let endkey = [uuid, tsname, end];
  return gbl_state.db_sensores_raw
    .query("telemetria/ts_by_name", { startkey: key, endkey: endkey })
    .then((r) => {
      console.log("ESTO ES COOL", r);
    });
};

export const get_timeseries_avg_by_name = async (uuid, tsname, start, end) => {
  let key = [uuid, tsname, start];
  let endkey = [uuid, tsname, end];
  let _stats: {
    tsname: string;
    sum: number;
    count: number;
    min: number;
    max: number;
    sumsqr: number;
  } = null;
  return gbl_state.db_sensores_raw
    .query("telemetria/ts_avg_by_name", { startkey: key, endkey: endkey })
    .then((r) => {
      //console.log("ESTO ES COOL", r);
      //sum: 415.5999999999999, count: 179, min: 0, max: 7.7, sumsqr: 2011.0334
      if (r.rows.length > 0) {
        _stats = { ...r.rows[0].value, tsname: tsname };
        return _stats;
      } else {
        return _stats;
      }
    });
};

export const sensores_central_mas_cercana_al_lote = async (
  lote_uuid,
  start_iso,
  end_iso
) => {
  let start_ts = Math.floor(parseISO(start_iso).getTime() / 1000);
  let end_ts = Math.floor(parseISO(end_iso).getTime() / 1000);

  // sensores con datareaos en ese intervalo
  let sensores = await listar_sensores();
  // filtro centrales con datos en el periodo
  let con_datos = await asyncFilter(sensores, async (d) => {
    let key = [d.device_id, "temperatura", start_ts];
    let endkey = [d.device_id, "temperatura", end_ts];
    let result = await gbl_state.db_sensores_raw.query(
      "telemetria/ts_avg_by_name",
      { startkey: key, endkey: endkey }
    );
    if (result.rows.length > 0) {
      return true;
    } else {
      return false;
    }
  });

  console.log("Sensores con datos", con_datos);
  let coordenadas = await sensores_posiciones(con_datos, parseISO(start_iso));
  console.log("Coordenadas",coordenadas)

  // get lote y centro
  let lote = await get_lote_detalles_by_uuid(lote_uuid);
  let centro_del_lote = centroid(lote.geometry);
  let distancias = coordenadas.map((c) => {
    let distancia = distance(
      [c.posicion[0], c.posicion[1]],
      centro_del_lote,
      { units: "kilometers" }
    );
    return { dev: c.device_id, distancia: distancia };
  });

  let distancia_ordenadas = distancias.sort(
    (a, b) => a.distancia - b.distancia
  );
  console.log("Distancias desde el lote a centrales", distancia_ordenadas);
  console.log("La central mas cercana es", distancia_ordenadas[0].dev);
  return distancia_ordenadas[0].dev as string
};

export const sensor_posicion = async (uuid: string) => {
  let key = [uuid, "latitud", {}];
  let endkey = [uuid, "latitud", {}];
  let latitud = null;
  let longitud = null;
  let ret_value: LngLatLike = { lng: null, lat: null };
  return gbl_state.db_sensores_raw
    .query("telemetria/ts_by_name", { startkey: key, endkey: endkey, limit: 1 })
    .then((r) => {
      if (r.rows.length > 0) {
        latitud = r.rows[0].value;
        key = [uuid, "longitud"];
        endkey = [uuid, "longitud"];
        return gbl_state.db_sensores_raw
          .query("telemetria/ts_by_name", {
            startkey: key,
            endkey: endkey,
            limit: 1,
          })
          .then((r) => {
            if (r.rows.length > 0) {
              longitud = r.rows[0].value;
              ret_value = { lng: longitud, lat: latitud };
              return ret_value;
            }
          });
      }
    });
};

/**
 * Listar la posicion de todos los devices con una sola call
 * @param uuid
 * @returns
 */
export const sensores_posiciones = async (
  devices: DeviceDetalles[],
  date: Date
) => {
  let date_str = format(date, "yyyyMMdd");
  let keys = devices.map((d) => d.device_id + ":daily:" + date_str);

  return gbl_state.db_sensores_pro
    .allDocs({ include_docs: true, keys: keys })
    .then(only_docs)
    .then((tes) => {
      return tes.map((d) => {
        let lat = d.data.find((mags) => mags.mag === "latitud")?.value;
        let lng = d.data.find((mags) => mags.mag === "longitud")?.value;
        console.log("lng,lat",lng,lat,d,tes)
        if (lat && lng) {
          let device_id = d.device_id;
          return { device_id: device_id, posicion: [lng, lat] };
        }
      });
    });
};

/** helper */
const asyncFilter = async (arr, predicate) => {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]);
};
