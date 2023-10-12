import {
  actividad_adjuntar_archivo,
  actividad_remover_adjunto,
} from "./../../helpers/actividad-funciones";
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
import "@vaadin/vertical-layout";
import "@vaadin/upload";
import "@vaadin/menu-bar";
import { badge } from "@vaadin/vaadin-lumo-styles/badge";
import { isBefore, parseISO } from "date-fns";
import { translate } from "lit-translate";
import { actividad_detalles } from "./detalles-actividad/detalles-actividad";
import { ejecucion_detalles } from "./detalles-actividad/detalles-ejecucion";
import { Cultivo } from '../../insumos/insumos-types';
import { openReportOrdenTrabajo } from './actividad-functions';
import "../../common_components/weather-forecast/weather-forecast";

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
          value: "editar",
        },
        {
          text: "Repetir Planificacion",
          tooltip: "Repetir",
          value: "repetir_actividad",
          callback: () => this.repetir_aplicacion(),
        },
        {
          text: "Orden de Trabajo PDF",
          tooltip: "Orden de Trabajo",
          value: "ver_orden_de_trabajo",
          callback: () =>  openReportOrdenTrabajo(this.item) //this.evento_download_pdf(),
        },
        {
          text: "Compartir Orden de Trabajo",
          tooltip: "Compartir",
          value: "compartir_orden_de_trabajo",
          callback: () => this.evento_share_pdf(),
        },
        {
          text: "Ejecución vs Planificación PDF",
          tooltip: "Informe PDF",
          callback: () => {
            if (!this.ejecucion) {
              alert("Necesita Ejecutar para hacer el informe");
              return;
            }

            this.dispatchEvent(
              new CustomEvent("generar-informe-diferencia-pdf", {
                detail: { actividad: this.item, ejecucion: this.ejecucion },
                bubbles: true,
                composed: true,
              })
            );
          },
        },
        {
          text: "Datos Meteorológicos",
          tooltip: "Archive",
          value: "ver_centrales",
          callback: () => this.ver_centrales_cercanas(),
        },
        {
          text: "Eliminar",
          tooltip: "Archive",
          value: "eliminar",
          callback: () => this.borrar_actividad(),
        },
      ],
    },
  ];

  menu_click({ detail }) {
    /* Si tiene un callback, lo ejecuto */
    if (detail.value.callback) {
      detail.value.callback();
      return;
    }

    // si no
    let valor = detail.value.value;
    if (valor === "editar") {
      if (!this.ejecucion) {
        this.editar_actividad(this.item);
      } else {
        this.editar_ejecucion(this.ejecucion);
      }
    }
  }

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
      .allDocs({ startkey: "ejecucion:", endkey: "ejecucion:\ufff0" })
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

  borrar_actividad() {
    console.log("Borrar Actividad");
    gbl_state.db.remove(this.item as PouchDB.Core.RemoveDocument);
    if (this.ejecucion) {
      gbl_state.db.remove(this.ejecucion as PouchDB.Core.RemoveDocument);
    }
    this.solicitar_refresco();
  }

  solicitar_refresco() {
    let ev = new CustomEvent("refrescar-actividades", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(ev);
  }

  evento_download_pdf() {
    const event = new CustomEvent("generar-ot", {
      detail: this.item,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);

    this.anotar_orden_generada(this.item);
  }

  evento_share_pdf() {
    const event = new CustomEvent("share-ot", {
      detail: { uuid: this.item.uuid },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);

    this.anotar_orden_generada(this.item);
  }

  anotar_orden_generada(item: Actividad) {
    item.estado = 1;
    gbl_state.db
      .put(item)
      .then(() => this.requestUpdate())
      .catch((e) => alert("Error al generar Orden"));
  }

  editar_actividad(actividad: Actividad) {
    let url_tail = `/actividad/editar/${actividad.uuid}`;
    let url_head = gbl_state.router.location.pathname;
    let target_url = url_head + url_tail;
    console.log("GoTo", target_url);
    Router.go(target_url);
  }

  editar_ejecucion(ejecucion: Ejecucion) {
    let url_tail = `/ejecucion/${ejecucion.uuid}/editar`;
    let url_head = gbl_state.router.location.pathname;
    let target_url = url_head + url_tail;
    console.log("GoTo", target_url);
    Router.go(target_url);
  }

  repetir_aplicacion() {
    //console.error("Repetir no implementado");
    Router.go(url_repeticion(this.item.uuid));
  }

  ver_centrales_cercanas() {
    this.dispatchEvent(
      new CustomEvent("ver-centrales-cercanas", {
        detail: this.item,
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    let fecha = this.get_fecha_plan_o_ejecucion();
    
    let titulo = this.item?.tipo.toUpperCase()
    
    if(this.item?.tipo === 'siembra'){
      let cultivo: Cultivo = null;
      if (this.item) {
        let t = this.item.detalles.dosis.find(
          (d) => d.insumo.tipo?.key === "semillas"
        );
        // t es la primera linea de dosis con semillas
        if (t) {
          cultivo = t.insumo.cultivo;
          titulo += " " + cultivo.nombre
        }
      }
    }
   


    return html` <vaadin-horizontal-layout
        theme=""
        style="align-items:center; justify-content:space-between;"
      >
        <div>
          <!--Badge Ejecucion-->
          ${this.ejecucion
            ? html`<span theme="badge success">${fecha} Ejecutada</span>`
            : null}
          <!--Badge Planificacion-->
          <span theme="badge error"
            >${this.item.detalles.fecha_ejecucion_tentativa} Planificada</span
          >
          <a
            >${titulo}
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
          <vaadin-tab id="dashboard-tab" ?selected=${!this.ejecucion}
            >Planificación</vaadin-tab
          >
          <vaadin-tab id="orden-trabajo-tab">Orden de Trabajo</vaadin-tab>
          <vaadin-tab id="payment-tab" ?selected=${this.ejecucion !== null}
            >Ejecución</vaadin-tab
          >
          <vaadin-tab id="shipping-tab">Adjuntos</vaadin-tab>
        </vaadin-tabs>

        <div tab="orden-trabajo-tab">
          <vaadin-vertical-layout>
            <vaadin-button
              @click=${() => {
                this.evento_download_pdf();
              }}
              >${translate("descargar_orden")}</vaadin-button
            >
            ${navigator.share
              ? html`<vaadin-button
                  @click=${() => {
                    this.evento_share_pdf();
                  }}
                  >${translate("compartir_orden")}</vaadin-button
                >`
              : null}
          </vaadin-vertical-layout>
        </div>

        <!-- Planificacion -->
        <div tab="dashboard-tab">
          <div style="font-size: small;">
            Fecha Estimada de Aplicación
            ${this.item.detalles.fecha_ejecucion_tentativa}
          </div>
          ${actividad_detalles(this.item)}

          <h5>Pronostico</h5>
         <weather-forecast .posicion=${<[number,number]>[-59,-36]} .fecha=${this.item.detalles.fecha_ejecucion_tentativa}></weather-forecast> 
        </div>
        <!-- Fin planificacion -->

        <!-- Ejecucion -->

        ${this.ejecucion
          ? html`
              <div tab="payment-tab">
                <div style="font-size: small;">
                  Fecha de Ejecución ${this.ejecucion.detalles.fecha_ejecucion}
                </div>
                ${ejecucion_detalles(this.ejecucion, this.item)}
              </div>
            `
          : html`
              <div tab="payment-tab">
                <div>${translate("actividad_aun_no_ejecutada")}</div>
                <vaadin-horizontal-layout
                  theme="spacing padding"
                  style="justify-content: center"
                >
                  ${this.item.estado === 0
                    ? html` ${translate("debe_generar_la_orden_de_trabajo")}`
                    : html`<vaadin-vertical-layout style="align-items:center;">
                        ${!isBefore(parseISO(fecha), new Date())
                          ? html`<div>
                              ${translate(
                                "actividad_se_podra_ejecutar_a_partir_del_dia"
                              )}
                              ${fecha}
                            </div>`
                          : null}
                        <vaadin-button
                          ?disabled=${!isBefore(parseISO(fecha), new Date())}
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
                          ${translate("ejecutar")}
                        </vaadin-button>
                      </vaadin-vertical-layout> `}
                </vaadin-horizontal-layout>
              </div>
            `}

        <!-- Fin Ejecucion -->

        <!-- Adjuntos -->
        <div tab="shipping-tab">
          <vaadin-vertical-layout style="align-self:stretch">
            ${this.item.attachments
              ? this.item.attachments.map(
                  (att) => html`
                    <vaadin-horizontal-layout
                      style="width:100%; align-items:center; justify-content:space-between"
                      theme="spacing"
                    >
                      <div>${att.filename}</div>
                      <div> <!-- Grupo botones -->

                      <!-- <vaadin-button @click=${
                       ()=>{
                        let n = att.filename
                        if(n.includes('.shp')){
                          //Show on map
                        }else if(n.includes('.jpg')){
                          // Open lightbox
                        }
                       } 
                      }>
                      <vaadin-icon icon='lumo:eye'></vaadin-icon>
                      </vaadin-button> -->
                        <vaadin-button
                          @click=${() => {
                            fetch(
                              "/attachments?file=" +
                                encodeURIComponent(att.filename)
                            )
                              .then((r) => {
                                return r.blob();
                              })
                              .then((data) => {
                                // Download Fetch
                                var a = document.createElement("a");
                                a.href = window.URL.createObjectURL(data);
                                a.download = att.filename;
                                a.click();
                              });
                          }}
                        >
                          <vaadin-icon icon="lumo:download"></vaadin-icon>
                        </vaadin-button>
                        <vaadin-button
                          @click=${() => {
                            // Solicitar borrado en server y en la db
                            actividad_remover_adjunto(this.item, att.uuid).then(
                              () => this.requestUpdate()
                            );
                          }}
                          ><vaadin-icon icon="vaadin:trash"></vaadin-icon
                        ></vaadin-button>
                      </div>
                    </vaadin-horizontal-layout>
                  `
                )
              : html`${translate("sin_adjuntos")}`}
          </vaadin-vertical-layout>

          <vaadin-upload
            target="/attachments"
            .files=${[] /* Previene que se agregen los archivos debajo del control*/} 
            @upload-success=${(e) => {
              console.log("successevent", e);
              actividad_adjuntar_archivo(this.item, e.detail.file).then(() => {
                this.requestUpdate();
              });
            }}
          ></vaadin-upload>
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
