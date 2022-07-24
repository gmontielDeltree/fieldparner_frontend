import { tr } from "date-fns/locale";
import PouchDB from "pouchdb";
import { base_url } from "../helpers.js";
import format from 'date-fns/format'

/** Helper para extraer la telemetria */
const extract_tele = (key, tele) => {
  let f = tele.data.filter((punto) => {
     //console.log('PUNTO', punto, key)
    return punto['mag'] === key;
  });

  //console.log("F", f)
  return f[0];
};

class Devices {
  db = new PouchDB(base_url + "processed_device_telemetry");

  private _devices_names: string[] = [];

  _devices_last_telemetry: any[] = [];
  
  devices_init = () => {
    this.db
      .get("lista_public_devices:unico")
      .then(({ public_devices }: any) => {
        this._devices_names = public_devices;
      });
  };

  devices_publicos_get = async () => {
    let { public_devices } = await this.db.get("lista_public_devices:unico");

    this._devices_names = public_devices;

   let hoy = format(
    new Date(),
    'yyyyMMdd'
        )
    // Construir la keys para last telemetry
    let keys = this._devices_names.map((device_name) => {
      return device_name + ":daily:" + hoy;
    });

    let r = await this.db.allDocs({ keys: keys, include_docs: true });

    this._devices_last_telemetry = r?.rows.map((r) => r.doc) || [];

    console.log("PUBLIC DEVICES", this._devices_last_telemetry);
    console.log("RESULT", public_devices);

    return this._devices_last_telemetry;
  };

  devices_publicos_daily_get = async (dia) => {

	let dia_str = dia
	let { public_devices } = await this.db.get("lista_public_devices:unico");
    
	this._devices_names = public_devices;
    
	// Construir la keys para last telemetry
	let keys = this._devices_names.map((device_name) => {
	  return device_name + ":daily:" + dia_str;
	});
    
	let r = await this.db.allDocs({ keys: keys, include_docs: true });
    
	let docs = r?.rows.map((r) => r.doc) || [];
    
	console.log("PUBLIC DEVICES DAILY", docs);
    
	return docs ; 
      };

  async get_details(device_id :string){
    try{
      let doc_detalles = await this.db.get(device_id + ":detalles")
      return doc_detalles;
    }catch (e){
      console.error("Error get_details",e)
    }

  }
}

export { Devices, extract_tele };
