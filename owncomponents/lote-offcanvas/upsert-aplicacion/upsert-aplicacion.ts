import { Router, RouterLocation } from "@vaadin/router";
import {
  LitElement,
  html,
  PropertyValueMap,
  CSSResultGroup,
  unsafeCSS,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import { Modal } from "bootstrap";
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import gbl_state from "../../state";
import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/button";
import "@vaadin/details";
import "@vaadin/horizontal-layout";
import "@vaadin/upload";
import "@vaadin/menu-bar";
import { badge } from "@vaadin/vaadin-lumo-styles/badge";
import { base_i18n } from "../repetir-aplicacion/date-picker-i18n";
import "@vaadin/grid";
import "@vaadin/grid/vaadin-grid-tree-column.js";
import "@vaadin/grid/vaadin-grid-selection-column.js";
import "@vaadin/horizontal-layout";
import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/vaadin-lumo-styles/vaadin-iconset.js";
import "@vaadin/tooltip";
import "@vaadin/date-picker";
import "@vaadin/number-field";
import "@vaadin/multi-select-combo-box";
import "@vaadin/text-area";
import "@vaadin/form-layout";
import "@vaadin/form-layout/vaadin-form-item";
import type { FormLayoutResponsiveStep } from "@vaadin/form-layout";
import labores from "../../jsons/labores.json";
import "./insert_insumo_template";
import { uuid4 } from "uuid4";
import { Notification } from "@vaadin/notification";
import { get, translate, translateUnsafeHTML } from "lit-translate";
import { columnBodyRenderer } from "@vaadin/grid/lit.js";
import {
  Actividad,
  DetallesAplicacion,
  get_empty_aplicacion,
  LineaDosis,
  LineaLabor,
} from "../../depositos/depositos-types";
import { format, parse } from "date-fns";
import {
  Contratista,
  getContratistas,
} from "../../contratistas/contratista-types";
import {
  getInsumos,
  get_lista_insumos,
  Insumo,
} from "../../insumos/insumos-types";
import { deepcopy, get_lote_by_names } from "../../helpers";
import { ComboBox } from "@vaadin/combo-box";
import { TextField } from "@vaadin/text-field";
import { MultiSelectComboBox } from "@vaadin/multi-select-combo-box";
import { TabSheet } from "@vaadin/tabsheet";
import { motivos_items } from "../../jsons/motivos_items";
import "./grid_insumos";
import "./grid_labores";

@customElement("upsert-aplicacion")
export class UpsertAplicacion extends LitElement {
  static override styles?: CSSResultGroup = [unsafeCSS(bootstrap)];

  @property()
  location: RouterLocation;

  @state()
  selected_step: number = 0;

  @state()
  loading: bootstrap = false;

  private modal: Modal;

  @state()
  dialogOpened: boolean = false;

  private tipo: string;

  private actividad: Actividad;
  private editando: boolean = false;
  private contratistas: Contratista[];
  private insumos: Insumo[];
  private linea_de_dosis: LineaDosis;
  private lote_doc: any;
  private linea_de_labor: LineaLabor;



  override firstUpdated() {
    this.modal = new Modal(this.shadowRoot.getElementById("modal"));
    this.modal.show();  
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    console.count("UpsertAplicacion-WillUpdate");
    if (_changedProperties.has("location")) {
      //
      this.inicializar_lineas();
      this.populateContratistas();
      this.populateInsumos();

      if (this.location.params?.tipo) {
        this.inicializar_adicion();
      } else {
        this.inicializar_edicion();
      }
    }
  }

  inicializar_lineas() {
    this.linea_de_dosis = {
      dosis: 0,
      insumo: null,
      motivos: [],
      uuid: "",
      total: 0,
      precio_estimado: 0,
    };

    this.linea_de_labor = {
      uuid: "",
      labor: { labor: "", uuid: "" },
      costo: 0,
      observacion: "",
    };
  }

  inicializar_adicion() {
    // Es una nueva
    this.tipo = this.location.params.tipo as string;

    this.actividad = get_empty_aplicacion();
    this.actividad.tipo = this.tipo;

    let lote_nombre = decodeURIComponent(
      this.location.params.uuid_lote as string
    );
    let campo_nombre = decodeURIComponent(
      this.location.params.uuid_campo as string
    );

    this.getLote(campo_nombre, lote_nombre);

    this.actividad.detalles.fecha_ejecucion_tentativa = format(
      new Date(),
      "yyyy-MM-dd"
    );
  }

  inicializar_edicion() {
    // Editando
    this.editando = true;
    this.loading = true;

    this.actividad = get_empty_aplicacion();

    let lote_nombre = decodeURIComponent(
      this.location.params.uuid_lote as string
    );
    let campo_nombre = decodeURIComponent(
      this.location.params.uuid_campo as string
    );

    let actividad_uuid = decodeURIComponent(
      this.location.params.uuid as string
    );

    this.getActividad(actividad_uuid).then((actividad) => {
      this.actividad = actividad;
      this.getLote(campo_nombre, lote_nombre);
      this.loading = false;
    });
  }

  populateContratistas() {
    getContratistas(gbl_state.db).then((c) => {
      this.contratistas = c;
      console.log("Contratistas", c);
      this.requestUpdate();
    });
  }

  populateInsumos() {
    get_lista_insumos(gbl_state.db).then((i) => {
      this.insumos = i;
      console.log("insumos", i);
      this.requestUpdate();
    });
  }

  getLote(campo_nombre, lote_nombre) {
    get_lote_by_names(gbl_state.db, campo_nombre, lote_nombre).then(
      (result) => {
        this.lote_doc = result;
        console.log("LoteDoc", this.lote_doc);
        this.actividad.detalles.hectareas = this.lote_doc.properties.hectareas;
        this.actividad.lote_uuid = this.lote_doc.properties.uuid;
      }
    );
  }

  async getActividad(uuid) {
    return gbl_state.db
      .allDocs({ startkey: "actividad", endkey: "actividad\ufff0" })
      .then((result) => {
        let actividad_id = result.rows.find((row) => row.id.includes(uuid));
        return gbl_state.db.get(actividad_id.id).then((result) => {
          return result as Actividad;
        });
      });
  }

  agregarLineaInsumo() {
    if (this.linea_de_dosis.insumo === null) {
      alert("Debe seleccionar un insumo");
      return;
    }

    this.linea_de_dosis.uuid = uuid4();
    this.actividad.detalles.dosis.push(this.linea_de_dosis);
    this.actividad.detalles.dosis = deepcopy(this.actividad.detalles.dosis);
    this.inicializar_lineas();

    this.requestUpdate();

    // Usar document porque estan en un modal que salta
    // (document.querySelector("#insumo1") as ComboBox).clear();
    // (document.querySelector("#insumo2") as TextField).clear();
    // (document.querySelector("#insumo3") as TextField).clear();
    // (document.querySelector("#insumo4") as MultiSelectComboBox).clear();
  }

  guardar() {


    /* chequeos */
    let errors = [];
    if(this.actividad.contratista === null){
      errors.push("Debe seleccionar un contratista");
    }

    if(this.actividad.detalles.dosis.length === 0){
      errors.push("Debe agregar algun Insumo");
   }

   if(errors.length > 0){
    alert(errors.join("\n"))
    return
   }



    let fecha = format(
      parse(
        this.actividad.detalles.fecha_ejecucion_tentativa,
        "yyyy-MM-dd",
        new Date()
      ),
      "yyyyMMdd"
    );
    this.actividad._id = "actividad:" + fecha + ":" + this.actividad.uuid;

    gbl_state.db.put(this.actividad).then(() => {
      alert("Actividad Guardada");

      let lote_nombre = this.location.params.uuid_lote as string;

      let campo_nombre = this.location.params.uuid_campo as string;

      let lote_url = gbl_state.router.urlForPath(
        "/campo/:uuid_campo/lote/:uuid_lote",
        { uuid_campo: campo_nombre, uuid_lote: lote_nombre }
      );
      Router.go(lote_url);
      this.modal.hide();
    });
  }

  private responsiveSteps: FormLayoutResponsiveStep[] = [
    { minWidth: 0, columns: 1 },
    { minWidth: "20em", columns: 4 },
  ];

  render() {
    const labores_form = html`
        <grid-labores .actividad=${this.actividad} .labores=${labores}></grid-labores>
   `;

    console.count("UpsertAplicacion-Render");

    return html`
      <div id="modal" class="modal" tabindex="-1" @cerrar-modal=${()=>this.modal.hide()} @abrir-modal=${()=>this.modal.show()}
      @nueva-linea-insumo=${(e : CustomEvent)=>{
        this.agregarLineaInsumo()
      }}
      >
        <!-- Full screen modal -->
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Actividad</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${() => Router.go("/")}
              ></button>
            </div>
            <div class="modal-body">
              <vaadin-tabsheet
                id="actividad-tabsheet"
                .selected=${this.selected_step}
                @selected-changed=${(e) => {
                  this.selected_step = e.target.selected;
                }}
              >
                <vaadin-tabs slot="tabs">
                  <vaadin-tab id="contratista-tab">Contratista</vaadin-tab>
                  <vaadin-tab id="insumos-tab">Insumos</vaadin-tab>
                  <vaadin-tab id="labores-tab">Labores</vaadin-tab>
                  <vaadin-tab id="condiciones-tab">Condiciones</vaadin-tab>
                  <vaadin-tab id="observaciones-tab">Observaciones</vaadin-tab>
                </vaadin-tabs>

                <!-- Contratista -->
                <div tab="contratista-tab">
                  <vaadin-form-layout>
                    <vaadin-combo-box
                      label="Contratista"
                      item-label-path="nombre"
                      item-value-path="uuid"
                      helper-text=${this.contratistas?.length === 0
                        ? translate("no_contratistas")
                        : ""}
                      required
                      error-message=${translate("campo_requerido")}
                      colspan="2"
                      .selectedItem=${this.actividad.contratista}
                      .items="${this.contratistas}"
                      @selected-item-changed=${(e) => {
                        this.actividad.contratista = e.detail.value;
                      }}
                    ></vaadin-combo-box>

                    <vaadin-date-picker
                      label=${translate("fecha")}
                      helper-text="Tentativa de ejecución"
                      value="2022-12-03"
                      placeholder="YYYY-MM-DD"
                      .i18n=${base_i18n}
                      theme="helper-above-field"
                      .value=${this.actividad.detalles
                        .fecha_ejecucion_tentativa}
                      @change=${(e) =>
                        (this.actividad.detalles.fecha_ejecucion_tentativa =
                          e.target.value)}
                    ></vaadin-date-picker>

                    <vaadin-number-field
                      label="Hectareas"
                      helper-text="de aplicación"
                      value=${this.actividad.detalles.hectareas}
                      theme="helper-above-field"
                      @change=${(e) =>
                        (this.actividad.detalles.hectareas = +e.target.value)}
                    >
                      <div slot="suffix">Ha.</div>
                    </vaadin-number-field>
                  </vaadin-form-layout>
                </div>
                <!-- Fin Contratista -->

                <!-- Insumos -->
                <div tab="insumos-tab">
                  <vaadin-horizontal-layout
                    theme="spacing"
                    style="align-self: stretch;"
                  >
                    Puede ingresar tanto la dosis por hectarea como el total por
                    lote y los valores se ajustaran automaticamente
                  </vaadin-horizontal-layout>

                  <grid-insumos .actividad=${this.actividad} .insumos=${this.insumos}></grid-insumos>
                    
                </div>
                <!-- Fin Insumos -->

                <!--Labores-->
                <div tab="labores-tab">${labores_form}</div>
                <!-- Fin Labores -->

                <!-- observaciones -->
                <div tab="observaciones-tab">
                  <vaadin-horizontal-layout
                    theme="spacing"
                    style="width: 100%;"
                  >
                    <vaadin-text-area
                      style="flex-grow: 1; margin: var(--lumo-space-s);"
                      value=${this.actividad.comentario}
                      helper-text="Ingrese comentarios, notas o aclaraciones que considere necesarias"
                      @input=${(e) => {
                        this.actividad.comentario = "" + e.target.value;
                      }}
                    ></vaadin-text-area>
                  </vaadin-horizontal-layout>
                </div>
                <!-- observaciones-->

                <div tab="condiciones-tab">
                  Ingrese los umbrales para los valores recomendados de las
                  variables meteorológicas.

                  <vaadin-form-layout
                    style="width: 100%; height: 100%; align-items: center; margin: var(--lumo-space-s);"
                  >
                    <vaadin-text-field
                      label="Temperatura Min"
                      value=${this.actividad.condiciones.temperatura_min}
                      @input=${(e) => {
                        this.actividad.condiciones.temperatura_min =
                          +e.target.value;
                      }}
                      theme="align-right"
                      type="text"
                    >
                      <div slot="suffix">ºC</div>
                    </vaadin-text-field>
                    <vaadin-text-field
                      label="Temperatura Max"
                      value=${this.actividad.condiciones.temperatura_max}
                      @input=${(e) => {
                        this.actividad.condiciones.temperatura_max =
                          +e.target.value;
                      }}
                      theme="align-right"
                      type="text"
                    >
                      <div slot="suffix">ºC</div>
                    </vaadin-text-field>

                    <vaadin-text-field
                      label="Humedad Min"
                      value=${this.actividad.condiciones.humedad_min}
                      theme="align-right"
                      @input=${(e) => {
                        this.actividad.condiciones.humedad_min =
                          +e.target.value;
                      }}
                      type="text"
                    >
                      <div slot="suffix">%</div>
                    </vaadin-text-field>
                    <vaadin-text-field
                      label="Humedad Max"
                      value=${this.actividad.condiciones.humedad_max}
                      @input=${(e) => {
                        this.actividad.condiciones.humedad_max =
                          +e.target.value;
                      }}
                      theme="align-right"
                      type="text"
                    >
                      <div slot="suffix">%</div>
                    </vaadin-text-field>

                    <vaadin-text-field
                      label="Viento Min"
                      value=${this.actividad.condiciones.velocidad_min}
                      theme="align-right"
                      @input=${(e) => {
                        this.actividad.condiciones.velocidad_min =
                          +e.target.value;
                      }}
                      type="text"
                    >
                      <div slot="suffix">km/h</div>
                    </vaadin-text-field>
                    <vaadin-text-field
                      label="Viento Max"
                      value=${this.actividad.condiciones.velocidad_max}
                      @input=${(e) => {
                        this.actividad.condiciones.velocidad_max =
                          +e.target.value;
                      }}
                      theme="align-right"
                      type="text"
                    >
                      <div slot="suffix">km/h</div>
                    </vaadin-text-field>
                  </vaadin-form-layout>
                </div>
                <!-- Fin Condiciones -->
              </vaadin-tabsheet>
            </div>
            <!-- Fin Body modal -->
            <div class="modal-footer">
              <button
                type="button"
                tabindex="-1"
                class="btn btn-secondary"
                @click=${() =>
                  (this.selected_step =
                    this.selected_step > 0
                      ? this.selected_step - 1
                      : this.selected_step)}
              >
                Atras
              </button>

              ${(document.querySelector("#actividad-tabsheet") as TabSheet)
                ?.items.length -
                1 ===
              this.selected_step
                ? html`<button
                    type="button"
                    class="btn btn-primary"
                    @click=${this.guardar}
                  >
                    Guardar
                  </button>`
                : html` <button
                    type="button"
                    class="btn btn-primary"
                    @click=${() =>
                      (this.selected_step =
                        this.selected_step >= 4
                          ? this.selected_step
                          : this.selected_step + 1)}
                  >
                    Siguiente
                  </button>`}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

function truncar(x) {
  return +x.toPrecision(4);
}

// <vaadin-form-layout
//                      .responsiveSteps=${this.responsiveSteps}
//                    >
//                     ${insert_insumos_template(this)}
//                      <vaadin-combo-box
//                        id="insumo1"
//                        label="Insumo"
//                        style="width:16em"
//                        colspan="2"
//                        item-label-path="marca_comercial"
//                        item-value-path="uuid"
//                        .items="${this.insumos}"
//                        .selected-item=${this.linea_de_dosis.insumo}
//                        @selected-item-changed=${(e) => {
//                          this.linea_de_dosis.insumo = e.detail.value;
//                          this.linea_de_dosis.precio_estimado =
//                            this.linea_de_dosis.insumo?.precio || 0 ;
//                          this.requestUpdate();
//                        }}
//                      ></vaadin-combo-box>

//                      <vaadin-text-field
//                        label="Dosis"
//                        id="insumo2"
//                        colspan="1"
//                        .value="${this.linea_de_dosis.dosis}"
//                        @input=${(e) => {
//                          this.linea_de_dosis.dosis = +e.target.value;
//                          this.linea_de_dosis.total = truncar(
//                            this.linea_de_dosis.dosis *
//                              this.actividad.detalles.hectareas
//                          );
//                          this.requestUpdate();
//                        }}
//                        clear-button-visible
//                      >
//                        <div slot="suffix">
//                          ${this.linea_de_dosis.insumo
//                            ? this.linea_de_dosis.insumo.unidad + "/ha"
//                            : ""}
//                        </div>
//                      </vaadin-text-field>

//                      <vaadin-text-field
//                        label="Total"
//                        id="insumo3"
//                        colspan="1"
//                        value="${this.linea_de_dosis.total}"
//                        @input=${(e) => {
//                          this.linea_de_dosis.total = +e.target.value;
//                          this.linea_de_dosis.dosis = truncar(
//                            this.linea_de_dosis.total /
//                              this.actividad.detalles.hectareas
//                          );
//                          this.requestUpdate();
//                        }}
//                      >
//                        <div slot="suffix">
//                          ${this.linea_de_dosis.insumo?.unidad || ""}
//                        </div>
//                      </vaadin-text-field>

//                      <vaadin-multi-select-combo-box
//                        label="Motivo"
//                        colspan="2"
//                        id="insumo4"
//                        style="width:20em"
//                        item-label-path="nombre"
//                        item-id-path="id"
//                        .items="${motivos_items}"
//                        .selected-items=${this.linea_de_dosis.motivos}
//                        @selected-items-changed=${(e) => {
//                          this.linea_de_dosis.motivos = e.target.selectedItems;
//                        }}
//                      ></vaadin-multi-select-combo-box>

//                      <vaadin-number-field
//                        label="Precio"
//                        colspan="1"
//                        .value=${this.linea_de_dosis.precio_estimado}
//                        @change=${(e) => {
//                          this.linea_de_dosis.precio_estimado = e.target.value;
//                        }}
//                      >
//                        <div slot="suffix">
//                          ${this.linea_de_dosis.insumo?.unidad
//                            ? "USD/" + this.linea_de_dosis.insumo.unidad
//                            : ""}
//                        </div>
//                      </vaadin-number-field>

//                      <vaadin-button
//                        colspan="1"
//                        theme="primary"
//                        @click=${this.agregarLineaInsumo}
//                        >Agregar</vaadin-button
//                      >
//                    </vaadin-form-layout>



// <vaadin-form-layout
// .responsiveSteps=${this.responsiveSteps}
// >
// <vaadin-combo-box
//   item-label-path="labor"
//   item-value-path="uuid"
//   label=${translate("labor")}
//   .items=${labores}
//   @selected-item-changed=${(e) => {
//     this.linea_de_labor.labor = e.detail.value;
//   }}
// ></vaadin-combo-box>
// <vaadin-number-field
//   label=${translate("costo")}
//   @input=${(e) => {
//     this.linea_de_labor.costo = e.target.value;
//   }}
// >
//   <div slot="suffix">USD</div>
// </vaadin-number-field>
// <vaadin-text-field
//   label=${translate("comentario")}
//   @input=${(e) => {
//     this.linea_de_labor.observacion = e.target.value;
//   }}
// ></vaadin-text-field>
// <vaadin-button
//   @click=${() => {
//     this.linea_de_labor.uuid = uuid4();
//     let copy = deepcopy(this.linea_de_labor);
//     this.actividad.detalles.costo_labor.push(copy);
//     this.actividad.detalles.costo_labor = deepcopy(
//       this.actividad.detalles.costo_labor
//     );
//     this.inicializar_lineas();
//     this.requestUpdate();
//   }}
// >
//   ${translate("agregar")}
// </vaadin-button>
// </vaadin-form-layout>
// ${this.actividad.detalles.costo_labor.length > 0
// ? html`<vaadin-grid .items=${this.actividad.detalles.costo_labor}>
//     <vaadin-grid-column
//       header="${translate("labor")}"
//       auto-width
//       ${columnBodyRenderer<LineaLabor>(
//         (item: LineaLabor) => html` <vaadin-combo-box
//           item-label-path="labor"
//           item-value-path="uuid"
//           .selectedItem=${item.labor}
//           .items=${labores}
//           @selected-item-changed=${(e) => {
//             item.labor = e.detail.value;
//           }}
//         ></vaadin-combo-box>`,
//         this.actividad.detalles.costo_labor
//       )}
//     ></vaadin-grid-column>

//     <vaadin-grid-column
//       header="${translate("costo")}"
//       auto-width
//       ${columnBodyRenderer<LineaLabor>(
//         (item) => html` <vaadin-number-field
//           .value=${item.costo}
//           @input=${(e) => {
//             item.costo = e.target.value;
//           }}
//         ></vaadin-number-field>`,
//         []
//       )}
//     ></vaadin-grid-column>

//     <vaadin-grid-column
//       header="${translate("comentario")}"
//       auto-width
//       ${columnBodyRenderer<LineaLabor>(
//         (item: LineaLabor) => html` <vaadin-text-field
//           .value=${item.observacion}
//           @input=${(e) => {
//             item.observacion = e.target.value;
//           }}
//         ></vaadin-text-field>`,
//         []
//       )}
//     ></vaadin-grid-column>
//   </vaadin-grid>`
// : html`<div>${translate("no_hay_labores")}</div>`} 