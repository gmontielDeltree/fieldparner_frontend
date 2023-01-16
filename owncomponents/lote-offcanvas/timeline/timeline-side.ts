import { LitElement, html, css, unsafeCSS, CSSResultGroup } from "lit";
import { map } from "lit/directives/map.js";
import moment from "moment";
import "moment/dist/locale/es";
import { stock_suficiente } from "../../helpers/stock.ts";
import { parse, compareDesc, format, parseISO } from "date-fns";
import { property, state } from "lit/decorators.js";
import {
  Actividad,
  DetallesAplicacion,
  DetallesSiembra,
  LineaDosis,
} from "../../depositos/depositos-types";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import isFuture from "date-fns/isFuture";

import "@vaadin/combo-box";
import "@vaadin/horizontal-layout";
import "@vaadin/icon";
import "@vaadin/icons";
import { Router } from "@vaadin/router";
import gbl_state from "../../state";
import "./actividad-item";
import "@vaadin/scroller";
import { badge } from "@vaadin/vaadin-lumo-styles/badge";
import { GridItemModel } from '@vaadin/grid';
import './nota-item'

const url_repeticion = (actividad_uuid) => {
  let location = gbl_state.router.location.pathname;
  let url =
    location + "/actividad/" + encodeURIComponent(actividad_uuid) + "/repetir";
  return url;
};

const estados = [
  {
    nombre: "Pendiente",
    value: "pendiente",
  },
  {
    nombre: "Orden Entregada",
    value: "orden_entregada",
  },
  {
    nombre: "Realizada",
    value: "realizada",
  },
  {
    nombre: "Pagada",
    value: "pagada",
  },
  {
    nombre: "Cancelada",
    value: "cancelada",
  },
];

const estados_ = ["pendiente", "realizada"];

const p_from_insumo = (i: LineaDosis) => {
  const motivos_2_str = (motivos: string[]) => {
    let motivos_array = Object.keys(motivos);
    let solo_verdaderos = motivos_array.filter((m) => motivos[m]);
    return solo_verdaderos.join(", ");
  };

  return html`<p class="small">
    <strong>${i.insumo.marca_comercial.toUpperCase()}</strong> - Dosis:
    ${i.dosis} ${i.insumo.unidad} - Motivo: ${motivos_2_str(i.motivos)}
  </p>`;
};

const timeline_css = css`
  .cbp_tmtimeline {
    margin: 0;
    padding: 0;
    list-style: none;
    position: relative;
  }

  .cbp_tmtimeline:before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 3px;
    background: rgb(40, 147, 132);
    left: 10%;
    margin-left: -6px;
  }

  .cbp_tmtimeline > li {
    position: relative;
  }

  .cbp_tmtimeline > li:first-child .cbp_tmtime span.large {
    color: #444;
    font-size: 17px !important;
    font-weight: 700;
  }

  .cbp_tmtimeline > li:first-child .cbp_tmicon {
    background: #fff;
    color: #666;
  }

  .cbp_tmtimeline > li:nth-child(odd) .cbp_tmtime span:last-child {
    color: #444;
    font-size: 10px;
  }

  .cbp_tmtimeline > li:nth-child(odd) .cbp_tmlabel {
    background: #f0f1f3;
  }

  .cbp_tmtimeline > li:nth-child(odd) .cbp_tmlabel:after {
    border-right-color: #f0f1f3;
  }

  .cbp_tmtimeline > li .empty span {
    color: #777;
  }

  .cbp_tmtimeline > li .cbp_tmtime {
    display: block;
    width: 23%;
    padding-right: 70px;
    position: absolute;
  }

  .cbp_tmtimeline > li .cbp_tmtime span {
    display: block;
    text-align: right;
  }

  .cbp_tmtimeline > li .cbp_tmtime span:first-child {
    font-size: 10px;
    color: #3d4c5a;
    font-weight: 700;
  }

  .cbp_tmtimeline > li .cbp_tmtime span:last-child {
    font-size: 10px;
    color: #444;
  }

  .cbp_tmtimeline > li .cbp_tmlabel {
    margin: 0 0 15px 15%;
    background: #f0f1f3;
    padding: 1.2em;
    position: relative;
    border-radius: 5px;
  }

  .cbp_tmtimeline > li .cbp_tmlabel:after {
    right: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-right-color: #f0f1f3;
    border-width: 10px;
    top: 10px;
  }

  .cbp_tmtimeline > li .cbp_tmlabel blockquote {
    font-size: 10px;
  }

  .cbp_tmtimeline > li .cbp_tmlabel .map-checkin {
    border: 5px solid rgba(235, 235, 235, 0.2);
    -moz-box-shadow: 0px 0px 0px 1px #ebebeb;
    -webkit-box-shadow: 0px 0px 0px 1px #ebebeb;
    box-shadow: 0px 0px 0px 1px #ebebeb;
    background: #fff !important;
  }

  .cbp_tmtimeline > li .cbp_tmlabel h2 {
    margin: 0px;
    padding: 0 0 10px 0;
    line-height: 26px;
    font-size: 10px;
    font-weight: normal;
  }

  .cbp_tmtimeline > li .cbp_tmlabel h2 a {
    font-size: 15px;
  }

  .cbp_tmtimeline > li .cbp_tmlabel h2 a:hover {
    text-decoration: none;
  }

  .cbp_tmtimeline > li .cbp_tmlabel h2 span {
    font-size: 15px;
  }

  .cbp_tmtimeline > li .cbp_tmlabel p {
    color: #444;
  }

  .cbp_tmtimeline > li .cbp_tmicon {
    width: 40px;
    height: 40px;
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    font-size: 1.4em;
    line-height: 40px;
    -webkit-font-smoothing: antialiased;
    position: absolute;
    color: #fff;
    background: #46a4da;
    border-radius: 50%;
    box-shadow: 0 0 0 5px #f5f5f6;
    text-align: center;
    left: 10%;
    top: 0;
    margin: 0 0 0 -25px;
  }

  @media screen and (max-width: 992px) and (min-width: 768px) {
    .cbp_tmtimeline > li .cbp_tmtime {
      padding-right: 60px;
    }
  }

  @media screen and (max-width: 65.375em) {
    .cbp_tmtimeline > li .cbp_tmtime span:last-child {
      font-size: 12px;
    }
  }

  @media screen and (max-width: 47.2em) {
    .cbp_tmtimeline:before {
      display: none;
    }
    .cbp_tmtimeline > li .cbp_tmtime {
      width: 100%;
      position: relative;
      padding: 0 0 20px 0;
    }
    .cbp_tmtimeline > li .cbp_tmtime span {
      text-align: left;
    }
    .cbp_tmtimeline > li .cbp_tmlabel {
      margin: 0 0 30px 0;
      padding: 1em;
      font-weight: 400;
      font-size: 95%;
    }
    .cbp_tmtimeline > li .cbp_tmlabel:after {
      right: auto;
      left: 20px;
      border-right-color: transparent;
      border-bottom-color: #f5f5f6;
      top: -20px;
    }
    .cbp_tmtimeline > li .cbp_tmicon {
      position: relative;
      float: right;
      left: auto;
      margin: -64px 5px 0 0px;
    }
    .cbp_tmtimeline > li:nth-child(odd) .cbp_tmlabel:after {
      border-right-color: transparent;
      border-bottom-color: #f5f5f6;
    }
  }

  .bg-green {
    background-color: #50d38a !important;
    color: #fff;
  }

  .bg-blush {
    background-color: #ff758e !important;
    color: #fff;
  }

  .bg-orange {
    background-color: #ffc323 !important;
    color: #fff;
  }

  .bg-info {
    background-color: #2ca8ff !important;
  }

  .icono-siembra {
    background-image: url("/sembradora_act.webp") !important;
    background-color: #ffc323 !important;
    background-size: cover !important;
    background-position: center !important;
  }

  .icono-cosecha {
    background-image: url("/cosechadora_act.webp") !important;
    background-color: #ffc323 !important;
    background-size: cover !important;
    background-position: center !important;
  }

  .icono-aplicacion {
    background-image: url("/pulverizadora_act.webp") !important;
    background-color: #ffc323 !important;
    background-size: cover !important;
    background-position: center !important;
  }

  .icono-nota {
    background-image: url("/iconodenotas_act.webp") !important;
    background-color: #ffc323 !important;
    background-size: cover !important;
    background-position: center !important;
  }
`;

const extraer_fecha = (actividad) => {
  let fecha_objeto;
  // Extraer fecha de b
  if ("doc" in actividad) {
    // Nota
    fecha_objeto = parse(actividad.doc.fecha, "yyyy-MM-dd", new Date());
  } else {
    // Aplicacion antigua
    fecha_objeto = parse(actividad.detalles.fecha, "yyyy-MM-dd", new Date());
  }
  return fecha_objeto;
};

export class TimelineSideElement extends LitElement {
  @property()
  a: Actividad[];

  static override styles: CSSResultGroup = [unsafeCSS(bootstrap), timeline_css, badge];

  evento_download_pdf(item) {
    const event = new CustomEvent("generar-ot", {
      detail: item,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  evento_share_pdf(uuid) {
    const event = new CustomEvent("share-ot", {
      detail: { uuid: uuid },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  evento_eliminar(item) {
    const event = new CustomEvent("eliminar-actividad", {
      detail: item,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  evento_editar(act_doc: Actividad) {
    const event = new CustomEvent("editar-actividad", {
      detail: { act_doc: act_doc },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  nota_eliminar(nota_doc) {
    let event = new CustomEvent("eliminar-nota", {
      detail: { nota_doc: nota_doc },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  localizar(item) {
    const event = new CustomEvent("localizar-nota", {
      detail: { item: item },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
   
    const time_item = ({actividad, ejecucion_id}:{actividad:Actividad, ejecucion_id:string}) => {
      let item = actividad
      if (item.tipo === "nota") {
        // Es un documento
        //console.log("OOOOOOOOOOO NOTA", item)

        return html` <li>
          <div class="icono-nota cbp_tmicon bg-blush">
            <i class="zmdi zmdi-label"></i>
          </div>
          <div class="cbp_tmlabel bg-nota">
            <nota-item .item=${item}></nota-item>
          </div>
        </li>`;
      }

      if (item.tipo === "aplicacion") {
        return html` <li>
          <div class="icono-aplicacion cbp_tmicon bg-blush">
            <i class="zmdi zmdi-label"></i>
          </div>
          <div class="cbp_tmlabel bg-aplicacion">
            <actividad-item .item=${item}></actividad-item>
          </div>
        </li>`;
      }

      if (item.tipo === "siembra") {
        return html` <li>
          <div class="icono-siembra cbp_tmicon bg-blush">
            <i class="zmdi zmdi-label"></i>
          </div>
          <div class="cbp_tmlabel bg-aplicacion">
            <actividad-item .item=${item}></actividad-item>
          </div>
        </li>`;
      }

      if (item.tipo === "cosecha") {
        return html` <li>
          <div class="icono-cosecha cbp_tmicon bg-blush">
            <i class="zmdi zmdi-label"></i>
          </div>
          <div class="cbp_tmlabel bg-aplicacion">
            <actividad-item .item=${item}></actividad-item>
          </div>
        </li>`;
      }

    };

    return html`
      <div class="container-fluid">
        <div class="row">
          <div class="col-md-12 px-1">
            <ul class="cbp_tmtimeline">
              ${this.a?.map(time_item) || null}
            </ul>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("lit-timeline-side", TimelineSideElement);
