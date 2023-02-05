import { gbl_state } from "../state";
import { DeviceDetalles } from "./sensores-types";
import devices_modelos from './devices_modelos';
import { parseISO } from 'date-fns';

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

/*
  Devuelve una lista con los promedios.
  {temperatura : 34.3}
*/
export const sensores_valores_promedios = async (
  dev: DeviceDetalles,
  start_str: string,
  end_str: string
) => {
	let start_ts = Math.floor(parseISO(start_str).getTime() / 1000)
	let end_ts = Math.floor(parseISO(end_str).getTime() / 1000)

  // Que series/sensores contiene este device
  let lista_sensores : string[] = devices_modelos[dev.tipo].sensores_reales
  let result = lista_sensores.map((tsname)=>get_timeseries_avg_by_name(dev.device_id,tsname,start_ts,end_ts))
  let promedios = await Promise.all(result)
  //console.log('promedios',promedios)
  // Rearange para que sea facil acceso y calculo el promedio
  let promedios_rearranged : Object = {}
  promedios.forEach((p)=>{
    if(p){ //p puede ser null
      let con_2_dec = +((p.sum/p.count).toFixed(1))
      promedios_rearranged[p.tsname] = {...p,avg:con_2_dec}
    }
  })
  return promedios_rearranged
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
  let _stats : {tsname:string,sum:number,count:number,min:number,max:number,sumsqr:number} = null
  return gbl_state.db_sensores_raw
    .query("telemetria/ts_avg_by_name", { startkey: key, endkey: endkey })
    .then((r) => {
      //console.log("ESTO ES COOL", r);
     //sum: 415.5999999999999, count: 179, min: 0, max: 7.7, sumsqr: 2011.0334
     if(r.rows.length>0 ){
      _stats  =  {...r.rows[0].value,tsname:tsname}
      return _stats
     }else{
      return _stats
     }
    });
};