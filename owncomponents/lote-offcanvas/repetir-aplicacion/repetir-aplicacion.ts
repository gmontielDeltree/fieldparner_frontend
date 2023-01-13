import { RouterLocation } from "@vaadin/router";
import { LitElement, html, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Actividad } from "../../depositos/depositos-types";
import "./repetir-aplicacion-dosis";
import "./repetir-aplicacion-selector";
import gbl_state from "../../state";
import { DoubleClickZoomHandler } from "mapbox-gl";

@customElement("repetir-aplicacion")
export class RepetirAplicacion extends LitElement {
  @state({ hasChanged: (o, n) => false })
  campos: any[] = [];

  @state()
  loaded: boolean = false;

  @state()
  selected_lotes: any[] = [];

  @state()
  paso: number = 0;

  @state()
  actividad: Actividad;

  @property()
  location: RouterLocation;

  constructor() {
    super();
    this.addEventListener("seleccion-campo", (e: CustomEvent) => {
      let lote = e.detail;
      this.selected_lotes.push(lote);
      this.selected_lotes = [...this.selected_lotes];
    });

    this.addEventListener("repetir-siguiente", (e: CustomEvent) => {
      this.paso = this.paso + 1;
      this.selected_lotes = e.detail;
    });

    this.addEventListener("repetir-atras", (e: CustomEvent) => {
      this.paso = this.paso - 1;
    });
  }

  getActividad() {
    let act_id = decodeURIComponent(
      this.location.params.uuid_actividad as string
    );
    console.log("ACTID", act_id, this.location.params);
    gbl_state.db.get(act_id).then((doc) => {
      this.actividad = doc as unknown as Actividad;
      console.log("ACT", this.actividad);
    });
  }

  getCampos() {
    gbl_state.db
      .allDocs({
        include_docs: true,
        startkey: "campos",
        endkey: "campos\ufff0",
      })
      .then(({ rows }) => {
        this.campos = rows.map(({ doc }) => doc);
        console.log("Campos", this.campos);
        this.loaded = true;
      });
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    console.log("Repetir-WillUpdate", _changedProperties.has("location"));
    if (_changedProperties.has("location")) {
      this.getActividad();
      this.getCampos();
    }
  }

  render() {
    console.count("Repetir-Render");
    if (this.loaded) {
      if (this.paso === 0) {
        return html` <repetir-aplicacion-selector .campos=${this.campos} /> `;
      } else if (this.paso === 1) {
        return html`
          <repetir-aplicacion-dosis
            .lotes=${this.selected_lotes}
            .actividad=${this.actividad}
          />
        `;
      }
    }

    return null;
  }
}
