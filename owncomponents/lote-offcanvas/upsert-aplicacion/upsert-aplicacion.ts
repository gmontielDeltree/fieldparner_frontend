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
import { labores } from "../../jsons/labores";
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
import { format, parse, parseISO } from "date-fns";
import {
  Contratista,
  getContratistas,
} from "../../contratistas/contratista-types";
import {
  getInsumos,
  get_lista_insumos,
  Insumo,
} from "../../insumos/insumos-types";
import { deepcopy, es_esta_campana, get_lote_by_names } from "../../helpers";
import { ComboBox } from "@vaadin/combo-box";
import { TextField } from "@vaadin/text-field";
import { MultiSelectComboBox } from "@vaadin/multi-select-combo-box";
import { TabSheet } from "@vaadin/tabsheet";
import { motivos_items } from "../../jsons/motivos_items";
import "./grid_insumos";
import "./grid_labores";
import { otros_datos_siembra_template } from "./otros_datos_siembra_template";
import { listar_ingenieros } from "../../ingenieros/ingenieros-funciones";
import { thumbnailsSettings } from "lightgallery/plugins/thumbnail/lg-thumbnail-settings";
import { Ingeniero } from "../../tipos/ingenieros";
import { showNotification } from "../../helpers/notificaciones";

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
  private motivos_sugeridos_iniciales;

  @state()
  ingenieros: Ingeniero[];

  private titulo: string = "Actividad";

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

  tipo_2_titulo = {
    siembra: get("siembra"),
    cosecha: get("cosecha"),
    aplicacion: get("aplicación"),
  };

  tipo_2_categorias_iniciales = {
    siembra: ["Semillas", "Combustible"],
    cosecha: ["Otros", "Combustible"],
    aplicacion: ["Agroquímicos", "Fertilizantes", "Combustible"],
  };

  full_title() {
    return (
      gbl_state.campana_seleccionada.nombre +
      " - " +
      get("planificacion") +
      " - " +
      this.tipo_2_titulo[this.tipo]
    );
  }
  inicializar_adicion() {
    // Es una nueva
    this.tipo = this.location.params.tipo as string;
    this.titulo = this.full_title();

    this.inicializar_lineas();
    this.populateContratistas();
    this.populateInsumos();
    this.populateIngenieros();

    this.actividad = get_empty_aplicacion();
    this.actividad.tipo = this.tipo;

    // Query params
    const querystring = window.location.search;
    const params = new URLSearchParams(querystring);
    let parametros_nota_str = decodeURIComponent(params.get("params"));
    let parametros = JSON.parse(parametros_nota_str);
    console.log("Params;", parametros === null);

    if (this.tipo === "aplicacion" && !(parametros === null)) {
      console.log(
        "Params;2",
        params,
        parametros_nota_str === null,
        params.get("params")
      );

      console.log("motivos_por_defecto_", parametros);
      this.motivos_sugeridos_iniciales = parametros.motivos;
      this.actividad.comentario =
        "Nota del " + parametros.fecha_nota + ":\n" + parametros.comentario;
    }

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

    this.inicializar_lineas();
    this.populateInsumos();
    this.populateIngenieros();
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
      this.tipo = actividad.tipo;
      this.titulo = this.full_title();

      this.populateContratistas();
      this.getLote(campo_nombre, lote_nombre);
      this.loading = false;
    });
  }

  populateContratistas() {
    getContratistas(gbl_state.db).then((c) => {
      // Si es aplicacion devolver todos
      if (this.tipo === "aplicacion") {
        this.contratistas = c.filter((con) => {
          return (
            con.labores.find(
              (la) => la.labor.toLocaleLowerCase() === "aplicación aerea"
            ) ||
            con.labores.find(
              (la) => la.labor.toLocaleLowerCase() === "aplicación terrestre"
            )
          );
        });

        return;
      }

      // Si es siembra/cosecha filtrar
      this.contratistas = c.filter((con) =>
        con.labores.find((la) => la.labor.toLocaleLowerCase() === this.tipo)
      );
      console.log("Contratistas", c);
      this.requestUpdate();
    });
  }

  populateInsumos() {
    get_lista_insumos(gbl_state.db).then((i) => {
      this.insumos = i;
      //console.log("insumos", i);
      this.requestUpdate();
    });
  }

  populateIngenieros() {
    listar_ingenieros().then((is) => {
      this.ingenieros = is;
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
  }

  guardar() {
    /* chequeos */
    let errors = [];

    /* fecha */

    if (!es_esta_campana(this.actividad.detalles.fecha_ejecucion_tentativa)) {
      errors.push(
        "Debe seleccionar una fecha dentro de la campaña seleccionada"
      );
    }

    if (
      this.actividad.contratista === null ||
      this.actividad.contratista.nombre === ""
    ) {
      errors.push("Debe seleccionar un contratista");
    }

    if (this.actividad.detalles.dosis.length === 0) {
      errors.push("Debe agregar algun Insumo");
    }

    /* TODO translate los strings de Semillas Siembra etc */
    /* DEBE TENER UNA SEMILLA */
    if (this.tipo === "siembra") {
      let x = this.actividad.detalles.dosis.find(
        (i) => i.insumo.tipo === "Semillas"
      );
      if (x === undefined) {
        errors.push("Debe Agregar una 'Semilla' pues esto es una Siembra");
      }

      let y = this.actividad.detalles.costo_labor.find(
        (labor) => labor.labor.labor === "Siembra"
      );
      if (y === undefined) {
        errors.push(
          "Debe Agregar una labor de 'Siembra' pues esto es una Siembra"
        );
      }

      console.log("Chequeo TiPO Siembra", x);
    }

    if (this.tipo === "cosecha") {
      let y = this.actividad.detalles.costo_labor.find(
        (labor) => labor.labor.labor === "Cosecha"
      );
      if (y === undefined) {
        errors.push(
          "Debe Agregar una labor de 'Cosecha' pues esto es una Cosecha"
        );
      }
    }

    if (errors.length > 0) {
      showNotification(
        "Atención - Errores!!!\n\n" + errors.join("\n"),
        "error"
      );
      alert("Atención - Errores!!!\n\n" + errors.join("\n"));
      return;
    }

    let fecha = format(
      parse(
        this.actividad.detalles.fecha_ejecucion_tentativa,
        "yyyy-MM-dd",
        new Date()
      ),
      "yyyyMMdd"
    );

    // si edit y fecha es diferente - borrar rev
    let nuevoid = "actividad:" + fecha + ":" + this.actividad.uuid;

    if (this.editando && nuevoid !== this.actividad._id) {
      //Borrar el anterior doc
      gbl_state.db.remove(this.actividad as PouchDB.Core.RemoveDocument);
      delete this.actividad._rev;
    }

    this.actividad._id = nuevoid;

    gbl_state.db.put(this.actividad).then(() => {
      showNotification(get("actividad_guardada"), "success");

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
      <grid-labores
        .actividad=${this.actividad}
        .labores=${this.actividad.contratista.labores}
      ></grid-labores>
    `;

    console.count("UpsertAplicacion-Render");

    return html`
      <div
        id="modal"
        class="modal"
        tabindex="-1"
        @cerrar-modal=${() => this.modal.hide()}
        @abrir-modal=${() => this.modal.show()}
        @nueva-linea-insumo=${(e: CustomEvent) => {
          this.agregarLineaInsumo();
        }}
      >
        <!-- Full screen modal -->
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${this.titulo}</h5>
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
                  <vaadin-tab id="contratista-tab">Personal</vaadin-tab>
                  <vaadin-tab id="insumos-tab">Insumos</vaadin-tab>
                  ${this.tipo === "siembra"
                    ? html`<vaadin-tab id="otros-datos-tab"
                        >Otros Datos</vaadin-tab
                      >`
                    : null}
                  <vaadin-tab id="labores-tab">Labores</vaadin-tab>
                  <vaadin-tab id="condiciones-tab">Condiciones</vaadin-tab>
                  <vaadin-tab id="observaciones-tab">Observaciones</vaadin-tab>
                </vaadin-tabs>

                <!-- Contratista -->
                <div tab="contratista-tab">
                  <vaadin-form-layout>
                    ${this.tipo !== "aplicacion"
                      ? null
                      : html`
                          <vaadin-combo-box
                            label="${translate("ingeniero")}"
                            item-label-path="nombre"
                            item-value-path="uuid"
                            required
                            error-message=${translate("campo_requerido")}
                            colspan="2"
                            .selectedItem=${this.actividad.ingeniero}
                            .items="${this.ingenieros}"
                            @selected-item-changed=${(e) => {
                              this.actividad.ingeniero = e.detail.value;
                            }}
                          >
                            <div slot="helper">
                              ${this.ingenieros?.length === 0
                                ? html`${translate("no_hay_ingenieros")}
                                    <a
                                      href=${"/personal/add?from=" +
                                      this.location.pathname}
                                      >Agrega uno</a
                                    >`
                                : ""}
                            </div>
                          </vaadin-combo-box>
                        `}

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
                      error-message="Debe seleccionar una fecha dentro de la campaña seleccionada"
                      .min="${gbl_state.campana_seleccionada.inicio}"
                      .max="${gbl_state.campana_seleccionada.fin}"
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
                  ATENCIóN!!!!! EN CONSTRUCCION!!!! EN CONSTRUCCION!!!! TIENE
                  BUGS!!! NO ESTA TERMINADO!!!!!!

                  <grid-insumos
                    .actividad=${this.actividad}
                    .insumos=${this.insumos}
                    .categorias_iniciales=${this.tipo_2_categorias_iniciales[
                      this.tipo
                    ]}
                    .tipo=${this.tipo}
                    .motivos_sugeridos_iniciales=${this
                      .motivos_sugeridos_iniciales}
                  ></grid-insumos>
                </div>
                <!-- Fin Insumos -->

                ${this.tipo === "siembra"
                  ? html`
                      <div tab="otros-datos-tab">
                        ${otros_datos_siembra_template(this.actividad)}
                      </div>
                    `
                  : null}

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
                    <vaadin-number-field
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
                    </vaadin-number-field>
                    <vaadin-number-field
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
                    </vaadin-number-field>

                    <vaadin-number-field
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
                    </vaadin-number-field>
                    <vaadin-number-field
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
                    </vaadin-number-field>

                    <vaadin-number-field
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
                    </vaadin-number-field>
                    <vaadin-number-field
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
                    </vaadin-number-field>
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
                        this.selected_step >=
                        (
                          document.querySelector(
                            "#actividad-tabsheet"
                          ) as TabSheet
                        )?.items.length
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
