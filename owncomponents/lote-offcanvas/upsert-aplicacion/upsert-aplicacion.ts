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
  get_empty_aplicacion,
  LineaDosis,
} from "../../depositos/depositos-types";
import { format } from "date-fns";
import {
  Contratista,
  getContratistas,
} from "../../contratistas/contratista-types";
import { getInsumos, Insumo } from "../../insumos/insumos-types";
import { deepcopy } from "../../helpers";
import { ComboBox } from "@vaadin/combo-box";
import { TextField } from "@vaadin/text-field";
import { MultiSelectComboBox } from "@vaadin/multi-select-combo-box";

@customElement("upsert-aplicacion")
export class UpsertAplicacion extends LitElement {
  static override styles?: CSSResultGroup = [unsafeCSS(bootstrap)];

  @property()
  location: RouterLocation;

  @state()
  selected_step: number = 0;

  private modal: Modal;
  private tipo: string;

  private actividad: Actividad;
  private editando: boolean = false;
  private contratistas: Contratista[];
  private insumos: Insumo[];
  private linea_de_dosis: LineaDosis;

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
      this.linea_de_dosis = {
        dosis: 0,
        insumo: null,
        motivos: [],
        uuid: "",
        total: 0,
      };

      this.populateContratistas();
      this.populateInsumos();
      if (this.location.params?.tipo) {
        // Es una nueva
        this.tipo = this.location.params.tipo as string;
        this.actividad = get_empty_aplicacion();
        this.actividad.detalles.fecha_ejecucion_tentativa = format(
          new Date(),
          "yyyy-MM-dd"
        );
      }
    } else {
      // Editando
      this.editando = true;
    }
  }

  populateContratistas() {
    getContratistas(gbl_state.db).then((c) => {
      this.contratistas = c;
      console.log("Contratistas", c);
      this.requestUpdate();
    });
  }

  populateInsumos() {
    getInsumos(gbl_state.db).then((i) => {
      this.insumos = i;
      console.log("insumos", i);
      this.requestUpdate();
    });
  }

  getLote() {}

  borrar(dosis: LineaDosis) {
    let dosises = (this.actividad.detalles as DetallesAplicacion).dosis;
    let remanente = dosises.filter(
      (d) => d.uuid !== dosis.uuid
    ) as LineaDosis[];
    (this.actividad.detalles as DetallesAplicacion).dosis = remanente;
    this.requestUpdate();
  }

  agregarLineaInsumo() {
    this.linea_de_dosis.uuid = uuid4();
    this.actividad.detalles.dosis.push(this.linea_de_dosis);
    this.actividad.detalles.dosis = deepcopy(this.actividad.detalles.dosis);
    this.linea_de_dosis = {
      dosis: 0,
      insumo: null,
      motivos: [],
      uuid: "",
      total: 0,
    };
    this.requestUpdate();

    // Usar document porque estan en un modal que salta 
    (document.querySelector('#insumo1') as ComboBox).clear();
    (document.querySelector('#insumo2') as TextField).clear();
    (document.querySelector('#insumo3') as TextField).clear();
    (document.querySelector('#insumo4') as MultiSelectComboBox).clear();


  }

  render() {
    console.count("UpsertAplicacion-Render");
    return html`
      <div id="modal" class="modal" tabindex="-1">
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
                .selected=${this.selected_step}
                @selected-changed=${(e) => {
                  this.selected_step = e.target.selected;
                }}
              >
                <vaadin-tabs slot="tabs">
                  <vaadin-tab id="dashboard-tab">Contratista</vaadin-tab>
                  <vaadin-tab id="payment-tab">Insumos</vaadin-tab>
                  <vaadin-tab id="otrosdatos-tab">Otros Datos</vaadin-tab>
                  <vaadin-tab id="condiciones-tab">Condiciones</vaadin-tab>
                  <vaadin-tab id="shipping-tab">Observaciones</vaadin-tab>
                </vaadin-tabs>

                <!-- Contratista -->
                <div tab="dashboard-tab">
                  <vaadin-vertical-layout
                    style="width: 400px; max-width: 100%;"
                  >
                    <vaadin-combo-box
                      label="Contratista"
                      item-label-path="nombre"
                      item-value-path="uuid"
                      style="width: 100%;"
                      .selectedItem=${this.actividad.contratista}
                      .items="${this.contratistas}"
                      @selected-item-changed=${(e) => {
                        this.actividad.contratista = e.detail.value;
                      }}
                    ></vaadin-combo-box>

                    <vaadin-horizontal-layout
                      theme="spacing"
                      style="width: 100%; justify-content: space-around;"
                    >
                      <vaadin-date-picker
                        label="Fecha"
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
                    </vaadin-horizontal-layout>
                  </vaadin-vertical-layout>
                </div>
                <!-- Fin Contratista -->

                <!-- Insumos -->
                <div tab="payment-tab">
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
                      @change=${(e) => {
                        this.linea_de_dosis.dosis = +e.target.value;
                      }}
                      clear-button-visible
                    >
                      <div slot="suffix">
                        ${this.linea_de_dosis.insumo ? this.linea_de_dosis.insumo.unidad + "/ha" : ""}
                      </div>
                    </vaadin-text-field>

                    <vaadin-text-field
                      label="Total"
                      id="insumo3"
                      value="${this.linea_de_dosis.total}"
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
                      .items="${[{ nombre: "Plaga", id: 1 },{ nombre: "Enfermedad", id: 2 }]}"
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
                      .items=${(this.actividad.detalles as DetallesAplicacion)
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
                        }, this.actividad.detalles.dosis)}
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
                              @click=${() => this.borrar(item as LineaDosis)}
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
                <div tab="otrosdatos-tab">
                  <vaadin-horizontal-layout
                    theme="spacing"
                    style="width: 100%;"
                  >
                    <vaadin-text-area
                      style="flex-grow: 1; margin: var(--lumo-space-s);"
                      value=${this.actividad.comentario}
                    ></vaadin-text-area>
                  </vaadin-horizontal-layout>
                </div>
                <!-- Otros -->

                <!-- observaciones -->
                <div tab="shipping-tab">
                  <vaadin-horizontal-layout
                    theme="spacing"
                    style="width: 100%;"
                  >
                    <vaadin-text-area
                      style="flex-grow: 1; margin: var(--lumo-space-s);"
                      value=${this.actividad.comentario}
                    ></vaadin-text-area>
                  </vaadin-horizontal-layout>
                </div>
                <!-- observaciones-->

                <div tab="condiciones-tab">
                  <vaadin-vertical-layout
                    style="width: 100%; height: 100%; align-items: center; margin: var(--lumo-space-s);"
                  >
                    Ingrese los umbrales para los valores recomendados de las
                    variables meteorológicas.
                    <vaadin-horizontal-layout
                      theme="spacing"
                      style="flex-wrap: wrap; justify-content: center;"
                    >
                      <vaadin-text-field
                        label="Temperatura Min"
                        value="1000"
                        theme="align-right"
                        type="text"
                      >
                        <div slot="suffix">ºC</div>
                      </vaadin-text-field>
                      <vaadin-text-field
                        label="Temperatura Max"
                        value="1000"
                        theme="align-right"
                        type="text"
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
                        value="1000"
                        theme="align-right"
                        type="text"
                      >
                        <div slot="suffix">%</div>
                      </vaadin-text-field>
                      <vaadin-text-field
                        label="Humedad Max"
                        value="1000"
                        theme="align-right"
                        type="text"
                      >
                        <div slot="suffix">%%</div>
                      </vaadin-text-field>
                    </vaadin-horizontal-layout>
                    <vaadin-horizontal-layout
                      theme="spacing"
                      style="flex-wrap: wrap; justify-content: center;"
                    >
                      <vaadin-text-field
                        label="Viento Min"
                        value="1000"
                        theme="align-right"
                        type="text"
                      >
                        <div slot="suffix">km/h</div>
                      </vaadin-text-field>
                      <vaadin-text-field
                        label="Viento Max"
                        value="2"
                        theme="align-right"
                        type="text"
                      >
                        <div slot="suffix">km/h</div>
                      </vaadin-text-field>
                    </vaadin-horizontal-layout>
                  </vaadin-vertical-layout>
                </div>
              </vaadin-tabsheet>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary">Atras</button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() =>
                  (this.selected_step =
                    this.selected_step >= 4
                      ? this.selected_step
                      : this.selected_step + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
