import { gbl_state } from "../state";
import { DeviceDetalles } from "./sensores-types";

/**
 *
 * @returns Devuelve una lista de los detalles de los sensored/dispositivos
 */
export const listar_sensores = async () => {
  return gbl_state.db_sensores_pro
    .get("lista_public_devices:unico")
    .then((lista) => {
      let public_devices = lista.public_devices as string[];
      return Promise.all(public_devices.map(sensores_detalles));
    });
};

export const sensores_detalles = async (uuid: string) => {
  return gbl_state.db_sensores_pro.get(uuid + ":detalles").then((d) => {
    return d as unknown as DeviceDetalles;
  });
};

export const sensores_valores_promedios = async (
  dev: DeviceDetalles,
  start: Date,
  end: Date
) => {
	let start_ts = Math.floor(start.getTime() / 1000)
	let end_ts = Math.floor(end.getTime() / 1000)

	
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
