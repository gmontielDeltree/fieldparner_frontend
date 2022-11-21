import { LitElement, html } from "lit";
import area from "@turf/area";
import convex from '@turf/convex'

import uuid4 from "uuid4";
export class NuevoCampo extends LitElement {
  static properties = {
    map: {},
    draw: {},
    show: {},
    campos_db: {},
  };

  constructor() {
    super();
    this.show = false;
    
    this.addEventListener("cerrargeometria", (e) => {
      console.log("cerrar_nueva_geometria");
      this.show = false;
    });

    this.addEventListener("guardargeometriasmultiples",(e) => {
      console.log("guardargeometriasmultiples", e.detail);

      // Añadir el campo
      let campo_geojson = convex(e.detail.features);

      console.log("UNION", campo_geojson)
      let nombre = e.detail.nombre;
      let uuid = uuid4()

      
      campo_geojson.properties.hectareas =
      Math.round((area(campo_geojson) / 10000) * 100) / 100;

      console.log("TIENE HAS", campo_geojson);




      // Añadir los lotes
      let lotes = e.detail.features.features
      lotes.forEach((lote) => {
        lote.properties.nombre = lote.properties?.name;
        lote.properties.uuid = uuid4()
        lote.id = lote.properties.uuid
        lote.properties.campo_parent_id = "campos_" + nombre;
        lote.properties.hectareas = area(lote)
        lote.properties.actividades = []
      })



      this.campos_db.put(
        {
          _id: "campos_" + nombre,
          nombre: nombre,
          campo_geojson: campo_geojson,
          uuid : uuid,
          lotes: lotes,
        },
        (err, result) => {
          if (!err) {
            console.log("Successfully posted a Campo!");
          } else {
            console.log(err);
          }
        }
      );

    })

    this.addEventListener("guardargeometria", (e) => {
      console.log("guardar_nueva_geometria", e.detail.feature);
      this.show = false;

      let campo_geojson = e.detail.feature;
      let nombre = e.detail.nombre;
      let uuid = uuid4()

      campo_geojson.properties.hectareas =
        Math.round((area(campo_geojson) / 10000) * 100) / 100;

      console.log("TIENE HAS", campo_geojson);

      this.campos_db.put(
        {
          _id: "campos_" + nombre,
          nombre: nombre,
          campo_geojson: campo_geojson,
          uuid : uuid,
          lotes: [],
        },
        (err, result) => {
          if (!err) {
            console.log("Successfully posted a Campo!");
          } else {
            console.log(err);
          }
        }
      );
    });
  }

  render() {
    return this.map
      ? html`<nueva-geometria-ui
          id="nuevo-campo-ui"
          .tipo="campo"
          .mapa=${this.map}
          ._draw=${this.draw}
          .show=${this.show}
        ></nueva-geometria-ui>`
      : null;
  }
}

customElements.define("nuevo-campo", NuevoCampo);
