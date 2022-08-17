import { LitElement, html, css, unsafeCSS, CSSResultGroup } from "lit";
import { map } from "lit/directives/map.js";
import moment from "moment";
import "moment/dist/locale/es";
import { stock_suficiente } from "../../helpers/stock.ts";
import { parse, compareDesc, format, parseISO } from "date-fns";
import { property, state } from "lit/decorators.js";
import { Actividad, DetallesSiembra } from "../../depositos/depositos-types";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import isFuture from 'date-fns/isFuture'

import "@vaadin/combo-box";

const estados = [
  {
  nombre : "Pendiente",
  value: 'pendiente'
},
{
  nombre : "Orden Entregada",
  value: 'orden_entregada'
},
{
  nombre : "Realizada",
  value: 'realizada'
},
{
  nombre : "Pagada",
  value: 'pagada'
},
{
  nombre : "Cancelada",
  value: 'cancelada'
}
]

const estados_ = [

'pendiente'
,'realizada'
]

const p_from_insumo = (i) => {
  const motivos_2_str = (motivos) => {
    let motivos_array = Object.keys(motivos);
    let solo_verdaderos = motivos_array.filter((m) => motivos[m]);
    return solo_verdaderos.join(", ");
  };

  return html`<p class="small">
    <strong>${i.name.toUpperCase()}</strong> - Dosis: ${i.dosis} ${i.unidad} -
    Motivo: ${motivos_2_str(i.motivos)}
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
    background: #00b303;
    left: 20%;
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
    font-size: 13px;
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
    font-size: 15px;
    color: #3d4c5a;
    font-weight: 700;
  }

  .cbp_tmtimeline > li .cbp_tmtime span:last-child {
    font-size: 14px;
    color: #444;
  }

  .cbp_tmtimeline > li .cbp_tmlabel {
    margin: 0 0 15px 25%;
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
    font-size: 16px;
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
    font-size: 16px;
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
    left: 20%;
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
    background-image: url('sembradora_act.png') !important;
    background-color: #ffc323 !important;
    background-size: cover !important;
    background-position: center !important;
  }

  .icono-cosecha {
    background-image: url('cosechadora_act.png') !important;
    background-color: #ffc323 !important;
    background-size: cover !important;
    background-position: center !important;
  }

  .icono-aplicacion {
    background-image: url('pulverizadora_act.png') !important;
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

export class TimelineElement extends LitElement {
  @property()
  a: Actividad[];

  //static: properties = {
  //actividades: {},
  //actividades_docs: {},
  //a: {},
  //db: {},
  //fsm: { state: true },
  //stock_tag_table: {},
  //};

  //static styles = [timeline_css];

  static override styles: CSSResultGroup = [unsafeCSS(bootstrap), timeline_css];

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
  
  evento_editar(act_doc : Actividad) {
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

  constructor() {
    super();
    // this.stock_tag_table = {};
  }

  willUpdate(props) {
    if (props.has("actividades") && this.db) {
      // Calcular tags
      let nt = {};
      // this.actividades.map((act) => {
      //   //console.log("CALC STOKS I")
      //   stock_suficiente(this.db, act).then((status) => {
      //     nt[act.uuid] = status;
      //     this.stock_tag_table = { ...nt };
      //   });
      // });

      // //console.log("StockTagTable", this.stock_tag_table)
    }
  }

  // createRenderRoot() {
  //   return this;
  // }

  comparar_fechas(a, b) {
    let fecha_a = extraer_fecha(a);
    let fecha_b = extraer_fecha(b);

    let result = compareDesc(fecha_a, fecha_b);
    if (result === 0) {
      // Si alguno es nota poner la nota primero
      if (a?.doc?.tipo === "nota") {
        result = 1;
      } else if (b?.doc?.tipo === "nota") {
        result = -1;
      }
    }
    // if (a es menor que b según criterio de ordenamiento) {
    //   return -1;
    // }

    // if (a es mayor que b según criterio de ordenamiento) {
    //   return 1;
    // }

    // a debe ser igual b
    return result;
  }

  ordenar_actividades(act, notas) {
    if (act === undefined) {
      act = [];
    }
    if (notas === undefined) {
      notas = [];
    }
    //console.log("ORDENADOR", act, notas);
    let todos = act.concat(notas);
    return todos.sort(this.comparar_fechas);
  }

  render() {
    let stock_tag = (stock_suficiente) => html` <p class="small">
      ${stock_suficiente
        ? html` <span class="badge bg-success">Stock Suficiente</span>`
        : html` <span class="badge bg-danger">Stock Insuficiente</span>`}
    </p>`;

    const time_item = (item : Actividad) => {
      if ("doc" in item) {
        // Es un documento
        //console.log("OOOOOOOOOOO NOTA", item)
        if (item.doc.tipo === "nota") {
          let fecha = item.doc.fecha;
          moment.locale("es");
          let elapsed = moment(fecha, "YYYY-MM-DD").fromNow();

          let imagenes = [];
          let audio = [];
          let nota_id = item.doc._id;

          let fecha_string = format(extraer_fecha(item), "dd-MM-yyyy");

          if ("_attachments" in item.doc) {
            Object.entries(item.doc._attachments).map(([key, item]) => {
              if (key.indexOf("foto") > -1) {
                imagenes.push(item);
              }
            });

            Object.entries(item.doc._attachments).map(([key, item]) => {
              if (key.indexOf("audio") > -1) {
                audio.push(item);
              }
            });

            //console.log("IMG", imagenes, "Audio", audio)
          }

          let color;
          if (item.doc.color === "red") {
            color = html`<span class="badge bg-danger float-end"
              >Urgente</span
            >`;
          } else if (item.doc.color === "yellow") {
            color = html`<span class="badge bg-warning float-end"
              >Atención</span
            >`;
          } else if (item.doc.color === "green") {
            color = html`<span class="badge bg-success float-end"
              >Todo Bien</span
            >`;
          }

          return html` <li>
            <time class="cbp_tmtime" datetime="2032-11-04T03:45"
              ><span>${fecha_string}</span> <span>${elapsed}</span></time
            >
            <div class="cbp_tmicon bg-blush">
              <i class="zmdi zmdi-label"></i>
            </div>
            <div class="cbp_tmlabel bg-nota">
              <h2><a class="strong">NOTA</a> ${color}</h2>

              ${item.doc.texto}

              <p class="small"></p>

              <div class="row mx-1">
                ${imagenes.map((img) => {
                  return html`<img
                    src=${URL.createObjectURL(img.data)}
                    class="img-thumbnail col col-4 col-sm-3"
                    alt="..."
                  />`;
                })}
              </div>

              <div class="row my-1">
                ${audio.length > 0
                  ? html`<audio controls><source .src=${URL.createObjectURL(
                      audio[0].data
                    )}></source></audio>`
                  : null}
              </div>

              <button
                class="btn btn-danger"
                @click=${() => {
                  console.log(item.uuid);
                  this.nota_eliminar(item.doc);
                }}
              >
                Eliminar
              </button>
              <button
                class="btn btn-danger"
                @click=${() => {
                  this.localizar(item.doc);
                }}
              >
                Localizar
              </button>
            </div>
          </li>`;
        }
      }

      //console.log("ITEM STT", this.stock_tag_table[item.uuid], item, item.uuid )
      if (item.tipo === "aplicacion") {
        // let fecha = item.detalles.fecha;
        // let hectareas = item.detalles.hectareas;
        // let insumos = item.detalles.insumos;
        // let comentarios = item.detalles.comentarios;
        // let list_of_ps = insumos.map(p_from_insumo);
        // let tipo_mayuscula = item.tipo.toUpperCase();
        // //console.log(moment.locale()); // en
        // moment.locale("es");
        // //console.log(moment.locale()); // en
        // let elapsed = moment(fecha, "YYYY-MM-DD").fromNow();
        // return html` <li>
        //   <time class="cbp_tmtime" datetime="2032-11-04T03:45"
        //     ><span>${fecha}</span> <span>${elapsed}</span></time
        //   >
        //   <div class="cbp_tmicon bg-blush"><i class="zmdi zmdi-label"></i></div>
        //   <div class="cbp_tmlabel bg-aplicacion">
        //     <h2>
        //       <a>APLICACIÓN</a>
        //       <span class="text-muted">en ${hectareas} has.</span>
        //     </h2>
        //     ${list_of_ps}
        //     <p class="small">${comentarios}</p>
        //     ${stock_tag(this.stock_tag_table[item.uuid])}
        //     <button
        //       class="btn btn-secondary"
        //       @click=${() => {
        //         console.log(item.uuid);
        //         this.evento_download_pdf(item.uuid);
        //       }}
        //     >
        //       Orden de Trabajo
        //     </button>
        //     ${navigator.share
        //       ? html`<button
        //           type="button"
        //           class="btn btn-success"
        //           @click=${() => this.evento_share_pdf(item.uuid)}
        //         >
        //           Compartir Orden
        //         </button>`
        //       : null}
        //     <button
        //       class="btn btn-danger"
        //       @click=${() => {
        //         console.log(item.uuid);
        //         this.evento_eliminar(item.uuid);
        //       }}
        //     >
        //       Eliminar
        //     </button>
        //   </div>
        // </li>`;
      } else if (item.tipo === "cosecha") {
        let fecha = item.detalles.fecha;
        let hectareas = item.detalles.hectareas;
        let rinde = item.detalles.rinde;
        let comentarios = item.detalles.comentarios;
        let humedad = item.detalles.humedad;

        //console.log(moment.locale()); // en
        moment.locale("es");
        //console.log(moment.locale()); // en
        let elapsed = moment(fecha, "YYYY-MM-DD").fromNow();

        return html`
          <li>
            <time class="cbp_tmtime" datetime="2032-11-04T03:45"
              ><span>${fecha}</span> <span>${elapsed}</span></time
            >
            <div class="cbp_tmicon bg-green">
              <i class="zmdi zmdi-label"></i>
            </div>
            <div class="cbp_tmlabel bg-cosecha">
              <h2>
                <a href="#">COSECHA</a>
                <span class="text-muted">de ${hectareas} has.</span>
              </h2>
              <p>Rinde: ${rinde} tn/ha - Humedad: ${humedad} %</p>
              <p class="small">${comentarios}</p>

              <button
                class="btn btn-secondary"
                @click=${() => {
                  console.log(item.uuid);
                  this.evento_download_pdf(item.uuid);
                }}
              >
                Orden de Trabajo
              </button>
              ${navigator.share
                ? html`<button
                    type="button"
                    class="btn btn-success"
                    @click=${() => this.evento_share_pdf(item.uuid)}
                  >
                    Compartir Orden
                  </button>`
                : null}
              <button
                class="btn btn-danger"
                @click=${() => {
                  console.log(item.uuid);
                  this.evento_eliminar(item.uuid);
                }}
              >
                Eliminar
              </button>
            </div>
          </li>
        `;
      } else if (item.tipo === "siembra") {
        let detalles : DetallesSiembra = item.detalles as DetallesSiembra;
        let fecha = item.detalles.fecha_ejecucion_tentativa;
        let hectareas = detalles.hectareas;
        let comentarios = item.comentario;
        let cultivo = detalles.insumo.marca_comercial;
        //let varidad = item.detalles.variedad;
        let peso_1000 = detalles.peso_1000;
        let densidad_objetivo = detalles.densidad_objetivo;
        let distancia = detalles.distancia;
        let contratista = item.contratista;

        //console.log(moment.locale()); // en
        moment.locale("es");
        //console.log(moment.locale()); // en
        let elapsed = moment(fecha, "YYYY-MM-DD").fromNow();

        let estado = item.estado;

        let is_planificada = isFuture(parseISO(fecha));

        return html`
          <li>
            <time class="cbp_tmtime" datetime="2032-11-04T03:45"
              ><span>${fecha}</span> <span>${elapsed}</span></time
            >
            <div class="icono-siembra cbp_tmicon bg-orange">
              <i class="zmdi zmdi-label"></i>
            </div>
            <div class="cbp_tmlabel bg-siembra">
              <h2>
                <a href="#">SIEMBRA</a>
                <span class="text-muted">en ${hectareas} has.</span>
                ${is_planificada ? html`<span class="badge bg-success rounded-pill float-end">Planificada</span>`:null}
              </h2>
              
              <p><strong>${cultivo}</strong></p>
              <p>${densidad_objetivo} pl/ha - ${distancia} cm entre surcos</p>
              <p class="small">${comentarios}</p>

              <vaadin-combo-box
                class='d-flex'
                label="Estado"
                item-value-path="value"
                item-label-path="nombre"

                .items="${estados}"
                @selected-item-changed=${(e) => {
                  item.estado = e.detail.value.value
                  console.log("Evento Cambiar estado", e, item);

                  let event = new CustomEvent("cambio-estado", {detail:{e:e,item:item},bubbles:true,composed:true});
                  this.dispatchEvent(event);
                }}
                value=${estado}
              ></vaadin-combo-box>

              <button
                class="btn btn-primary"
                @click=${() => {
                  console.log(item.uuid);
                  this.evento_editar(item);
                }}
              >
                Editar
              </button>

              <button
                class="btn btn-secondary"
                @click=${() => {
                  console.log(item.uuid);
                  this.evento_download_pdf(item);
                }}
              >
                Orden de Trabajo
              </button>
              ${navigator.share
                ? html`<button
                    type="button"
                    class="btn btn-success"
                    @click=${() => this.evento_share_pdf(item)}
                  >
                    Compartir Orden
                  </button>`
                : null}
              <button
                class="btn btn-danger"
                @click=${() => {
                  console.log(item.uuid);
                  this.evento_eliminar(item);
                }}
              >
                Eliminar
              </button>


            </div>
          </li>
        `;
      } else if (item.tipo === "nota") {
      } else if (item.tipo === "otro") {
      }
    };

    return html`<div class="container-fluid">
      <div class="row">
        <div class="col-md-10">
          <ul class="cbp_tmtimeline">
            ${this.a?.map(time_item) || null}
          </ul>
        </div>
      </div>
    </div>`;

    // return timeline(this.actividades || [], this.evento_pdf);
    //${map(
    //   this.ordenar_actividades(this.actividades, this.actividades_docs),
    //   time_item
    // )}
  }
}

customElements.define("lit-timeline", TimelineElement);
