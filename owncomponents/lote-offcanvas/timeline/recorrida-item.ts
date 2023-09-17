import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Actividad } from "../../depositos/depositos-types";
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
import { get, translate as t } from "lit-translate";
import "../../image-gallery/images-gallery";
import {
  Nota
} from "../../recorridas/notas-fuciones";
import { createMenuDots } from "../../helpers";
import { PuntoRecorrida, Recorrida } from "../../recorridas/recorrida-types";
import {map} from "lit/directives/map.js"
import { deleteRecorrida } from "../../recorridas/recorrida-functions";

@customElement("recorrida-item")
export class NotaItem extends LitElement {
  static override styles = [badge];
  
  @property()
  item: Recorrida;

  private menu_items = [
    {
      component: createMenuDots("ellipsis-dots-v"),
      tooltip: get("mas"),
      children: [
        {
          text: "Editar Nota",
          tooltip: "Edit",
          value: "editar",
          callback: () => 
            Router.go(gbl_state.router.location.getUrl() + "/nota/"+ this.item._id+"/edit"),
        },
        {
          text: get("reporte_de_recorrida"),
          tooltip: "Edit",
          value: "reporte_recorrida",
          callback: () => 
            Router.go(gbl_state.router.location.getUrl() + "/nota/"+ this.item._id+"/reporte"),
        },
        {
          text: "Generar Planificación",
          tooltip: "Generar Planificación",
          value: "generar_planificacion",
          callback: () => {
            let url_pla = url_planificacion(this.item);
            Router.go(url_pla);
            console.log("Generar Aplicacion CLICK");
          },
        },
        {
          text: "Borrar Nota",
          tooltip: "Borrar",
          value: "generar_planificacion",
          callback: () => {
            console.log("Borrar CLICK");
            this.borrar_nota();
          },
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
    }
  }

  borrar_nota() {
    console.log("Borrar Nota");
    deleteRecorrida(this.item).then(()=>{
      console.log("Borrada")
      this.solicitar_refresco()

    })
  }

  solicitar_refresco() {
    let ev = new CustomEvent("refrescar-actividades", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(ev);
  }

  editar_nota(actividad: Actividad) {
    let url_tail = `/nota/editar/${actividad.uuid}`;
    let url_head = gbl_state.router.location.pathname;
    let target_url = url_head + url_tail;
    console.log("GoTo", target_url);
    Router.go(target_url);
  }

  nota_eliminar(nota_doc) {
    let event = new CustomEvent("eliminar-nota", {
      detail: { nota_doc: nota_doc },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  private imagenes = [];
  private audio = [];

  willUpdate(p) {
    if (p.has("item")) {
      if ("_attachments" in this.item) {
        Object.entries(this.item._attachments).map(([key, item]) => {
          if (key.indexOf("foto") > -1) {
            this.imagenes.push(item.data);
          }
        });

        Object.entries(this.item._attachments).map(([key, item]) => {
          if (key.indexOf("audio") > -1) {
            this.audio.push(item);
          }
        });

        console.log("IMG", this.imagenes, "Audio", this.audio);
      }
    }
  }

  localizar(item) {
    const event = new CustomEvent("localizar-nota", {
      detail: { item: item },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  emit_gallery_open() {
    this.dispatchEvent(
      new CustomEvent("gallery-open", {
        detail: {},
        bubbles: true,
        composed: true,
      })
    );
  }

  emit_gallery_closed() {
    this.dispatchEvent(
      new CustomEvent("gallery-closed", {
        detail: {},
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    let color_badge;
    if (this.item.color === "red") {
      color_badge = html`<span theme="badge error">Urgente</span>`;
    } else if (this.item.color === "yellow") {
      color_badge = html`<span theme="badge warning">Atención</span>`;
    } else if (this.item.color === "green") {
      color_badge = html`<span theme="badge success">Todo Bien</span>`;
    }

    /* Mostrar todos los datos de la recorrida de alguna forma en el item */
    return html`
      <vaadin-horizontal-layout
        theme=""
        style="align-items:center; justify-content:space-between;"
      >
        <div>
          <span theme="badge">${this.item.fecha}</span>
          ${color_badge}
          <a> ${t("recorrida")}</a>
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
          <vaadin-tab id="nota-tab">${t("recorrida")}</vaadin-tab>
          <vaadin-tab id="puntos-tab">${t("puntos")}</vaadin-tab>
        </vaadin-tabs>

        <div tab="nota-tab">
          ${this.item}

          <p class="small"></p>

          <div class="row mx-1">
           
          </div>

          <!-- <div class="row my-1">
            ${this.item
              ? html`<audio controls><source .src=${"/attachments?file="+this.item.audio_url}></source></audio>`
              : null}
          </div> -->

          <vaadin-button
            class="btn btn-danger"
            @click=${() => {
              this.localizar(this.item);
            }}
          >
            ${t("ver")}
          </vaadin-button>
        </div>

        <div tab="puntos-tab">
          ${map(this.item.features,(f:PuntoRecorrida)=>{
            
            let props = f.properties
            return html`

          

          <div class="row my-1">
            ${props.audio
              ? html`<audio controls><source .src=${"/attachments?file="+props.audio}></source></audio>`
              : null}
          </div>
          
          `})}
    
        </div>

        
      </vaadin-tabsheet>
    `;
  }
}

const url_planificacion = (item_nota: Nota) => {
  let location = gbl_state.router.location.pathname;
  let params = {
    motivos: item_nota.motivos_nota,
    comentario: item_nota.texto,
    fecha_nota: item_nota.fecha,
  };
  console.log("PARAMS", params);

  let url =
    location +
    "/actividad/nueva/aplicacion?params=" +
    encodeURIComponent(JSON.stringify(params));
  return url;
};

const imagen_objeto_gallery_url = (url : string) => {
  let full_url = "/attachments?file=" + url
  let objeto = {
    id: "3",
    size: "", // Size como 1900-720
    src: "", // Src URL
    thumb: "", //Thumb URL
    subHtml: ``, // Template de lo que aparece abajo
  };

  objeto.src = full_url;
  objeto.thumb = full_url;

  return objeto;
};