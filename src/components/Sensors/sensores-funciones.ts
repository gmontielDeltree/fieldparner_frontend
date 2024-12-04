import { filter } from "jszip";
import distance from "@turf/distance";
import { gbl_state } from "../../../owncomponents/state";
import { DailyTelemetryCard, DeviceDetalles } from "./sensores-types";
import devices_modelos from "./devices_modelos";
import { parse, parseISO, toDate } from "date-fns";
import { LngLatLike } from "mapbox-gl";
import {
  get_lote_detalles_by_uuid,
  only_docs,
} from "../../../owncomponents/helpers";
import centroid from "@turf/centroid";
import format from "date-fns/format";
import ApexCharts from "apexcharts";
import { rollup, sum } from "d3-array";

/**
 *
 * @returns Devuelve una lista de los detalles de los sensored/dispositivos
 */
export const listar_sensores = async () => {
  return gbl_state.db_sensores_pro
    .get("lista_public_devices:unico")
    .then((lista) => {
      console.log("1. Documento lista_public_devices:unico:", lista);
      let public_devices = lista.public_devices as string[];
      console.log("2. Array de public_devices:", public_devices);
      return sensores_detalles_single_call(public_devices);
    });
};

export const sensores_detalles = async (uuid: string) => {
  return gbl_state.db_sensores_pro.get(uuid + ":detalles").then((d) => {
    return d as unknown as DeviceDetalles;
  });
};
export const sensores_detalles_single_call = async (uuids: string[]) => {
  let keys = uuids.map((uuid) => uuid + ":detalles");
  console.log("3. Keys que se van a buscar:", keys);

  return gbl_state.db_sensores_pro
    .allDocs({ include_docs: true, keys: keys })
    .then(only_docs)
    .then((d) => {
      console.log("4. Detalles completos de los dispositivos:", d);
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
      if (r.rows.length > 0) {
        let cts = r.rows as CouchDBTimeSeriesPoint[];
        let ts = cts.map((c) => {
          return [c.key[2], c.value];
        });
        console.log("Timeseries", tsname, ts);

        return ts as TimeSeriesPoint[];
      } else {
        return [] as TimeSeriesPoint[];
      }
    });
};

interface CouchDBTimeSeriesPoint {
  id: string;
  key: [string, string, number];
  value: number;
}

interface TimeSeriesPoint {
  [index: number]: number;
}

interface ApexChartsDataPoint {
  x: any;
  y: number;
}

export const get_pluviometro_daily_value = async (
  uuid: string,
  fecha: string
) => {
  // fecha yyyymmdd
  let hoy_como_date = parse(fecha, "yyyyMMdd", new Date());
  let ts_start = hoy_como_date.getTime() / 1000;
  let ts_end = hoy_como_date.getTime() / 1000 + 24 * 3600;
  let data_de_hoy = await get_timeseries_by_name_agregated(
    uuid,
    "pluviometro",
    ts_start,
    ts_end,
    "dia"
  );
  return data_de_hoy[0].data[0].y ?? 0;
};

export const get_timeseries_by_name_agregated = async (
  uuid,
  tsname,
  start,
  end,
  tipo
) => {
  console.log("TIPO", tipo);
  let ts = await get_timeseries_by_name(uuid, tsname, start, end);
  let etiquetado;
  let grouped;
  let data_proper: ApexChartsDataPoint[] = [];
  if (tipo === "hora") {
    etiquetado = ts.map((p) => [
      format(new Date(p[0] * 1000), "yyyyMMdd HH"),
      p[1],
    ]);
    grouped = rollup(
      etiquetado,
      (v) => parseFloat(sum(v, (d) => d[1]).toFixed(2)),
      (p) => p[0]
    );
  } else if (tipo === "dia") {
    etiquetado = ts.map((p) => [
      format(new Date(p[0] * 1000), "yyyyMMdd"),
      p[1],
    ]);
    // console.log("GROUPED DIA",grouped)
    grouped = rollup(
      etiquetado,
      (v) => parseFloat(sum(v, (d) => d[1]).toFixed(2)),
      (p) => p[0]
    );
  } else if (tipo === "mes") {
    etiquetado = ts.map((p) => [format(new Date(p[0] * 1000), "yyyyMM"), p[1]]);
    grouped = rollup(
      etiquetado,
      (v) => parseFloat(sum(v, (d) => d[1]).toFixed(2)),
      (p) => p[0]
    );
  } else if (tipo === "ano") {
    etiquetado = ts.map((p) => [format(new Date(p[0] * 1000), "yyyy"), p[1]]);
    grouped = rollup(
      etiquetado,
      (v) => parseFloat(sum(v, (d) => d[1]).toFixed(2)),
      (p) => p[0]
    );
  }

  // map to array de ApexChartsDataPoint
  let array_form = Array.from(grouped, ([key, value]) => ({
    x: key,
    y: value,
  }));
  console.log("Pluviometro por dia", grouped, array_form);
  data_proper = array_form as ApexChartsDataPoint[];

  // https://apexcharts.com/docs/series/
  // 2.3) Category paired values
  return [{ data: data_proper }]; // el resultado se puede usar en series de apexCharts
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
  console.log("Coordenadas", coordenadas);

  // get lote y centro
  let lote = await get_lote_detalles_by_uuid(lote_uuid);
  let centro_del_lote = centroid(lote.geometry);
  let distancias = coordenadas.map((c) => {
    let distancia = distance([c.posicion[0], c.posicion[1]], centro_del_lote, {
      units: "kilometers",
    });
    return { dev: c.device_id, distancia: distancia };
  });

  let distancia_ordenadas = distancias.sort(
    (a, b) => a.distancia - b.distancia
  );
  console.log("Distancias desde el lote a centrales", distancia_ordenadas);
  console.log("La central mas cercana es", distancia_ordenadas[0].dev);
  return {
    device_uuid: distancia_ordenadas[0].dev,
    distancia: distancia_ordenadas[0].distancia,
  };
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
      return tes.map((dt) => {
        let d = dt as unknown as DailyTelemetryCard;
        let lat = d.data.find((mags) => mags.mag === "latitud")?.value;
        let lng = d.data.find((mags) => mags.mag === "longitud")?.value;
        console.log("lng,lat", lng, lat, d, tes);
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
