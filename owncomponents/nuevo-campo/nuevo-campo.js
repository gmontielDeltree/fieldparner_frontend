import { LitElement, html } from "lit";
import area from "@turf/area";
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

    this.addEventListener("guardargeometria", (e) => {
      console.log("guardar_nueva_geometria", e.detail.feature);
      this.show = false;

      let campo_geojson = e.detail.feature;
      let nombre = e.detail.nombre;

      campo_geojson.properties.hectareas =
        Math.round((area(campo_geojson) / 10000) * 100) / 100;

      console.log("TIENE HAS", campo_geojson);

      this.campos_db.put(
        {
          _id: "campos_" + nombre,
          nombre: nombre,
          campo_geojson: campo_geojson,
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
