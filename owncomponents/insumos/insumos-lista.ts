import { LitElement, html, unsafeCSS, render, CSSResultGroup } from "lit";
import { property, state } from "lit/decorators.js";
import "@vaadin/form-layout";
import "@vaadin/email-field";
import "@vaadin/text-field";
import "@vaadin/combo-box";
import "@vaadin/button";
import "@vaadin/horizontal-layout";
import "@vaadin/vertical-layout";
import "@vaadin/custom-field";
import "@vaadin/grid";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import Modal from "bootstrap/js/dist/modal";
import PouchDB from "pouchdb";
import { Insumo, get_empty_insumo, get_lista_insumos } from "./insumos-types";
import { InsumoCrud } from "./insumos-crud";
import { GridItemModel } from "@vaadin/grid";
import "@vaadin/grid/vaadin-grid-sort-column.js";
import "./insumos-crud";
import "@vaadin/icons";
import "@vaadin/upload";
import "@vaadin/dialog";
// import { read, writeFile, utils } from "xlsx";
let read, writeFile, utils;
import("xlsx").then((mod) => {
  read = mod.read;
  writeFile = mod.writeFile;
  utils = mod.utils;
});
import { i18n_upload } from "../i18n/vaadin";
import { Upload } from "@vaadin/upload";
import "@vaadin/menu-bar";
import { deepcopy } from "../helpers";
import { translate } from "lit-translate";
import { TextFieldValueChangedEvent } from "@vaadin/text-field";

import { Task, TaskStatus } from "@lit-labs/task";
import "../modal-generico/modal-generico";
import { RouterLocation } from "@vaadin/router";
import { gbl_state } from "../state";
import { listar_analisis_suelo } from "../analisis-suelo/analisis-suelo-funciones";

export class InsumosLista extends LitElement {
  private insumos: Insumo[];

  @state({
    hasChanged(newVal: Modal, oldVal: Modal) {
      return false;
    },
  })
  _modal_excel: Modal;

  @state()
  _uploaded_insumos: any;

  @state({
    hasChanged(newVal: Upload, oldVal: Upload) {
      return false;
    },
  })
  _excel_file_input: Upload;

  @state()
  private filteredItems: Insumo[] = [];

  @property()
  location: RouterLocation;

  private _loadTask = new Task(
    this,
    () => this.load_data(),
    () => [this.location]
  );

  static override styles: CSSResultGroup = [unsafeCSS(bootstrap)];

  override firstUpdated() {
    // this._modal = new Modal(this.shadowRoot.getElementById("modal"));
    this._modal_excel = new Modal(
      this.shadowRoot.getElementById("modal-importar-excel")
    );

    this._excel_file_input = this.shadowRoot.getElementById(
      "upload-drop-enabled"
    ) as Upload;

    /**Recepcion del mensaje enviado por el sw al recibir el POST del archivo */
    navigator.serviceWorker.addEventListener("message", async (event) => {
      if (event.data.action !== "load-excel-insumos") {
        return;
      }
      console.log("OnMessageExcel", event);

      const data = await event.data.file.arrayBuffer();
      /* data is an ArrayBuffer */
      const workbook = read(data);
      console.log(workbook);
      workbook.SheetNames.forEach((sheet) => {
        let rowObject = utils.sheet_to_json(workbook.Sheets[sheet]);
        this._uploaded_insumos = rowObject;
        console.log(rowObject);
      });
    });

    // Eventos
    this.addEventListener("edicion_insumo_guardado", (e) => {
      // this._modal.show();
      this.load_data();
      console.log("EVREC");
    });

    this.addEventListener("edicion_insumo_cerrado", (e) => {
      // this._modal.show();
      this.load_data();
      console.log("EVREC");
    });
  }

  load_data = () => {
    return get_lista_insumos(gbl_state.db)
      .then((lista_insumos) => {
        // console.log("Lista de Insumos", lista_insumos);
        this.insumos = deepcopy(lista_insumos);
        this.filteredItems = deepcopy(lista_insumos);
        return lista_insumos;
      })
      .catch((e) => {
        console.log("Error al get_lista_insumos", e);
        return [] as Insumo[];
      });
  };

  edit(c: Insumo) {
    // this._modal.hide();
    let ic = this.shadowRoot.getElementById("insumo-crud") as InsumoCrud;
    ic.edit(c);
  }

  borrar(c: Insumo) {
    gbl_state.db
      .remove(c as any)
      .then((e: any) => {
        this.load_data(); // Reload
      })
      .catch((e) => {});
  }

  private actionsRenderer = (
    root: HTMLElement,
    _: HTMLElement,
    model: GridItemModel<Insumo>
  ) => {
    const insumo = model.item;
    render(
      html`
        <span theme="badge" @click=${() => this.edit(insumo)}
          ><vaadin-icon icon="vaadin:edit"></vaadin-icon
        ></span>

        <span theme="badge" @click=${() => this.borrar(insumo)}
          ><vaadin-icon icon="vaadin:trash"></vaadin-icon
        ></span>
      `,
      root
    );
  };

  private seAplicaARenderer = (
    root: HTMLElement,
    _: HTMLElement,
    model: GridItemModel<Insumo>
  ) => {
    const insumo = model.item;
    const se_aplica_a = insumo.se_aplica_a;

    render(
      html`
        <vaadin-vertical-layout>
          ${se_aplica_a.map((c) => {
            let theme = "";
            if (c.cultivo === "Soja") {
              theme = "primary success small";
            } else if (c.cultivo === "Maiz") {
              theme = "primary error small";
            } else {
              theme = "primary contrast small";
            }
            return html`<vaadin-button theme="theme"
              >${c.cultivo}</vaadin-button
            >`;
          })}
        </vaadin-vertical-layout>
      `,
      root
    );
  };

  importar() {
    this._uploaded_insumos = undefined;
    // this._modal.hide();
    this._modal_excel.show();
    this._excel_file_input.files = [];
  }

  save_imports() {
    /**
     * Convierte la "fila de excel" a Contratista
     * @param up
     * @returns
     */
    const up_to_contratista = (up) => {
      let insumo: Insumo = { ...get_empty_insumo() };

      insumo.marca_comercial = up.marca_comercial || "";
      insumo.principio_activo = up.principio_activo || "";
      insumo.tipo = up.tipo || "";
      insumo.subtipo = up.subtipo || "";
      insumo.unidad = up.unidad || "";
      insumo.precio = up.precio || "";

      return insumo;
    };

    // //console.log("CONT uc", this._uploaded_insumos)
    let todos_los_insumos = this._uploaded_insumos.map(up_to_contratista);

    // //console.log("CONT sin uuid", todos_los_contratistas, this._uploaded_insumos)
    // let todos_los_insumos_con_uuid : (Insumo) [] = todos_los_insumos.map((c : Insumo) => {
    //let nuevo_uuid = uuid4()
    // c.uuid = nuevo_uuid
    // return c;
    // })

    console.log("TOLOIS", todos_los_insumos);
    this.db.bulkDocs(todos_los_insumos);
  }

  menu_click({ detail }) {
    //console.log("CLICK,", detail)
    let valor = detail.value.value;
    if (valor === "importar_excel") {
      this.importar();
    } else if (valor === "exportar_excel") {
      const insumo_a_row = (c: Insumo) => {
        let row = {
          marca_comercial: c.marca_comercial,
          principio_activo: c.principio_activo,
          tipo: c.tipo,
          subtipo: c.subtipo,
          unidad: c.unidad,
          precio: c.precio,
        };
        return row;
      };

      let data = this.insumos.map(insumo_a_row);

      const worksheet = utils.json_to_sheet(data);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Insumos");
      writeFile(workbook, "Insumos.xlsx");
      console.log(this.insumos);
    } else if (valor === "nuevo") {
      (this.shadowRoot.getElementById("insumo-crud") as InsumoCrud).insumo =
        get_empty_insumo();
      (this.shadowRoot.getElementById("insumo-crud") as InsumoCrud).show();
      this._modal.hide();
    }
  }

  render() {



    const main_body = (insumo: Insumo[]) => {
      return html` <modal-generico .modalOpened=${true}>
          <div slot="title">Insumos</div>

          <vaadin-menu-bar
            slot="menu"
            theme="small"
            .items="${[
              {
                text: "Más Acciones",
                children: [
                  { text: "Nuevo", value: "nuevo" },
                  { text: "Importar Excel", value: "importar_excel" },
                  { text: "Exportar Excel", value: "exportar_excel" },
                ],
              },
            ]}"
            @item-selected=${this.menu_click}
          ></vaadin-menu-bar>

          <vaadin-vertical-layout slot="body" theme="spacing">
            <vaadin-text-field
              placeholder=${translate("buscar")}
              style="width: 50%;"
              @value-changed="${(e: TextFieldValueChangedEvent) => {
                const searchTerm = ((e.detail.value as string) || "").trim();
                const matchesTerm = (value: string) => {
                  return (
                    value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0
                  );
                };

                this.filteredItems =
                  insumo.filter((insumo) => {
                    return (
                      !searchTerm ||
                      matchesTerm(insumo.marca_comercial) ||
                      matchesTerm(insumo.principio_activo)
                    );
                  }) || [];
              }}"
            >
              <vaadin-icon slot="prefix" icon="vaadin:search"></vaadin-icon>
            </vaadin-text-field>

            <!--GRID INSUMOS-->
            <vaadin-grid .items=${this.filteredItems}>
              <vaadin-grid-sort-column
                direction="asc"
                header="Marca Comercial"
                path="marca_comercial"
                auto-width
                resizable
              ></vaadin-grid-sort-column>
              <vaadin-grid-sort-column
                header="Principio Activo"
                path="principio_activo"
                resizable
              ></vaadin-grid-sort-column>
              <vaadin-grid-sort-column
                header="Tipo"
                path="tipo"
                resizable
              ></vaadin-grid-sort-column>
              <vaadin-grid-sort-column
                header="Subtipo"
                path="subtipo"
                resizable
              ></vaadin-grid-sort-column>
              <vaadin-grid-sort-column
                header="Unidad"
                path="unidad"
                resizable
              ></vaadin-grid-sort-column>
              <vaadin-grid-column
                header="Se aplica a"
                .renderer=${this.seAplicaARenderer}
                resizable
              ></vaadin-grid-column>
              <vaadin-grid-sort-column
                header="Precio"
                path="precio"
                resizable
              ></vaadin-grid-sort-column>
              <vaadin-grid-column
                header="Acción"
                .renderer=${this.actionsRenderer}
                resizable
              ></vaadin-grid-column>
            </vaadin-grid>
          </vaadin-vertical-layout>

          <div slot="footer">
            <vaadin-button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cerrar
            </vaadin-button>
          </div>
        </modal-generico>

        <insumo-crud id="insumo-crud" .db=${gbl_state.db}></insumo-crud>`;
    };

    return html`
      <!-- Modal Importar-->
      <div
        class="modal fade backdrop"
        id="modal-importar-excel"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        role="dialog"
      >
        <div
          class="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Importar desde Excel</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div class="modal-body">
              <label for="upload-drop-enabled">Formatos aceptados: xlsx, xlsm, ods, csv.</label>
              <p>Puede descargar el ejemplo/template para formatear correctamente sus datos.</p>
              <vaadin-upload
                id="upload-drop-enabled"
                .nodrop="${false}"
                accept=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx,.ods,.csv
                max-files="1"
                target="/excel-insumos-upload"
                .i18n=${i18n_upload}
                @files-changed=${(e) => {
                  if (e.target.files.length === 0) {
                    this._uploaded_insumos = undefined;
                  }
                }}
              ></vaadin-upload>


              ${
                this._uploaded_insumos
                  ? html`<h4>Preview</h4>
                      <vaadin-grid
                        .items="${this._uploaded_insumos}"
                        theme="compact"
                        style="height: 200px;"
                      >
                        <vaadin-grid-column
                          path="marca_comercial"
                          header="Nombre"
                        ></vaadin-grid-column>
                        <vaadin-grid-column
                          path="principio_activo"
                          header="P.Activo"
                        ></vaadin-grid-column>
                      </vaadin-grid>`
                  : null
              }
            </div>



            <div class="modal-footer">
              <a
                class="btn btn-primary d-block d-md-none"
                href="insumos_template.xlsx"
                download="agrotools_insumos_template.xlsx"
                >Ejemplo/Template</a
              >
              <a
                class="btn btn-primary d-none d-md-block"
                href="insumos_template.xlsx"
                download="agrotools_insumos_template.xlsx"
                >Descargar Ejemplo/Template</a
              >
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.save_imports}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>

      ${this._loadTask.render({
        pending: () => html`${translate("cargando")}`,
        complete: main_body,
      })}
    `;

  }
}

customElements.define("insumos-lista", InsumosLista);

declare global {
  interface HTMLElementTagNameMap {
    "insumos-lista": InsumosLista;
  }
}
