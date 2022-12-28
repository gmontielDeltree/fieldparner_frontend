import { LitElement, html, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Actividad, Ejecucion } from "../../depositos/depositos-types";
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import { Router } from "@vaadin/router";
import gbl_state from "../../state";
import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/button";
import "@vaadin/details";
import "@vaadin/horizontal-layout";
import "@vaadin/upload";
import "@vaadin/menu-bar";
import { badge } from "@vaadin/vaadin-lumo-styles/badge";
import { format, parse } from "date-fns";
import { map } from "lit/directives/map.js";

@customElement("actividad-item")
export class ActividadItem extends LitElement {
  static override styles = [badge];
  @property()
  item: Actividad;

  @state()
  ejecucion: Ejecucion;

  private menu_items = [
    {
      component: this.createItem("ellipsis-dots-v"),
      tooltip: "Mas",
      children: [
        {
          text: "Editar",
          tooltip: "Edit",
          value: "edit",
        },
        {
          text: "Repetir Planificacion",
          tooltip: "Repetir",
        },
        {
          text: "Orden de Trabajo PDF",
          tooltip: "Move",
        },
        {
          text: "Compartir Orden de Trabajo",
          tooltip: "Duplicate",
        },
        {
          text: "Datos Meteorológicos",
          tooltip: "Archive",
        },
        {
          text: "Eliminar",
          tooltip: "Archive",
          value: "eliminar",
        },
      ],
    },
  ];

  createItem(iconName: string) {
    const item = document.createElement("vaadin-context-menu-item");
    const icon = document.createElement("vaadin-icon");
    icon.setAttribute("icon", `vaadin:${iconName}`);
    item.appendChild(icon);
    return item;
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("item")) {
      this.getEjecucion(this.item.uuid);
    }
  }

  getEjecucion(uuid) {
    gbl_state.db
      .allDocs({ startkey: "ejecucion:", endkey: "ejecucion:_\ufff0" })
      .then((result) => {
        if (result.rows) {
          let midoc = result.rows.find((doc) => doc.id.includes(uuid));
          if (midoc) {
            gbl_state.db.get(midoc.id).then((doc) => {
              this.ejecucion = doc as Ejecucion;
            });
          }
        }
      });
    // gbl_state.db.get("actividad")
  }

  esta_ejecutada() {
    return false;
  }

  get_fecha_plan_o_ejecucion() {
    let fecha = "";
    if (this.ejecucion) {
      fecha = this.ejecucion.detalles.fecha_ejecucion;
    } else {
      fecha = this.item.detalles.fecha_ejecucion_tentativa;
    }
    return fecha;
  }

  menu_click({ detail }) {
    //console.log("CLICK,", detail)
    let valor = detail.value.value;
    if (valor === "eliminar") {
      console.log("Borrar Actividad");
      gbl_state.db.remove(this.item);
      if (this.ejecucion) {
        gbl_state.db.remove(this.ejecucion);
      }
      this.solicitar_refresco();
    }
  }

  solicitar_refresco() {
    let ev = new CustomEvent("refrescar-actividades",{bubbles:true,composed:true});
    this.dispatchEvent(ev);
  }

  render() {
    let fecha = this.get_fecha_plan_o_ejecucion();

    return html` <vaadin-horizontal-layout
        theme=""
        style="align-items:center; justify-content:space-between;"
      >
        <div>
          <span theme="badge ${this.ejecucion ? "success" : "error"}"
            >${fecha} ${this.ejecucion ? "Ejecutada" : "Planificada"}</span
          >
          <a
            >${this.item?.tipo.toUpperCase()}
            <span class="text-muted">
              en ${this.item.detalles.hectareas} has.</span
            ></a
          >
        </div>

        <vaadin-menu-bar
          .items="${this.menu_items}"
          @item-selected=${this.menu_click}
          theme="icon"
        >
          <vaadin-tooltip slot="tooltip"></vaadin-tooltip>
        </vaadin-menu-bar>
      </vaadin-horizontal-layout>
      <vaadin-tabsheet>
        <vaadin-tabs slot="tabs">
          <vaadin-tab id="dashboard-tab">Planificación</vaadin-tab>
          <vaadin-tab id="payment-tab">Ejecución</vaadin-tab>
          <vaadin-tab id="shipping-tab">Adjuntos</vaadin-tab>
        </vaadin-tabs>

        <!-- Planificacion -->
        <div tab="dashboard-tab">
          <div>
            Fecha Estimada de Aplicación
            ${this.item.detalles.fecha_ejecucion_tentativa}
          </div>
          <vaadin-details opened theme="small">
            <div slot="summary">Insumos</div>

            <ul>
              ${map(
                this.item.detalles.dosis,
                (item) =>
                  html`<li>
                    ${item.insumo.marca_comercial} - ${item.dosis.toFixed(3)}
                    ${item.insumo.unidad}/ha
                  </li>`
              )}
            </ul>
          </vaadin-details>
          <vaadin-details theme="small">
            <div slot="summary">Contratista</div>

            <ul>
              <li>${this.item.contratista?.nombre || "Sin Contratista"}</li>
            </ul>
          </vaadin-details>
          <vaadin-details theme="small">
            <div slot="summary">Condiciones Esperadas de Trabajo</div>
            <ul>
              <li>
                Temperatura min...max:
                ${this.item.condiciones.temperatura_min}...${this.item
                  .condiciones.temperatura_max}
              </li>
              <li>
                Humedad min...max:
                ${this.item.condiciones.humedad_min}...${this.item.condiciones
                  .humedad_max}
              </li>
              <li>
                Velocidad min...max:
                ${this.item.condiciones.velocidad_min}...${this.item.condiciones
                  .velocidad_max}
              </li>
            </ul>
          </vaadin-details>
          <vaadin-details theme="small">
            <div slot="summary">Observaciones</div>
            <ul>
              <li>${this.item.comentario}</li>
            </ul>
          </vaadin-details>
        </div>
        <!-- Fin planificacion -->

        <!-- Ejecucion -->

        ${this.ejecucion
          ? html`
              <div tab="payment-tab">
                Fecha de Ejecución ${this.ejecucion.detalles.fecha_ejecucion}

                <vaadin-details opened theme="small">
                  <div slot="summary">Insumos</div>

                  <ul>
                    ${map(
                      this.ejecucion.detalles.dosis,
                      (item) =>
                        html`<li>
                          ${item.insumo.marca_comercial} -
                          ${item.dosis.toFixed(3)} ${item.insumo.unidad}/ha
                        </li>`
                    )}
                  </ul>
                </vaadin-details>
                <vaadin-details theme="small">
                  <div slot="summary">Contratista</div>
                  <ul>
                    <li>${this.item.contratista.nombre}</li>
                  </ul>
                </vaadin-details>
                <vaadin-details theme="small">
                  <div slot="summary">Condiciones de Trabajo</div>
                  <ul>
                    <li>
                      Temperatura promedio:
                      ${this.ejecucion.condiciones.temperatura_promedio}
                    </li>
                    <li>
                      Humedad promedio:
                      ${this.ejecucion.condiciones.humedad_promedio}
                    </li>
                    <li>
                      Velocidad promedio:
                      ${this.ejecucion.condiciones.velocidad_promedio}
                    </li>
                  </ul>
                </vaadin-details>
                <vaadin-details theme="small">
                  <div slot="summary">Observaciones</div>
                  <ul>
                    <li>${this.ejecucion.comentario}</li>
                  </ul>
                </vaadin-details>
              </div>
            `
          : html`
              <div tab="payment-tab">
                <vaadin-horizontal-layout
                  theme="spacing padding"
                  style="justify-content: center"
                >
                  <vaadin-button
                    @click=${() => {
                      let url_base =
                        "/campo/:uuid_campo/lote/:uuid_lote/ejecucion/:uuid/nueva";

                      let lote_nombre = gbl_state.router.location.params
                        .uuid_lote as string;

                      let campo_nombre = gbl_state.router.location.params
                        .uuid_campo as string;

                      Router.go(
                        gbl_state.router.urlForPath(url_base, {
                          uuid_campo: campo_nombre,
                          uuid_lote: lote_nombre,
                          uuid: this.item.uuid,
                        })
                      );
                    }}
                    theme="primary success"
                  >
                    Ejecutar
                  </vaadin-button>
                </vaadin-horizontal-layout>
              </div>
            `}

        <!-- Fin Ejecucion -->

        <!-- Adjuntos -->
        <div tab="shipping-tab">
          <vaadin-upload target="/api/fileupload"></vaadin-upload>
        </div>
        <!-- FinAdjuntos-->
      </vaadin-tabsheet>`;
  }
}

const url_repeticion = (actividad_uuid) => {
  let location = gbl_state.router.location.pathname;
  let url =
    location + "/actividad/" + encodeURIComponent(actividad_uuid) + "/repetir";
  return url;
};
