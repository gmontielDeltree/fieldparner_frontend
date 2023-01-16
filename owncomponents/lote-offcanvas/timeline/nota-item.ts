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
import { format, isBefore, parse, parseISO } from "date-fns";
import { map } from "lit/directives/map.js";
import { translate } from "lit-translate";
import { actividad_detalles } from "./detalles-actividad/detalles-actividad";
import { ejecucion_detalles } from "./detalles-actividad/detalles-ejecucion";
import "../../image-gallery/images-gallery";

@customElement("nota-item")
export class NotaItem extends LitElement {
  static override styles = [badge];
  @property()
  item: Actividad;

  private menu_items = [
    {
      component: this.createItem("ellipsis-dots-v"),
      tooltip: "Mas",
      children: [
        {
          text: "Editar Nota",
          tooltip: "Edit",
          value: "editar",
          callback: () => {
            console.log("Editar Nota CLICK");
            alert('En construccion')
          },
        },
        {
          text: "Generar Planificación",
          tooltip: "Generar Planificación",
          value: "generar_planificacion",
          callback: () => {
            let url_pla = url_planificacion(this.item)
            Router.go(url_pla)
            console.log("Generar Aplicacion CLICK");
          },
        },
        {
          text: "Borrar Nota",
          tooltip: "Borrar",
          value: "generar_planificacion",
          callback: () => {
            console.log("Borrar CLICK");
            this.borrar_nota(this.item)
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

  createItem(iconName: string) {
    const item = document.createElement("vaadin-context-menu-item");
    const icon = document.createElement("vaadin-icon");
    icon.setAttribute("icon", `vaadin:${iconName}`);
    item.appendChild(icon);
    return item;
  }

  borrar_nota() {
    console.log("Borrar Nota");
    gbl_state.db.remove(this.item as PouchDB.Core.RemoveDocument);
    this.solicitar_refresco();
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

    if(p.has('item')){
      if ("_attachments" in (this.item)) {
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

        console.log("IMG", this.imagenes, "Audio", this.audio)
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

  emit_gallery_open(){
    this.dispatchEvent(new CustomEvent('gallery-open',{detail:{},bubbles:true,composed:true}))
  }

  emit_gallery_closed(){
    this.dispatchEvent(new CustomEvent('gallery-closed',{detail:{},bubbles:true,composed:true}))
  }

  render() {
    let color_badge;
    if (this.item.color === "red") {
      color_badge = html`<span theme="badge error"
        >Urgente</span
      >`;
    } else if (this.item.color === "yellow") {
      color_badge = html`<span theme="badge warning"
        >Atención</span
      >`;
    } else if (this.item.color === "green") {
      color_badge = html`<span theme="badge success"
        >Todo Bien</span
      >`;
    }

    return html`
      <vaadin-horizontal-layout
        theme=""
        style="align-items:center; justify-content:space-between;"
      >
        <div>
          <span theme="badge">${this.item.fecha}</span>
          ${color_badge}
          <a> NOTA</a> 
        </div>
        <vaadin-menu-bar
          .items="${this.menu_items}"
          @item-selected=${this.menu_click}
          theme="icon"
        >
          <vaadin-tooltip slot="tooltip"></vaadin-tooltip>
        </vaadin-menu-bar>
      </vaadin-horizontal-layout>

      ${this.item.texto}

      <p class="small"></p>

      <div class="row mx-1">

                  <!--Galeria-->
                  <light-gallery-demo
              .list=${this.imagenes.map(imagen_objeto_gallery)}
              @beforeOpen=${() => {
                //this.nueva_nota_offcanvas.hide();
                this.emit_gallery_open()
                console.log("hide offcanvas");
              }}
              @borrarImagen=${(e)=>{
                let index = e.detail.index
                let instance = e.detail.instance
                //alert('borrar imagen index')
                this.imagenes.splice(index,1)
                this.requestUpdate()
              }}
              @afterClose=${() => this.emit_gallery_closed()}
            >
            </light-gallery-demo>


      </div>

      <div class="row my-1">
        ${this.audio.length > 0
          ? html`<audio controls><source .src=${URL.createObjectURL(
              this.audio[0].data
            )}></source></audio>`
          : null}
      </div>

      <vaadin-button
        class="btn btn-danger"
        @click=${() => {
          this.localizar(this.item);
        }}
      >
        Localizar
      </vaadin-button>
    `;
  }
}

const url_planificacion = (item_nota:Actividad) => {
  let location = gbl_state.router.location.pathname;
  let params ={
    motivos: item_nota.motivos_nota,
    comentario: item_nota.texto,
    fecha_nota:item_nota.fecha
  }
  console.log("PARAMS",params)

  let url =
    location + "/actividad/nueva/aplicacion?" + encodeURIComponent(JSON.stringify(params));
  return url;
};

const imagen_objeto_gallery = (file: Blob) => {
  let objeto = {
    id: "3",
    size: "", // Size como 1900-720
    src: "", // Src URL
    thumb: "", //Thumb URL
    subHtml: ``, // Template de lo que aparece abajo
  };

  let url = URL.createObjectURL(file);
  objeto.src = url;
  objeto.thumb = url;

  return objeto;
};


// <!-- ${this.imagenes.map((img) => {
//   return html`<img
//     src=${URL.createObjectURL(img.data)}
//     class="img-thumbnail col col-4 col-sm-3"
//     alt="..."
//   />`;
// })} -->