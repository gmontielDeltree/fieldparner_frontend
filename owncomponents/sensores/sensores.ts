import { format_iso_c } from "./../helpers";
import { tr } from "date-fns/locale";
import PouchDB from "pouchdb";
import { base_url, touchEvent } from "../helpers";
import format from "date-fns/format";
import {
  DataPoints,
  DeviceDetalles,
  DailyTelemetryCard,
} from "./sensores-types.js";
import { Map, Marker, Popup } from "mapbox-gl";
import { formatISO, fromUnixTime } from "date-fns";
/** Helper para extraer la telemetria */
const extract_tele = (key, tele) => {
  let f = tele.data.filter((punto) => {
    //console.log('PUNTO', punto, key)
    return punto["mag"] === key;
  });

  //console.log("F", f)
  return f[0];
};

function unixToDate(date) {
  var time = new Date(date * 1000);
  return time.toISOString();
}

const valor = (card, key) => {
  if (extract_tele(key, card)) {
    return extract_tele(key, card)?.value;
  } else {
    return "N/A";
  }
};

class Devices {
  db = new PouchDB(base_url + "processed_device_telemetry");
  db_raw = new PouchDB(base_url + "telemetry_raw");

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

    let hoy = format(new Date(), "yyyyMMdd");
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

  get_all_details = async () => {
    let { public_devices } = await this.db.get("lista_public_devices:unico");

    this._devices_names = public_devices;

    // Construir la keys para last telemetry
    let keys = this._devices_names.map((device_name) => {
      return device_name + ":detalles";
    });

    let r = await this.db.allDocs({ keys: keys, include_docs: true });

    let detalles: unknown = r?.rows.map((r) => r.doc) || [];

    return detalles as Promise<DeviceDetalles[]>;
  };

  get_daily_cards = async (dia: string) => {
    return this.devices_publicos_daily_get(dia);
  };

  get_device_daily_card = async (uuid: string, dia_str: string) => {
    let doc: unknown = this.db.get(uuid + ":daily:" + dia_str);
    return (await doc) as Promise<DailyTelemetryCard>;
  };

  devices_publicos_daily_get = async (dia: string) => {
    let dia_str = dia;
    let { public_devices } = await this.db.get("lista_public_devices:unico");

    this._devices_names = public_devices;

    // Construir la keys para last telemetry
    let keys = this._devices_names.map((device_name) => {
      return device_name + ":daily:" + dia_str;
    });

    let r = await this.db.allDocs({ keys: keys, include_docs: true });

    let docs: unknown = r?.rows.map((r) => r.doc) || [];

    console.log("PUBLIC DEVICES DAILY", docs);

    return docs as Promise<DailyTelemetryCard[]>;
  };

  async get_raw_data_for_charts(uuid) {
    let docs = await this.db_raw.allDocs({
      include_docs: true,
      startkey: uuid + ":",
      endkey: uuid + ":\ufff0",
    });

    let data = await docs.rows.map((d) => d.doc);
    let ts_a = [];
    let t1_a = [];
    let h1_a = [];
    let t2_a = [];
    let h2_a = [];

    let r = data.map((dp) => {
      // t1
      let ts = unixToDate(dp.ts - 3 * 3600);
      let t1 = dp.data[0].value;
      let h1 = dp.data[1].value;
      let t2 = dp.data[2].value;
      let h2 = dp.data[3].value;

      ts_a.push(ts);
      t1_a.push(t1);
      h1_a.push(h1);
      t2_a.push(t2);
      h2_a.push(h2);
    });

    return { ts: ts_a, t1: t1_a, h1: h1_a, t2: t2_a, h2: h2_a };
  }

  async add_markers_to_map(map: Map) {
    let devices_last_telemetry = await this.devices_publicos_get();
    let detalles = await this.get_all_details();

    //console.log("LAST TELEMETRY", devices_last_telemetry);

    devices_last_telemetry.map((telemetria: DailyTelemetryCard) => {
      try {
        let latitud = extract_tele("latitud", telemetria).value;
        let longitud = extract_tele("longitud", telemetria).value;

        let temperatura = extract_tele("temperatura", telemetria).value;
        let humedad = extract_tele("humedad", telemetria).value;
        let presion = extract_tele("presion", telemetria).value;

        const el = document.createElement("div");
        el.className = "marker";

        el.style.backgroundImage = `url('/centralmeteorologica70_90.webp')`;
        el.style.backgroundSize = "cover";

        el.style.width = `35px`;
        el.style.height = `45px`;
        //el.style.backgroundSize = '100%';
        el.style.cursor = "pointer";

        let detalles_de_este = detalles.find(
          (d) => d.device_id === telemetria.device_id
        );
        if (detalles_de_este) {
          // Popup que no se cierra ni tiene boton de cerrar
          const popup = new Popup({ closeOnClick: false, closeButton: false });
          popup.setHTML(`<div style:'display:flex'>
          <div style='font-weight:bold'>${detalles_de_este.nombre}</div>
          <div style='font-size:10px;font-weight: lighter;'>${formatISO(
            fromUnixTime(telemetria.ts_last)
          )}</div>
            <ul style='padding-left:2em'>
              <li>Temperatura: ${temperatura}ºC</li>
              <li>Humedad: ${humedad}%</li>
              <li>Presión: ${presion}hPa.</li>
            </ul>
            </div>
          `);
          popup.setOffset([0, -45]);
          //popup.setLngLat([longitud, latitud])
          // popup.addTo(map)

          //console.info("LATLON", latitud, longitud);
          //
          const marker = new Marker({ element: el, anchor: "bottom" })
            .setLngLat([longitud, latitud])
            .setPopup(popup)
            .addTo(map);

          /** https://stackoverflow.com/questions/31448397/how-to-add-click-listener-on-marker-in-mapbox-gl-js */
          marker.getElement().addEventListener(touchEvent, () => {
            let ev = new CustomEvent("ver-telemetria-del-dia", {
              detail: telemetria,
              bubbles: true,
              composed: true,
            });
            marker.getElement().dispatchEvent(ev);
          });

          marker.getElement().addEventListener("mouseenter", () => {
            marker.togglePopup();
          });
          marker.getElement().addEventListener("mouseleave", () => {
            marker.togglePopup();
          });
        }
      } catch (e) {
        console.info("Error Al hacer el marcador de dispositivo");
      }
    });
  }

  async get_raw_data_for_charts_generic(uuid) {
    let utc_now = Date.now() / 1000;
    let utc_1_mes = utc_now - 3600 * 24 * 30;
    let docs = await this.db_raw.allDocs({
      // include_docs: true,
      limit: 10000,
      descending: true,
      endkey: uuid + ":" + utc_1_mes,
      startkey: uuid + ":" + utc_now + "\ufff0",
    });

    let ids = await docs.rows.map((d) => d.id);
    let ids_decimado = ids.filter((_, index) => {
      let c2 = index % 10 === 0;
      let c3 = index === ids.length - 1;
      return c2 || c3;
    });

    //console.log("Only IDS", ids)

    docs = await this.db_raw.allDocs({
      include_docs: true,
      //limit: 1500,
      keys: ids_decimado,
      descending: true,
      //endkey: uuid + ":",
      //startkey: uuid + ":\ufff0",
    });

    let data = await docs.rows.map((d) => d.doc);
    //console.log("Dsa",data);
    let return_value = { ts: [] };

    let r = data.map((dp) => {
      // t1
      let array_de_mediciones = dp.data as DataPoints[];
      // Hora Argentina
      return_value["ts"].push(unixToDate(dp.ts - 3 * 3600));

      array_de_mediciones.forEach((medicion: DataPoints) => {
        if (medicion.sensor_id === "temperatura") {
          if (medicion.value > 60 || medicion.value < -10) {
            return;
          }
        }

        if (medicion.sensor_id === "humedad") {
          if (medicion.value > 100 || medicion.value < 0) {
            return;
          }
        }

        if (medicion.sensor_id === "presion") {
          if (medicion.value > 1100 || medicion.value < 900) {
            return;
          }
        }

        if (return_value[medicion.sensor_id]) {
          return_value[medicion.sensor_id].push(medicion.value);
        } else {
          return_value[medicion.sensor_id] = [];
          return_value[medicion.sensor_id].push(medicion.value);
        }
      });
    });

    return return_value;
  }

  async get_details(device_id: string) {
    try {
      let doc_detalles = await this.db.get(device_id + ":detalles");
      return doc_detalles;
    } catch (e) {
      console.error("Error get_details", e);
    }
  }

  async get_timeseries_by_name(uuid, tsname, start, end) {
    let key = [uuid, tsname, start];
    let endkey = [uuid, tsname, end];
    this.db_raw
      .query("telemetria/ts_by_name", { startkey: key, endkey: endkey })
      .then((r) => {
        console.log("ESTO ES COOL", r);
      });
  }
}

const gbl_devices = new Devices();

export { Devices, extract_tele, valor, gbl_devices };
