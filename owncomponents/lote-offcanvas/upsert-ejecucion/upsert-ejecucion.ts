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

import { uuid4 } from "uuid4";
import { Notification } from "@vaadin/notification";
import { get, translate, translateUnsafeHTML } from "lit-translate";
import { columnBodyRenderer } from "@vaadin/grid/lit.js";
import {
  Actividad,
  DetallesAplicacion,
  DetallesEjecucion,
  Ejecucion,
  get_empty_aplicacion,
  get_empty_ejecucion,
  LineaDosis,
  LineaDosisEjecucion,
} from "../../depositos/depositos-types";
import { format, parse } from "date-fns";
import {
  Contratista,
  getContratistas,
} from "../../contratistas/contratista-types";
import { getInsumos, Insumo } from "../../insumos/insumos-types";
import { deepcopy, get_lote_by_names } from "../../helpers";
import { ComboBox } from "@vaadin/combo-box";
import { TextField } from "@vaadin/text-field";
import { MultiSelectComboBox } from "@vaadin/multi-select-combo-box";
import { TabSheet } from "@vaadin/tabsheet";

@customElement("upsert-ejecucion")
export class UpsertEjecucion extends LitElement {
  static override styles?: CSSResultGroup = [unsafeCSS(bootstrap)];

  @property()
  location: RouterLocation;

  @state()
  selected_step: number = 0;

  private modal: Modal;
  private tipo: string;

  private actividad: Actividad;
  private ejecucion: Ejecucion;
  private editando: boolean = false;
  private insumos: Insumo[];
  private linea_de_dosis: LineaDosisEjecucion;
  private lote_doc: any;

  override firstUpdated() {
    this.modal = new Modal(this.shadowRoot.getElementById("modal"));
    this.modal.show();
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    console.count("UpsertEjecucion-WillUpdate");
    if (_changedProperties.has("location")) {
      //
      this.linea_de_dosis = {
        dosis: 0,
        insumo: null,
        motivos: [],
        uuid: "",
        total: 0,
        precio_estimado: 0,
      };

      this.populateInsumos();

      //Es una aplicacion Nueva
      if (this.location.pathname.includes("nueva")) {
        console.log("Nueva Ejecución");
        this.editando = false;

        this.ejecucion = get_empty_ejecucion();
        let actividad_uuid = this.location.params.uuid;
        this.getActividad(actividad_uuid);
      } else {
        this.editando = true;
      }
    }
  }

  populateInsumos() {
    getInsumos(gbl_state.db).then((i) => {
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

  copiarInsumosDesdeActividad() {
    this.ejecucion.detalles.fecha_ejecucion =
      this.actividad.detalles.fecha_ejecucion_tentativa;
    this.ejecucion.detalles.hectareas = this.actividad.detalles.hectareas;
    this.ejecucion.lote_uuid = this.actividad.lote_uuid;
    this.ejecucion.uuid = this.actividad.uuid;

    this.actividad.detalles.dosis.forEach((dosis) => {
      let enl: LineaDosisEjecucion = deepcopy(dosis);
      enl.precio_real = enl.precio_estimado;
      this.ejecucion.detalles.dosis.push(enl);
    });
  }

  getActividad(uuid) {
    gbl_state.db
      .allDocs({ startkey: "actividad:", endkey: "actividad:_\ufff0" })
      .then((result) => {
        if (result.rows) {
          let midoc = result.rows.find((doc) => doc.id.includes(uuid));
          if (midoc) {
            gbl_state.db.get(midoc.id).then((doc) => {
              this.actividad = doc as Actividad;
              this.copiarInsumosDesdeActividad();
              this.requestUpdate();
            });
          }
        }
      });
    // gbl_state.db.get("actividad")
  }

  borrar(dosis: LineaDosisEjecucion) {
    let dosises = this.ejecucion.detalles.dosis;
    let remanente = dosises.filter(
      (d) => d.uuid !== dosis.uuid
    ) as LineaDosisEjecucion[];
    this.ejecucion.detalles.dosis = remanente;
    this.requestUpdate();
  }

  agregarLineaInsumo() {
    if (this.linea_de_dosis.insumo === null) {
      alert("Debe seleccionar un insumo");
      return;
    }

    this.linea_de_dosis.uuid = uuid4();
    this.actividad.detalles.dosis.push(this.linea_de_dosis);
    this.actividad.detalles.dosis = deepcopy(this.actividad.detalles.dosis);
    this.linea_de_dosis = {
      dosis: 0,
      insumo: null,
      motivos: [],
      uuid: "",
      total: 0,
      precio_estimado: 0,
	  precio_real:0
    };

    this.requestUpdate();

    // Usar document porque estan en un modal que salta
    (document.querySelector("#insumo1") as ComboBox).clear();
    (document.querySelector("#insumo2") as TextField).clear();
    (document.querySelector("#insumo3") as TextField).clear();
    (document.querySelector("#insumo4") as MultiSelectComboBox).clear();
  }

  guardar() {
    let fecha = format(
      parse(this.ejecucion.detalles.fecha_ejecucion, "yyyy-MM-dd", new Date()),
      "yyyyMMdd"
    );
    this.ejecucion._id = "ejecucion:" + fecha + ":" + this.ejecucion.uuid;

    gbl_state.db.put(this.ejecucion).then(() => {
      alert("Ejecucion Guardada");

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

  render() {
    console.count("UpsertEjecucion-Render");
    return html`
      <div id="modal" class="modal" tabindex="-1">
        <!-- Full screen modal -->
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Ejecución</h5>
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
                  <vaadin-tab id="dashboard-tab">Fecha</vaadin-tab>
                  <vaadin-tab id="payment-tab">Insumos</vaadin-tab>
                  ${this.tipo === "siembra" || this.tipo === "cosecha"
                    ? html`<vaadin-tab id="otrosdatos-tab"
                        >Otros Datos</vaadin-tab
                      >`
                    : null}

                  <vaadin-tab id="condiciones-tab">Condiciones</vaadin-tab>
                  <vaadin-tab id="costo-labor-tab">Costo Labor</vaadin-tab>
                  <vaadin-tab id="aporte-social-tab">Aporte Societario</vaadin-tab>
                  <vaadin-tab id="shipping-tab">Observaciones</vaadin-tab>
                </vaadin-tabs>

                <!-- Contratista -->
                <div tab="dashboard-tab">

  <vaadin-form-layout>
                    <vaadin-combo-box
                      label="Contratista"
                      item-label-path="nombre"
                      item-value-path="uuid"
                      helper-text="Solo puede cambiar el contratista si modifica la planificación"
                      style="width: 100%;"
                      .selectedItem=${this.actividad.contratista}
                      readonly
                      colspan="2"
                    ></vaadin-combo-box>

                    <vaadin-date-picker
                      label=${translate("fecha")}
                      helper-text="Tentativa de ejecución"
                      value="2022-12-03"
                      placeholder="YYYY-MM-DD"
                      error-message="Debe seleccionar una fecha igual o posterior a la planificación"
                      .min="${this.actividad.detalles.fecha_ejecucion_tentativa}"
                      .max="${gbl_state.campana_seleccionada.fin}"
                      .i18n=${base_i18n}
                      theme="helper-above-field"
                      .value=${this.actividad.detalles
                        .fecha_ejecucion_tentativa}
                      @change=${(e) =>
                        (this.ejecucion.detalles.fecha_ejecucion =
                          e.target.value)}
                    ></vaadin-date-picker>

                    <vaadin-number-field
                      label="Hectareas"
                      helper-text="de aplicación"
                      value=${this.actividad.detalles.hectareas}
                      theme="helper-above-field"
                      @change=${(e) =>
                        (this.ejecucion.detalles.hectareas = +e.target.value)}
                    >
                      <div slot="suffix">Ha.</div>
                    </vaadin-number-field>
                  </vaadin-form-layout>
                </div>
                <!-- Fin Contratista -->

                <!-- Insumos -->
                <div tab="payment-tab">


				<vaadin-horizontal-layout
                      theme="spacing"
                      style="align-self: stretch;"
                    >
					Puede modificar/agregar/eliminar tanto los insumos, dosis y
                    precios de acuerdo a los valores REALES ejecutados.
				</vaadin-horizontal-layout>

                  <vaadin-horizontal-layout
                    theme="spacing-s"
                    style="align-items: baseline; align-self: center; flex-wrap: wrap; flex-direction: row; justify-content: center;"
                  >
                    <vaadin-combo-box
                      id="insumo1"
                      label="Insumo"
                      style="width:16em"
                      item-label-path="marca_comercial"
                      item-value-path="uuid"
                      .items="${this.insumos}"
                      .selected-item=${this.linea_de_dosis.insumo}
                      @selected-item-changed=${(e) => {
                        this.linea_de_dosis.insumo = e.detail.value;
                        this.requestUpdate();
                      }}
                    ></vaadin-combo-box>
                    <vaadin-text-field
                      label="Dosis"
                      id="insumo2"
                      .value="${this.linea_de_dosis.dosis}"
                      @input=${(e) => {
                        this.linea_de_dosis.dosis = +e.target.value;
                        this.linea_de_dosis.total =
                          this.linea_de_dosis.dosis *
                          this.actividad.detalles.hectareas;
                        this.requestUpdate();
                      }}
                      clear-button-visible
                    >
                      <div slot="suffix">
                        ${this.linea_de_dosis.insumo
                          ? this.linea_de_dosis.insumo.unidad + "/ha"
                          : ""}
                      </div>
                    </vaadin-text-field>

                    <vaadin-text-field
                      label="Total"
                      id="insumo3"
                      value="${this.linea_de_dosis.total}"
                      @input=${(e) => {
                        this.linea_de_dosis.total = +e.target.value;
                        this.linea_de_dosis.dosis =
                          this.linea_de_dosis.total /
                          this.actividad.detalles.hectareas;
                        this.requestUpdate();
                      }}
                    >
                      <div slot="suffix">
                        ${this.linea_de_dosis.insumo?.unidad || ""}
                      </div>
                    </vaadin-text-field>

                    <vaadin-multi-select-combo-box
                      label="Motivo"
                      id="insumo4"
                      style="width:20em"
                      item-label-path="nombre"
                      item-id-path="id"
                      .items="${[
                        { nombre: "Plaga", id: 1 },
                        { nombre: "Enfermedad", id: 2 },
                      ]}"
                      .selected-items=${this.linea_de_dosis.motivos}
                      @selected-items-changed=${(e) => {
                        this.linea_de_dosis.motivos = e.target.selectedItems;
                      }}
                    ></vaadin-multi-select-combo-box>

                    <vaadin-button
                      theme="primary"
                      @click=${this.agregarLineaInsumo}
                      >Agregar</vaadin-button
                    >
                  </vaadin-horizontal-layout>

                  <vaadin-vertical-layout
                    theme="spacing padding"
                    style="justify-content: center"
                  >
                    <vaadin-grid
                      .items=${(this.ejecucion.detalles as DetallesEjecucion)
                        .dosis}
                      style="width: 100%; max-width: 100%; align-self: center;"
                    >
                      <vaadin-grid-column
                        header="Nombre"
                        auto-width
                        ${columnBodyRenderer<LineaDosis>((item) => {
                          console.log("render item", item);
                          return html`<vaadin-vertical-layout
                            style="line-height: var(--lumo-line-height-s);"
                          >
                            <span>${item.insumo.marca_comercial}</span>
                            <span
                              style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);"
                            >
                              ${item.insumo.principio_activo}
                            </span>
                          </vaadin-vertical-layout>`;
                        }, this.ejecucion.detalles.dosis)}
                      ></vaadin-grid-column>

                      <vaadin-grid-column
                        header="Dosis (por ha.)"
                        auto-width
                        ${columnBodyRenderer<any>(
                          (item) => html` <vaadin-text-field
                            maxlength="5"
                            value=${item.dosis}
                            @change=${(e) => (item.dosis = +e.target.value)}
                          >
                            <div slot="suffix">${item.insumo.unidad}/Ha</div>
                          </vaadin-text-field>`,
                          []
                        )}
                      ></vaadin-grid-column>

                      <vaadin-grid-column
                        header="Total"
                        auto-width
                        ${columnBodyRenderer<LineaDosis>(
                          (item) => html` <vaadin-text-field
                            maxlength="5"
                            value=${item.total}
                            @change=${(e) => (item.total = +e.target.value)}
                          >
                            <div slot="suffix">${item.insumo.unidad}</div>
                          </vaadin-text-field>`,
                          []
                        )}
                      ></vaadin-grid-column>

                      <vaadin-grid-column
                        header="Motivos"
                        auto-width
                        ${columnBodyRenderer<LineaDosis>(
                          (item) => html`<vaadin-multi-select-combo-box
                            item-label-path="nombre"
                            item-id-path="id"
                            .items="${[{ nombre: "Plaga", id: 1 }]}"
                            .selectedItems=${item.motivos}
                          ></vaadin-multi-select-combo-box>`,
                          []
                        )}
                      ></vaadin-grid-column>

                      <vaadin-grid-column
                        frozen-to-end
                        auto-width
                        flex-grow="0"
                        ${columnBodyRenderer(
                          (item) => html`
                            <vaadin-button
                              @click=${() => this.borrar(item as LineaDosisEjecucion)}
                              theme="icon"
                              aria-label="borrar item"
                            >
                              <vaadin-icon icon="lumo:minus"></vaadin-icon>
                              <vaadin-tooltip
                                slot="tooltip"
                                text="Borrar"
                              ></vaadin-tooltip>
                            </vaadin-button>
                          `,
                          []
                        )}
                      ></vaadin-grid-column>
                    </vaadin-grid>
                  </vaadin-vertical-layout>
                </div>
                <!-- Fin Insumos -->

                <!-- Otros Datos -->
                ${this.tipo === "siembra" || this.tipo === "cosecha"
                  ? html`<div tab="otrosdatos-tab">
                      <vaadin-horizontal-layout
                        theme="spacing"
                        style="width: 100%;"
                      >
                        <vaadin-text-area
                          style="flex-grow: 1; margin: var(--lumo-space-s);"
                          value=${this.actividad.comentario}
                        ></vaadin-text-area>
                      </vaadin-horizontal-layout>
                    </div>`
                  : null}

                <!-- Otros -->

                <!-- observaciones -->
                <div tab="shipping-tab">
                  <vaadin-horizontal-layout
                    theme="spacing"
                    style="width: 100%;"
                  >
                    <vaadin-text-area
                      style="flex-grow: 1; margin: var(--lumo-space-s);"
                      value=${this.ejecucion.comentario}
                      helper-text="Ingrese comentarios, notas o aclaraciones que considere necesarias"
                      @input=${(e) => {
                        this.ejecucion.comentario = "" + e.target.value;
                      }}
                    ></vaadin-text-area>
                  </vaadin-horizontal-layout>
                </div>
                <!-- observaciones-->


				                <!-- Aporte Social -->
								<div tab="costo-labor-tab">
                  <vaadin-horizontal-layout
                    theme="spacing"
                    style="width: 100%;"
                  >
                    Proximamente... En Construcción
                  </vaadin-horizontal-layout>
                </div>

                <!-- aporte social-->
                <!-- Aporte Social -->
                <div tab="aporte-social-tab">
                  <vaadin-horizontal-layout
                    theme="spacing"
                    style="width: 100%;"
                  >
                    Proximamente... En Construcción
                  </vaadin-horizontal-layout>
                </div>
                <!-- aporte social-->

                <div tab="condiciones-tab">
                  <vaadin-vertical-layout
                    style="width: 100%; height: 100%; align-items: center; margin: var(--lumo-space-s);"
                  >
				  <vaadin-horizontal-layout
                      theme="spacing"
                      style="flex-wrap: wrap; justify-content: center;"
                    >

                    Ingrese los valores de las variables ambientales promedio al
                    momento de la labor.
                    <vaadin-button
                      theme="success"
                      >Cargar desde Centrales</vaadin-button
                    >
				</vaadin-horizontal-layout>

                    <vaadin-horizontal-layout
                      theme="spacing"
                      style="flex-wrap: wrap; justify-content: center;"
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
						readonly
                      >
                        <div slot="suffix">ºC</div>
                      </vaadin-text-field>

                      <vaadin-text-field
                        label="Temperatura"
                        value=${this.ejecucion.condiciones.temperatura_promedio}
                        @input=${(e) => {
                          this.ejecucion.condiciones.temperatura_promedio =
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
						readonly
                      >
                        <div slot="suffix">ºC</div>
                      </vaadin-text-field>
                    </vaadin-horizontal-layout>
                    <vaadin-horizontal-layout
                      theme="spacing"
                      style="flex-wrap: wrap; justify-content: center;"
                    >
					<vaadin-text-field
                        label="Humedad Min"
                        value=${this.actividad.condiciones.humedad_min}
                        theme="align-right"
                        @input=${(e) => {
                          this.actividad.condiciones.humedad_min =
                            +e.target.value;
                        }}
                        type="text"readonly
                      >
                        <div slot="suffix">%</div>
						
                      </vaadin-text-field>

                      <vaadin-text-field
                        label="Humedad"
                        value=${this.ejecucion.condiciones.humedad_promedio}
                        theme="align-right"
                        @input=${(e) => {
                          this.ejecucion.condiciones.humedad_promedio =
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
						readonly
                      >
                        <div slot="suffix">%</div>
                      </vaadin-text-field>
                    </vaadin-horizontal-layout>
                    <vaadin-horizontal-layout
                      theme="spacing"
                      style="flex-wrap: wrap; justify-content: center;"
                    >
					<vaadin-text-field
                        label="Viento Min"
                        value=${this.actividad.condiciones.velocidad_min}
                        theme="align-right"
                        @input=${(e) => {
                          this.actividad.condiciones.velocidad_min =
                            +e.target.value;
                        }}
                        type="text"
						readonly
                      >
                        <div slot="suffix">km/h</div>
                      </vaadin-text-field>

                      <vaadin-text-field
                        label="Viento Min"
                        value=${this.ejecucion.condiciones.velocidad_promedio}
                        theme="align-right"
                        @input=${(e) => {
                          this.ejecucion.condiciones.velocidad_promedio =
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
						readonly
                      >
                        <div slot="suffix">km/h</div>
                      </vaadin-text-field>

                    </vaadin-horizontal-layout>
                  </vaadin-vertical-layout>
                </div>
              </vaadin-tabsheet>
            </div>
            <div class="modal-footer">
              <button
                type="button"
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
                        this.selected_step >= 5
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
