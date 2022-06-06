import { LitElement, html } from "lit-element";
import PouchDB from "pouchdb";
import variedades from "./variedades.json";
import { base_url } from "../helpers.js";

export class VariedadesLoader extends LitElement {
  static properties = {};

  constructor() {
    super();
  }

  designDocsShared() {
    let dd = {
      _id: "_design/share",
      filters: {
        by_sharing_status: function (doc, req) {
          return doc._id === "_design/share" || doc.shared === true;
        }.toString(),
        by_share_with_list: function (doc, req) {
          return  doc._id === "_design/share" || doc.share_with.includes(req.query.my_self)
        }.toString(),
      },
    };

    let shared_db = new PouchDB(base_url + "shared_campos");
    shared_db.get("_design/share").then((doc) => {
      dd["_rev"] = doc["_rev"];
      shared_db.put(dd);
    });
  }
  load() {
    const doc = (v) => {
      let especie = v["Especie"]?.replaceAll(" ", "_") || "No definido";

      let cultivar = "";
      if (typeof v.Cultivar === "string") {
        cultivar = v.Cultivar?.replaceAll(" ", "_") || "No definido";
      } else {
        cultivar = "" + v.Cultivar;
      }

      return {
        _id: especie + ":" + cultivar,
        especie: v["Especie"],
        cultivar: v["Cultivar"] || "No definido",
        solicitante: v["Solicitante"],
        uuid: v["Nro Registro"],
      };
    };

    let db = new PouchDB(base_url + "variedades");

    let docs = variedades.map(doc);

    db.bulkDocs(docs).then(() => {
      console.log("Completado");
    });
  }

  render() {
    return html``;
  }
}

customElements.define("variedades-loader", VariedadesLoader);
