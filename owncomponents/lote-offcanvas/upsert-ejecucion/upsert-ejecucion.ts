import { format_iso_c, format_min } from "./../../helpers";
import {
  sensores_central_mas_cercana_al_lote,
  sensores_detalles,
} from "./../../sensores/sensores-funciones";
import {
  listar_depositos,
  listar_solo_depositos_contratistas,
} from "../../depositos/depositos-funciones";
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
import "@vaadin/date-time-picker";
import "@vaadin/number-field";
import "@vaadin/multi-select-combo-box";
import "@vaadin/text-area";
import "@vaadin/radio-group";

import "../../sensores/selector-dispositivos/selector-dispositivos";

import { get, translate, translateUnsafeHTML } from "lit-translate";
import { columnBodyRenderer } from "@vaadin/grid/lit.js";
import {
  Actividad,
  Deposito,
  DetallesAplicacion,
  DetallesEjecucion,
  Ejecucion,
  get_empty_aplicacion,
  get_empty_ejecucion,
  LineaDosis,
  LineaDosisEjecucion,
  LineaLabor,
} from "../../depositos/depositos-types";
import { format, formatISO, parse, parseISO } from "date-fns";
import {
  Contratista,
  getContratistas,
} from "../../contratistas/contratista-types";
import {
  get_lista_insumos,
  getInsumos,
  Insumo,
} from "../../insumos/insumos-types";
import { deepcopy, get_lote_by_names, es_esta_campana } from "../../helpers";
import { ComboBox } from "@vaadin/combo-box";
import { TextField } from "@vaadin/text-field";
import {
  MultiSelectComboBox,
  MultiSelectComboBoxSelectedItemsChangedEvent,
} from "@vaadin/multi-select-combo-box";
import { TabSheet, TabSheetSelectedChangedEvent } from "@vaadin/tabsheet";
import "./grid_insumos_exe";
import { labores } from "../../jsons/labores";
import "./grid_labores_exe";
import { otros_datos_siembra_exe_template } from "./otros_datos_siembra_exe_template";
import { Ingeniero } from "../../tipos/ingenieros";
import { sensores_valores_promedios } from "../../sensores/sensores-funciones";
import { DeviceDetalles } from "../../sensores/sensores-types";
import { DateTimePickerI18n } from "@vaadin/date-time-picker";
import { Vehiculo } from "../../tipos/vehiculos";
import { listar_vehiculos } from "../../vehiculos/vehiculos-funciones";

import { Task } from "@lit-labs/task";
import { listar_insumos } from "../../insumos/insumos-functiones";
import "../../modal-generico/modal-generico";

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
  private origen_insumos: string = "contratista";
  private depositos: Deposito[];
  private vehiculos: Vehiculo[];

  @state()
  private ready: boolean = false;

  private _loadTask = new Task(
    this,
    () => this.loadData(this.location),
    () => [this.location]
  );

  async loadData(location) {
    // Popular los datos auxiliares
    let [vehiculos, depositos, insumos] = await Promise.all([
      listar_vehiculos(),
      listar_depositos(),
      listar_insumos(),
    ]);
    this.vehiculos = vehiculos;
    this.depositos = depositos;
    this.insumos = insumos;

    //Limpiar linea
    this.linea_de_dosis = {
      deposito_origen: null,
      dosis: 0,
      insumo: null,
      motivos: [],
      uuid: "",
      total: 0,
      precio_estimado: 0,
      precio_real: 0,
    };

    //Es una aplicacion Nueva?
    if (this.location.pathname.includes("nueva")) {
      console.log("Nueva Ejecución");
      this.editando = false;
      this.ejecucion = get_empty_ejecucion();
      let actividad_uuid = this.location.params.uuid;
      await this.inicializarDesdeActividad(actividad_uuid);
    } else {
      this.editando = true;
      await this.inicializarDesdeEjecucion(this.location.params.uuid);
    }
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    console.count("UpsertEjecucion-WillUpdate");
  }

  tipo_2_titulo = {
    siembra: translate("siembra"),
    cosecha: translate("cosecha"),
    aplicacion: translate("aplicación"),
  };

  tipo_2_categorias_iniciales = {
    siembra: ["Semillas", "Combustible"],
    cosecha: ["Otros", "Combustible"],
    aplicacion: ["Agroquímicos", "Fertilizantes", "Combustible"],
  };

  populateInsumos() {
    return get_lista_insumos(gbl_state.db).then((i) => {
      this.insumos = i;
      //console.log("insumos", i);
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
    this.ejecucion.tipo = this.actividad.tipo;
    this.ejecucion.detalles.fecha_ejecucion =
      this.actividad.detalles.fecha_ejecucion_tentativa;
    this.ejecucion.detalles.fecha_hora_inicio = format_min(
      parseISO(this.ejecucion.detalles.fecha_ejecucion)
    );
    this.ejecucion.detalles.fecha_hora_fin = format_min(
      parseISO(this.ejecucion.detalles.fecha_ejecucion)
    );
    this.ejecucion.detalles.hectareas = this.actividad.detalles.hectareas;
    this.ejecucion.lote_uuid = this.actividad.lote_uuid;
    this.ejecucion.uuid = this.actividad.uuid;

    this.ejecucion.contratista = deepcopy(this.actividad.contratista);
    this.ejecucion.ingeniero = deepcopy(this.actividad.ingeniero);

    this.actividad.detalles.dosis.forEach((dosis) => {
      let enl: LineaDosisEjecucion = deepcopy(dosis);
      enl.precio_real = enl.precio_estimado;
      this.ejecucion.detalles.dosis.push(enl);
    });

    this.actividad.detalles.costo_labor.forEach((labor) => {
      let enl: LineaLabor = deepcopy(labor);
      this.ejecucion.detalles.costo_labor.push(enl);
    });

    if (this.ejecucion.tipo === "siembra") {
      this.ejecucion.detalles.distancia = this.actividad.detalles.distancia;
      this.ejecucion.detalles.densidad_objetivo =
        this.actividad.detalles.densidad_objetivo;
      this.ejecucion.detalles.peso_1000 = this.actividad.detalles.peso_1000;
      this.ejecucion.detalles.tipo_siembra =
        this.actividad.detalles.tipo_siembra;
    }

    if (this.ejecucion.tipo === "cosecha") {
      this.ejecucion.detalles.humedad =
        this.actividad.detalles.humedad_esperado;
      this.ejecucion.detalles.rinde = this.actividad.detalles.rinde_esperado;
    }
  }

  inicializarDesdeActividad(uuid) {
    return gbl_state.db
      .allDocs({ startkey: "actividad:", endkey: "actividad:\ufff0" })
      .then((result) => {
        if (result.rows) {
          let midoc = result.rows.find((doc) => doc.id.includes(uuid));
          if (midoc) {
            return gbl_state.db.get(midoc.id).then((doc) => {
              this.actividad = doc as Actividad;
              this.copiarInsumosDesdeActividad();
              this.tipo = this.actividad.tipo;
              this.ready = true;
              //this.requestUpdate();
            });
          }
        }
      });
  }

  getActividadSinCopiar(uuid) {
    return gbl_state.db
      .allDocs({ startkey: "actividad:", endkey: "actividad:\ufff0" })
      .then((result) => {
        if (result.rows) {
          let midoc = result.rows.find((doc) => doc.id.includes(uuid));
          if (midoc) {
            return gbl_state.db.get(midoc.id).then((doc) => {
              this.actividad = doc as Actividad;
              return doc as Actividad;
            });
          }
        }
      });
  }

  inicializarDesdeEjecucion(uuid) {
    return gbl_state.db
      .allDocs({ startkey: "ejecucion:", endkey: "ejecucion:\ufff0" })
      .then((result) => {
        if (result.rows) {
          let midoc = result.rows.find((doc) => doc.id.includes(uuid));
          if (midoc) {
            return gbl_state.db.get(midoc.id).then(async (doc) => {
              this.ejecucion = doc as Ejecucion;
              this.tipo = this.ejecucion.tipo;
              await this.getActividadSinCopiar(uuid);
              console.log("EJE ACT", this.ejecucion, this.actividad);
              this.ready = true;
              console.log(
                formatISO(
                  parse(
                    this.ejecucion.detalles.fecha_ejecucion,
                    "yyyy-MM-dd",
                    new Date()
                  )
                )
              );
              //this.requestUpdate();
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

  guardar() {
    /* chequeos */
    let errors = [];

    /* fecha */

    if (!es_esta_campana(this.ejecucion.detalles.fecha_ejecucion)) {
      errors.push(
        "Debe seleccionar una fecha dentro de la campaña seleccionada"
      );
    }

    if (
      this.ejecucion.contratista === null ||
      this.ejecucion.contratista.nombre === ""
    ) {
      errors.push("Debe seleccionar un contratista");
    }

    if (this.ejecucion.detalles.dosis.length === 0) {
      errors.push("Debe agregar algun Insumo");
    }

    /* TODO translate los strings de Semillas Siembra etc */
    /* DEBE TENER UNA SEMILLA */
    if (this.tipo === "siembra") {
      let x = this.ejecucion.detalles.dosis.find(
        (i) => i.insumo.tipo === "Semillas"
      );
      if (x === undefined) {
        errors.push("Debe Agregar una 'Semilla' pues esto es una Siembra");
      }

      let y = this.ejecucion.detalles.costo_labor.find(
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
      let y = this.ejecucion.detalles.costo_labor.find(
        (labor) => labor.labor.labor === "Cosecha"
      );
      if (y === undefined) {
        errors.push(
          "Debe Agregar una labor de 'Cosecha' pues esto es una Cosecha"
        );
      }
    }

    if (errors.length > 0) {
      alert("Atención - Errores!!!\n\n" + errors.join("\n"));
      return;
    }

    /*--------------- fin checks ---------------------- */

    let fecha = format(
      parse(this.ejecucion.detalles.fecha_ejecucion, "yyyy-MM-dd", new Date()),
      "yyyyMMdd"
    );

    // si edit y fecha es diferente - borrar rev
    let nuevoid = "ejecucion:" + fecha + ":" + this.ejecucion.uuid;

    if (this.editando && nuevoid !== this.ejecucion._id) {
      //Borrar el anterior doc
      gbl_state.db.remove(this.ejecucion as PouchDB.Core.RemoveDocument);
      delete this.ejecucion._rev;
    }

    this.ejecucion._id = nuevoid;

    gbl_state.db.put(this.ejecucion).then(() => {
      alert("Ejecucion Guardada");

      let lote_nombre = this.location.params.uuid_lote as string;

      let campo_nombre = this.location.params.uuid_campo as string;

      let lote_url = gbl_state.router.urlForPath(
        "/campo/:uuid_campo/lote/:uuid_lote",
        { uuid_campo: campo_nombre, uuid_lote: lote_nombre }
      );
      Router.go(lote_url);
      // this.modal.hide();
    });
  }

  loaded() {
    return this.insumos && this.actividad && this.ejecucion;
  }

  render() {
    console.log(formatISO(new Date()));

    const labores_form = () => html`
    <vaadin-vertical-layout theme="spacing">
        <grid-labores-exe
          .ejecucion=${this.ejecucion}
          .labores=${labores}
        ></grid-labores-exe>

        <div>
          <h5>${translate("vehiculos")}</h5>
          <vaadin-multi-select-combo-box
            style="width:500px"
            .items=${this.vehiculos}
            item-label-path="nombre"
            helper-text="Seleccione los vehiculos que utilizara durante la actividad"
            .selectedItems=${this.ejecucion.detalles?.vehiculos ?? []}
            @selected-items-changed=${(
              e: MultiSelectComboBoxSelectedItemsChangedEvent<Vehiculo>
            ) => {
              this.ejecucion.detalles.vehiculos = e.detail.value;
            }}
          ></vaadin-multi-select-combo-box>
        </div>
      </vaadin-vertical-layout>
    `;

    console.count("UpsertEjecucion-Render");

    const modal_body = () => html`
      <vaadin-tabsheet
        id="actividad-tabsheet"
        .selected=${this.selected_step}
        @selected-changed=${(e: TabSheetSelectedChangedEvent) => {

          let number_of_tabs = (e.target as TabSheet).items.length;
          if (number_of_tabs === undefined) return; // No cambiar selected is es undef
          console.log("SelectedChanged", e, number_of_tabs);
          this.selected_step =
            e.detail.value < number_of_tabs
              ? e.detail.value
              : number_of_tabs - 1;
        }}
      >
        <vaadin-tabs slot="tabs">
          <vaadin-tab id="dashboard-tab">Fecha</vaadin-tab>
          <vaadin-tab id="payment-tab">Insumos</vaadin-tab>
          <vaadin-tab id="labores-tab">Labores</vaadin-tab>
          ${this.tipo === "siembra" || this.tipo === "cosecha"
            ? html`<vaadin-tab id="otrosdatos-tab">Otros Datos</vaadin-tab>`
            : null}

          <vaadin-tab id="condiciones-tab">Condiciones</vaadin-tab>
          <!-- <vaadin-tab id="aporte-social-tab">Aporte Societario</vaadin-tab> -->
          <vaadin-tab id="shipping-tab">Observaciones</vaadin-tab>
        </vaadin-tabs>

        <!-- Contratista -->
        <div tab="dashboard-tab">
          <vaadin-form-layout>
            ${this.tipo !== "aplicacion"
              ? null
              : html`
                  <vaadin-combo-box
                    label="${translate("ingeniero")}"
                    item-label-path="nombre"
                    item-value-path="uuid"
                    readonly
                    error-message=${translate("campo_requerido")}
                    colspan="2"
                    .selectedItem=${this.ejecucion.ingeniero}
                  ></vaadin-combo-box>
                `}
            <vaadin-combo-box
              label="Contratista"
              item-label-path="nombre"
              item-value-path="uuid"
              helper-text="Solo puede cambiar el contratista si modifica la planificación"
              style="width: 100%;"
              .selectedItem=${this.ejecucion.contratista}
              readonly
              colspan="2"
            ></vaadin-combo-box>

            <!-- <vaadin-date-picker
              label=${translate("fecha")}
              helper-text="real de ejecución"
              value="2022-12-03"
              placeholder="YYYY-MM-DD"
              error-message="Debe seleccionar una fecha igual o posterior a la planificación"
              .min="${this.actividad.detalles.fecha_ejecucion_tentativa}"
              .max="${format(new Date(), "yyyy-MM-dd")}"
              .i18n=${base_i18n}
              theme="helper-above-field"
              .value=${this.ejecucion.detalles.fecha_ejecucion}
              @change=${(e) => {
              this.ejecucion.detalles.fecha_ejecucion = e.target.value;
              this.requestUpdate();
            }}
            ></vaadin-date-picker> -->

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

            <vaadin-horizontal-layout
              theme="spacing"
              style="flex-wrap: wrap; align-items: center;"
              colspan="2"
            >
              <vaadin-date-time-picker
                label="${translate("hora_comienzo")}"
                value="${this.ejecucion.detalles.fecha_hora_inicio}"
                .i18n=${base_i18n as DateTimePickerI18n}
                .min="${format_min(
                  parseISO(this.actividad.detalles.fecha_ejecucion_tentativa)
                )}"
                .max=${format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                @change=${(e) => {
                  this.ejecucion.detalles.fecha_hora_inicio = e.target.value;
                  this.ejecucion.detalles.fecha_ejecucion = format(
                    parseISO(e.target.value),
                    "yyyy-MM-dd"
                  );
                  this.requestUpdate();
                }}
              ></vaadin-date-time-picker>

              <vaadin-date-time-picker
                label="${translate("hora_finalizacion")}"
                value=${this.ejecucion.detalles.fecha_hora_fin}
                .i18n=${base_i18n as DateTimePickerI18n}
                .min=${this.ejecucion.detalles.fecha_hora_inicio}
                .max=${format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                @change=${async (e) => {
                  this.ejecucion.detalles.fecha_hora_fin = e.target.value;
                  let mas_cercana = await sensores_central_mas_cercana_al_lote(
                    this.ejecucion.lote_uuid,
                    this.ejecucion.detalles.fecha_hora_inicio,
                    this.ejecucion.detalles.fecha_hora_fin
                  );
                  let detalles = await sensores_detalles(
                    mas_cercana.device_uuid
                  );
                  await this.llenar_promedios(detalles, mas_cercana.distancia);
                  this.requestUpdate();
                  /* Si estan definidos fecha y hora buscar la central mas cercana */
                  // let inicio = this.ejecucion.detalles.fecha_hora_inicio;
                  // let fin = this.ejecucion.detalles.fecha_hora_fin;
                  // if (inicio && fin && inicio !== "" && fin !== "") {
                  //   sensores_central_mas_cercana_al_lote(
                  //     this.ejecucion.lote_uuid,
                  //     this.ejecucion.detalles.fecha_hora_inicio,
                  //     this.ejecucion.detalles.fecha_hora_fin
                  //   );
                  // }
                }}
              ></vaadin-date-time-picker>
            </vaadin-horizontal-layout>
          </vaadin-form-layout>
        </div>
        <!-- Fin Contratista -->

        <!-- Insumos -->
        <div tab="payment-tab">
          <vaadin-horizontal-layout
            theme="spacing"
            style="align-self: stretch;"
          >
            Puede ingresar tanto la dosis por hectarea como el total por lote y
            los valores se ajustaran automaticamente
          </vaadin-horizontal-layout>

          ATENCIóN!!!!! EN CONSTRUCCION!!!! EN CONSTRUCCION!!!! TIENE BUGS!!! NO
          ESTA TERMINADO!!!!!!

          <grid-insumos-exe
            .actividad=${this.actividad}
            .ejecucion=${this.ejecucion}
            .insumos=${this.insumos}
            .depositos=${this.depositos}
            .categorias_iniciales=${this.tipo_2_categorias_iniciales[this.tipo]}
            .tipo=${this.tipo}
          ></grid-insumos-exe>
        </div>
        <!-- Fin Insumos -->

        <!-- Otros Datos -->
        ${this.tipo === "siembra"
          ? html`<div tab="otrosdatos-tab">
              ${otros_datos_siembra_exe_template(this.ejecucion)}
            </div>`
          : null}
        <!-- Otros -->

        <!--Labores-->
        <div tab="labores-tab">${labores_form()}</div>
        <!-- Fin Labores -->

        <!-- observaciones -->
        <div tab="shipping-tab">
          <vaadin-horizontal-layout theme="spacing" style="width: 100%;">
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
        <div tab="aporte-social-tab">
          <vaadin-horizontal-layout theme="spacing" style="width: 100%;">
            Proximamente... En Construcción
          </vaadin-horizontal-layout>
        </div>
        <!-- aporte social-->

        <div tab="condiciones-tab">
          <vaadin-vertical-layout
            style="width: 100%; height: 100%; align-items: center; margin: var(--lumo-space-s);"
          >
            <vaadin-vertical-layout
              theme="spacing"
              style="flex-wrap: wrap; align-items: center;"
            >
              <div>
                Ingrese los valores de las variables ambientales promedio al
                momento de la labor o seleccione central.
              </div>

              <selector-dispositivos
                .enabled=${this.habilitar_seleccion_centrales()}
                .location=${this.location}
                @selected-changed=${(e) => {
                  // Reseleccionar el tab
                  console.log("STEP", this.selected_step);
                  let device = e.detail.device;
                  let distancia = e.detail.distancia;
                  console.log("Picked Device", device, distancia);
                  this.llenar_promedios(device, distancia).then(() => {
                    this.requestUpdate();
                  });
                }}
              ></selector-dispositivos>

              <div>
                ${this.ejecucion.condiciones?.temperatura?.device?.nombre ?? ""}
              </div>
            </vaadin-vertical-layout>

            <vaadin-horizontal-layout
              theme="spacing"
              style="flex-wrap: wrap; justify-content: center;"
            >
              <vaadin-text-field
                label="Temperatura Min"
                helper-text="planificada"
                value=${this.actividad.condiciones.temperatura_min}
                @input=${(e) => {
                  this.actividad.condiciones.temperatura_min = +e.target.value;
                }}
                theme="align-right helper-above-field"
                type="text"
                readonly
              >
                <div slot="suffix">ºC</div>
              </vaadin-text-field>

              <vaadin-text-field
                label="Temperatura"
                helper-text="promedio"
                value=${this.ejecucion.condiciones.temperatura?.value}
                @input=${(e) => {
                  this.ejecucion.condiciones.temperatura.value =
                    +e.target.value;
                }}
                theme="align-right helper-above-field"
                type="text"
              >
                <div slot="suffix">ºC</div>
              </vaadin-text-field>

              <vaadin-text-field
                label="Temperatura Max"
                helper-text="planificada"
                value=${this.actividad.condiciones.temperatura_max}
                @input=${(e) => {
                  this.actividad.condiciones.temperatura_max = +e.target.value;
                }}
                theme="align-right helper-above-field"
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
                helper-text="planificada"
                value=${this.actividad.condiciones.humedad_min}
                theme="align-right helper-above-field"
                @input=${(e) => {
                  this.actividad.condiciones.humedad_min = +e.target.value;
                }}
                type="text"
                readonly
              >
                <div slot="suffix">%</div>
              </vaadin-text-field>

              <vaadin-text-field
                label="Humedad"
                helper-text="promedio"
                value=${this.ejecucion.condiciones.humedad.value}
                theme="align-right helper-above-field"
                @input=${(e) => {
                  this.ejecucion.condiciones.humedad.value = +e.target.value;
                }}
                type="text"
              >
                <div slot="suffix">%</div>
              </vaadin-text-field>

              <vaadin-text-field
                label="Humedad Max"
                helper-text="planificada"
                value=${this.actividad.condiciones.humedad_max}
                @input=${(e) => {
                  this.actividad.condiciones.humedad_max = +e.target.value;
                }}
                theme="align-right helper-above-field"
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
                helper-text="planificada"
                value=${this.actividad.condiciones.velocidad_min}
                theme="align-right helper-above-field"
                @input=${(e) => {
                  this.actividad.condiciones.velocidad_min = +e.target.value;
                }}
                type="text"
                readonly
              >
                <div slot="suffix">km/h</div>
              </vaadin-text-field>

              <vaadin-text-field
                label="Viento"
                helper-text="promedio"
                value=${this.ejecucion.condiciones.velocidad.value}
                theme="align-right helper-above-field"
                @input=${(e) => {
                  this.ejecucion.condiciones.velocidad.value = +e.target.value;
                }}
                type="text"
              >
                <div slot="suffix">km/h</div>
              </vaadin-text-field>

              <vaadin-text-field
                label="Viento Max"
                helper-text="planificada"
                value=${this.actividad.condiciones.velocidad_max}
                @input=${(e) => {
                  this.actividad.condiciones.velocidad_max = +e.target.value;
                }}
                theme="align-right helper-above-field"
                type="text"
                readonly
              >
                <div slot="suffix">km/h</div>
              </vaadin-text-field>
            </vaadin-horizontal-layout>

            <vaadin-horizontal-layout
              theme="spacing"
              style="flex-wrap: wrap; justify-content: center;"
            >
              <vaadin-text-field
                label="Humedad Suelo Min"
                helper-text="planificada"
                value=${this.actividad.condiciones.velocidad_min}
                theme="align-right helper-above-field"
                @input=${(e) => {
                  this.actividad.condiciones.velocidad_min = +e.target.value;
                }}
                type="text"
                readonly
              >
                <div slot="suffix">km/h</div>
              </vaadin-text-field>

              <vaadin-text-field
                label="Humedad Suelo"
                helper-text="promedio"
                value=${this.ejecucion.condiciones.humedad_suelo.value}
                theme="align-right helper-above-field"
                @input=${(e) => {
                  this.ejecucion.condiciones.humedad_suelo.value =
                    +e.target.value;
                }}
                type="text"
              >
                <div slot="suffix">km/h</div>
              </vaadin-text-field>

              <vaadin-text-field
                label="Humedad Suelo Max"
                helper-text="planificada"
                value=${this.actividad.condiciones.velocidad_max}
                @input=${(e) => {
                  this.actividad.condiciones.velocidad_max = +e.target.value;
                }}
                theme="align-right helper-above-field"
                type="text"
                readonly
              >
                <div slot="suffix">km/h</div>
              </vaadin-text-field>
            </vaadin-horizontal-layout>
          </vaadin-vertical-layout>
        </div>
      </vaadin-tabsheet>
    `;

    return this._loadTask.render({
      pending: () => html`${translate("cargando")}`,
      complete: () => html`
        <modal-generico .modalOpened=${true}>
          <div slot="title">
            Ejecución ${this.tipo_2_titulo[this.tipo]} -
            ${this.editando ? "Edición" : ""}
          </div>

          <div slot="body" class="modal-body">
            ${this.ready ? modal_body() : ""}
            <slot></slot>
          </div>

          <vaadin-horizontal-layout
            slot="footer"
            theme="spacing"
            style="justify-content:right"
          >
            <vaadin-button
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
            </vaadin-button>

            <vaadin-button
              @click=${() => {
                console.log("STEP_PB", this.selected_step);

                this.selected_step =
                  this.selected_step === undefined ? 3 : this.selected_step;

                this.selected_step = this.selected_step + 1;
              }}
            >
              Siguiente
            </vaadin-button>

            <vaadin-button theme="primary success" @click=${this.guardar}>
              Guardar
            </vaadin-button>
          </vaadin-horizontal-layout>
        </modal-generico>
      `,
    });
  }

  same_time_check() {
    let inicio = this.ejecucion.detalles.fecha_hora_inicio;
    let fin = this.ejecucion.detalles.fecha_hora_fin;
    return fin === inicio;
  }
  habilitar_seleccion_centrales() {
    let inicio = this.ejecucion.detalles.fecha_hora_inicio;
    let fin = this.ejecucion.detalles.fecha_hora_fin;
    return inicio && fin && inicio !== "" && fin !== "" && fin !== inicio;
  }

  es_depo_del_contratista() {
    return (
      this.ejecucion.deposito_origen?.uuid === this.ejecucion.contratista.uuid
    );
  }

  async llenar_promedios(device: DeviceDetalles, distancia_km: number) {
    return sensores_valores_promedios(
      device,
      this.ejecucion.detalles.fecha_hora_inicio,
      this.ejecucion.detalles.fecha_hora_fin
    ).then((promedios) => {
      console.log("promedios a llenar", promedios);

      this.ejecucion.condiciones.temperatura.device = device;
      this.ejecucion.condiciones.humedad.device = device;
      this.ejecucion.condiciones.velocidad.device = device;
      this.ejecucion.condiciones.humedad_suelo.device = device;

      this.ejecucion.condiciones.temperatura.distancia = distancia_km;
      this.ejecucion.condiciones.humedad.distancia = distancia_km;
      this.ejecucion.condiciones.velocidad.distancia = distancia_km;
      this.ejecucion.condiciones.humedad_suelo.distancia = distancia_km;

      this.ejecucion.condiciones.temperatura.value = promedios.temperatura?.avg;
      this.ejecucion.condiciones.humedad.value = promedios.humedad?.avg;
      this.ejecucion.condiciones.velocidad.value = promedios.velocidad?.avg;
      this.ejecucion.condiciones.humedad_suelo.value =
        promedios.humedad_suelo?.avg;
    });
  }
}
