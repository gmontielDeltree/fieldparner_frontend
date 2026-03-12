import PouchDB from "pouchdb";
import { base_url_tele, touchEvent } from "../../../owncomponents/helpers";
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
  db = new PouchDB(base_url_tele + "processed_device_telemetry");
  db_raw = new PouchDB(base_url_tele + "telemetry_raw");

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

    this._devices_last_telemetry = r?.rows
      .map((r) => r.doc)
      .filter((doc) => doc != null) || [];

    // Si no hay datos del día actual, intentar con la última fecha conocida
    if (this._devices_last_telemetry.length === 0) {
      console.warn("WEATHER STATIONS - No data for today, trying last known date (20230310)");
      keys = this._devices_names.map((device_name) => {
        return device_name + ":daily:20230310";
      });
      r = await this.db.allDocs({ keys: keys, include_docs: true });
      this._devices_last_telemetry = r?.rows
        .map((r) => r.doc)
        .filter((doc) => doc != null) || [];
    }

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

    const buildMarker = () => {
      const accent = "#6fb5f2";

      const container = document.createElement("div");
      Object.assign(container.style, {
        width: "40px",
        height: "46px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "3px",
        cursor: "pointer",
      });

      const bubble = document.createElement("div");
      Object.assign(bubble.style, {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "#ffffff",
        boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
        border: `1px solid ${accent}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 140ms ease, box-shadow 140ms ease",
      });

      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("width", "16");
      icon.setAttribute("height", "16");
      icon.setAttribute("viewBox", "0 0 24 24");
      icon.setAttribute("fill", accent);
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute(
        "d",
        "M6 14a4 4 0 0 1 3.48-3.96A5 5 0 0 1 20 12.5a3.5 3.5 0 0 1-3.5 3.5H7a3 3 0 0 1-1-5.83A4.01 4.01 0 0 1 6 14z"
      );
      icon.appendChild(path);
      bubble.appendChild(icon);

      const stem = document.createElement("div");
      Object.assign(stem.style, {
        width: "6px",
        height: "12px",
        borderRadius: "3px",
        background: accent,
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        transform: "translateY(-4px)",
      });

      container.appendChild(bubble);
      container.appendChild(stem);

      container.addEventListener("mouseenter", () => {
        bubble.style.transform = "translateY(-2px) scale(1.05)";
        bubble.style.boxShadow = "0 10px 18px rgba(0,0,0,0.16)";
      });
      container.addEventListener("mouseleave", () => {
        bubble.style.transform = "translateY(0) scale(1)";
        bubble.style.boxShadow = "0 6px 12px rgba(0,0,0,0.12)";
      });

      return container;
    };

    const ensurePopupStyle = () => {
      if (document.getElementById("weather-popup-style")) return;
      const style = document.createElement("style");
      style.id = "weather-popup-style";
      style.textContent = `
        .weather-popup .mapboxgl-popup-content {
          background: transparent;
          padding: 0;
          border: none;
          box-shadow: none;
        }
        .weather-popup .mapboxgl-popup-tip {
          border-top-color: transparent;
          border-bottom-color: transparent;
        }
      `;
      document.head.appendChild(style);
    };

    if (map["__weatherMarkers"] && Array.isArray(map["__weatherMarkers"])) {
      map["__weatherMarkers"].forEach((m) => m.remove());
    }
    map["__weatherMarkers"] = [];

    devices_last_telemetry.map((telemetria: DailyTelemetryCard) => {
      try {
        let latitud = extract_tele("latitud", telemetria).value;
        let longitud = extract_tele("longitud", telemetria).value;

        let temperatura = extract_tele("temperatura", telemetria).value;
        let humedad = extract_tele("humedad", telemetria).value;
        let presion = extract_tele("presion", telemetria).value;

        const el = buildMarker();
        ensurePopupStyle();
        let detalles_de_este = detalles.find(
          (d) => d.device_id === telemetria.device_id
        );
        if (detalles_de_este) {
          const popupContent = `<div style="
            background:#ffffff;
            color:#1f2937;
            padding:10px 12px;
            border-radius:10px;
            box-shadow:0 10px 25px rgba(0,0,0,0.12);
            border:1px solid #e5e7eb;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            font-size:13px;
            line-height:1.4;
            min-width:180px;
          ">
            <div style="font-weight:600; margin-bottom:2px;">${detalles_de_este.nombre}</div>
            <div style="font-size:11px; color:#6b7280; margin-bottom:6px;">${formatISO(
              fromUnixTime(telemetria.ts_last)
            )}</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
              <div>Temp: <strong>${temperatura}ºC</strong></div>
              <div>Humedad: <strong>${humedad}%</strong></div>
              <div>Presión: <strong>${presion} hPa</strong></div>
            </div>
          </div>`;

          const popup = new Popup({
            closeOnClick: false,
            closeButton: false,
            closeOnMove: false,
            offset: 10,
            maxWidth: "260px",
            className: "weather-popup",
          }).setHTML(popupContent);

          const marker = new Marker({ element: el, anchor: "bottom" })
            .setLngLat([longitud, latitud])
            .addTo(map);

          marker.getElement().addEventListener(touchEvent, () => {
            let ev = new CustomEvent("ver-telemetria-del-dia", {
              detail: telemetria,
              bubbles: true,
              composed: true,
            });
            marker.getElement().dispatchEvent(ev);
          });

          const showPopup = () => popup.setLngLat([longitud, latitud]).addTo(map);
          const hidePopup = () => popup.remove();
          marker.getElement().addEventListener("mouseenter", showPopup);
          marker.getElement().addEventListener("mouseleave", hidePopup);

          map["__weatherMarkers"].push(marker);
        }
      } catch (e) {
        console.info("Error Al hacer el marcador de dispositivo");
      }
    });
  }

  async add_markers_to_map_react(map: Map, onClick) {
    let devices_last_telemetry = await this.devices_publicos_get();
    let detalles = await this.get_all_details();

    console.log("WEATHER STATIONS - LAST TELEMETRY", devices_last_telemetry);
    console.log("WEATHER STATIONS - DETAILS", detalles);

    if (map["__weatherMarkers"] && Array.isArray(map["__weatherMarkers"])) {
      map["__weatherMarkers"].forEach((m) => m.remove());
    }
    map["__weatherMarkers"] = [];

    const buildMarker = () => {
      const accent = "#6fb5f2";

      const container = document.createElement("div");
      Object.assign(container.style, {
        width: "40px",
        height: "46px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "3px",
        cursor: "pointer",
      });

      const bubble = document.createElement("div");
      Object.assign(bubble.style, {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "#ffffff",
        boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
        border: `1px solid ${accent}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 140ms ease, box-shadow 140ms ease",
      });

      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("width", "16");
      icon.setAttribute("height", "16");
      icon.setAttribute("viewBox", "0 0 24 24");
      icon.setAttribute("fill", accent);
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute(
        "d",
        "M6 14a4 4 0 0 1 3.48-3.96A5 5 0 0 1 20 12.5a3.5 3.5 0 0 1-3.5 3.5H7a3 3 0 0 1-1-5.83A4.01 4.01 0 0 1 6 14z"
      );
      icon.appendChild(path);
      bubble.appendChild(icon);

      const stem = document.createElement("div");
      Object.assign(stem.style, {
        width: "6px",
        height: "12px",
        borderRadius: "3px",
        background: accent,
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        transform: "translateY(-4px)",
      });

      container.appendChild(bubble);
      container.appendChild(stem);

      container.addEventListener("mouseenter", () => {
        bubble.style.transform = "translateY(-2px) scale(1.05)";
        bubble.style.boxShadow = "0 10px 18px rgba(0,0,0,0.16)";
      });
      container.addEventListener("mouseleave", () => {
        bubble.style.transform = "translateY(0) scale(1)";
        bubble.style.boxShadow = "0 6px 12px rgba(0,0,0,0.12)";
      });

      return container;
    };

    const ensurePopupStyle = () => {
      if (document.getElementById("weather-popup-style")) return;
      const style = document.createElement("style");
      style.id = "weather-popup-style";
      style.textContent = `
        .weather-popup .mapboxgl-popup-content {
          background: transparent;
          padding: 0;
          border: none;
          box-shadow: none;
        }
        .weather-popup .mapboxgl-popup-tip {
          border-top-color: transparent;
          border-bottom-color: transparent;
        }
      `;
      document.head.appendChild(style);
    };

    devices_last_telemetry.map((telemetria: DailyTelemetryCard) => {
      try {
        console.log("WEATHER STATIONS - Processing telemetria:", telemetria);
        let latitud = extract_tele("latitud", telemetria).value;
        let longitud = extract_tele("longitud", telemetria).value;
        console.log("WEATHER STATIONS - Coords:", latitud, longitud);

        let temperatura = extract_tele("temperatura", telemetria).value;
        let humedad = extract_tele("humedad", telemetria).value;
        let presion = extract_tele("presion", telemetria).value;

        const el = buildMarker();
        ensurePopupStyle();
        let detalles_de_este = detalles.find(
          (d) => d.device_id === telemetria.device_id
        );
        if (detalles_de_este) {
          const popupContent = `<div style="
            background:#ffffff;
            color:#1f2937;
            padding:10px 12px;
            border-radius:10px;
            box-shadow:0 10px 25px rgba(0,0,0,0.12);
            border:1px solid #e5e7eb;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            font-size:13px;
            line-height:1.4;
            min-width:180px;
          ">
            <div style="font-weight:600; margin-bottom:2px;">${detalles_de_este.nombre}</div>
            <div style="font-size:11px; color:#6b7280; margin-bottom:6px;">${formatISO(
              fromUnixTime(telemetria.ts_last)
            )}</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
              <div>Temp: <strong>${temperatura}ºC</strong></div>
              <div>Humedad: <strong>${humedad}%</strong></div>
              <div>Presión: <strong>${presion} hPa</strong></div>
            </div>
          </div>`;

          const popup = new Popup({
            closeOnClick: false,
            closeButton: false,
            closeOnMove: false,
            offset: 10,
            maxWidth: "260px",
            className: "weather-popup",
          }).setHTML(popupContent);

          const marker = new Marker({ element: el, anchor: "bottom" })
            .setLngLat([longitud, latitud])
            .addTo(map);

          /** https://stackoverflow.com/questions/31448397/how-to-add-click-listener-on-marker-in-mapbox-gl-js */
          marker.getElement().addEventListener(touchEvent, (e) => {
            console.log("Marker E", e);
            e.stopPropagation();
            onClick(telemetria.device_id, telemetria._id.split(":")[2]);
          });

          const showPopup = () => popup.setLngLat([longitud, latitud]).addTo(map);
          const hidePopup = () => popup.remove();
          marker.getElement().addEventListener("mouseenter", showPopup);
          marker.getElement().addEventListener("mouseleave", hidePopup);

          map["__weatherMarkers"].push(marker);
        }
      } catch (e) {
        console.error("WEATHER STATIONS - Error creating marker:", e, telemetria);
      }
    });

    console.log("WEATHER STATIONS - Finished adding markers");
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
      // console.log("array mediciones", array_de_mediciones);

      if (uuid !== "sfdfsd") {
        return_value["ts"].push(unixToDate(dp.ts - 3 * 3600));
      } else {
        // Hora Argentina
        // TODO Mejorar esto
        if (array_de_mediciones[0].sensor_id !== "latitud") {
          // Ignorar si es un punto de posicion
          return_value["ts"].push(unixToDate(dp.ts - 3 * 3600));
        }
      }

      array_de_mediciones.forEach((medicion: DataPoints) => {
        if (medicion.sensor_id === "temperatura") {
          if (medicion.value > 60 || medicion.value < -10) {
            medicion.value = NaN;
          }
        }

        if (medicion.sensor_id === "humedad") {
          if (medicion.value > 100 || medicion.value < 0) {
            medicion.value = NaN;
          }
        }

        if (medicion.sensor_id === "presion") {
          if (medicion.value > 1100 || medicion.value < 900) {
            medicion.value = NaN;
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

    console.log("RETURN VALUE CHRATRS,", return_value);
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
