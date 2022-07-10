import { LitElement, html, unsafeCSS, render } from "lit";
import { property, state } from "lit/decorators.js";
import "@vaadin/form-layout";
import "@vaadin/email-field";
import "@vaadin/text-field";
import "@vaadin/combo-box";
import "@vaadin/button";
import "@vaadin/horizontal-layout";
import "@vaadin/custom-field";
import "@vaadin/grid";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import Modal from "bootstrap/js/dist/modal";
import lista_de_labores from "./labores.json";
import { uuid4 } from "uuid4";
import PouchDB from "pouchdb";
import {Labor, Contratista} from './contratista-types'
import { isThisSecond } from "date-fns";



const empty_contratista: Contratista = {
  labores: [],
  uuid: "",
  nombre: "",
  cuit: "",
  datos_generales: { email: "", direccion: "", telefono: "" },
} ;

export class ContratistaCrud extends LitElement {
  @property()
  db: PouchDB.Database;

  @state({
    hasChanged(newVal: Modal, oldVal: Modal) {
      return false;
    },
  })
  _modal: Modal;

  @property()
  contratista: Contratista = empty_contratista;

  @state()
  _labores: Labor[] = lista_de_labores;

  @state()
  _nuevo_labor: Labor;

  @state()
  _selected_labor: Labor;

  @state()
  _editing: boolean = false;

  static override styles = unsafeCSS(bootstrap);

  override firstUpdated() {
    this._modal = new Modal(this.shadowRoot.getElementById("modal"));
  }

  labores_empty: Labor[] = [{ labor: "Sin Labores", uuid: uuid4() }];

  show() {
    this._modal.show();
  }

  nuevo() {
    this.contratista = {...empty_contratista};
    this.contratista.datos_generales = {...empty_contratista.datos_generales}
    
    this._editing = false;
    this._modal.show();
  }


  edit(c : Contratista){
    this._editing = true;
    this.contratista = {...c}; 
    this._modal.show()
  }

  /**
   * Se ejecuta cuando el usuario clickea "Agregar Labor"
   */
  agregar_labor() {
    // Immutable Way
    this.contratista = {
      ...this.contratista,
      labores: [...this.contratista.labores, this._selected_labor],
    };
  }

  /**
   * Se ejectuta cuando el usuario tipea una nueva labor
   * @param e
   */
  nueva_labor(e: CustomEvent) {
    console.log("Nueva Labor", e);
    let nueva_labor = { labor: e.detail, uuid: uuid4() };
    this._labores = [...this._labores, nueva_labor];
    this._selected_labor = nueva_labor;
    console.log("Selected Labor", this._selected_labor);
  }

  /**
   * Cambia el _selected_labor solo si lo seleccionado es algo definido.
   * Evita que @selected-item-changed sobreescriba @custom-value-set
   * @param e
   */
  selected_item_changed(e: CustomEvent) {
    this._selected_labor = e.detail.value
      ? e.detail.value
      : this._selected_labor;
  }
  /**
   * Configura las columnas del Form vaadin
   */
  responsiveSteps = [
    // Use one column by default
    { minWidth: 0, columns: 1 },
    // Use two columns, if layout's width exceeds 500px
    { minWidth: "500px", columns: 2 },
  ];

  private guardar_contratista = () => {
    if (this._editing === false) {
      let uuid = uuid4();

      this.db
        .get("contratistas")
        .then((result: any) => {
          this.contratista.uuid = uuid
          result.contratistas[uuid] = this.contratista;
          this.db
            .put(result)
            .then(() => {
              console.log("Contratistas Doc Updates");
              this._modal.hide();
            })
            .catch((e) => console.error("Error al update Contratistas", e));
        })
        .catch(() => {
          // El doc no existe. Lo creo.

          let lista_contratistas = {};
          this.contratista.uuid = uuid;
          lista_contratistas[uuid] = this.contratista;
          let con_doc = {
            _id: "contratistas",
            contratistas: lista_contratistas,
          };
          this.db
            .put(con_doc)
            .then(() => {
              console.log("Contratistas Doc Creado");
              this._modal.hide();
            })
            .catch((e) => console.error("Error al crear Contratistas", e));
        });
    } else {
      // Editando
      console.log("EDITANDO db",this.db)
      this.db.get("contratistas").then((result : any) => {
        result.contratistas[this.contratista.uuid] = this.contratista;
        this.db
          .put(result)
          .then(() => {
            console.log("Contratistas Doc Updated");
            this._modal.hide();
          })
          .catch((e) => console.error("Error al update Contratistas", e));
      });
    }
  };

  private borrarRenderer = (root: HTMLElement, _: HTMLElement, model: any) => {
    const labor_item = model.item;

    const borrar_item = () => {
      let filtered = this.contratista.labores.filter(
        (l) => l.uuid !== labor_item.uuid
      );
      this.contratista = { ...this.contratista, labores: filtered };
    };

    render(
      html`
        <span theme="badge" @click=${borrar_item}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-trash-fill text-danger"
            viewBox="0 0 16 16"
          >
            <path
              d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"
            />
          </svg>
        </span>
      `,
      root
    );
  };

  render() {
    return html`<!-- Modal -->
      <div
        class="modal fade"
        id="modal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">
                ${this._editing ? "Editando Contratista" : "Nuevo Contratista"}
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}">
                <vaadin-text-field
                  label="Nombre"
                  .value=${this.contratista.nombre}
                  @change=${(e: any) => {
                    this.contratista.nombre = e.target.value;
                    this.contratista = { ...this.contratista };
                  }}
                ></vaadin-text-field>
                <vaadin-text-field
                  label="CUIT"
                  pattern="^[0-9]{2}-[0-9]{8}-[0-9]$"
                  maxlength="13"
                  .value=${this.contratista.cuit}
                  error-message="Formato: 20-12345678-1"
                  @change=${(e: any) => {
                    this.contratista.cuit = e.target.value;
                    this.contratista = { ...this.contratista };
                  }}
                ></vaadin-text-field>
                <!-- Stretch the username field over 2 columns -->
                <vaadin-text-field
                  label="Dirección"
                  .value=${this.contratista.datos_generales.direccion}
                  @change=${(e: any) => {
                    this.contratista.datos_generales.direccion = e.target.value;
                    this.contratista = { ...this.contratista };
                  }}
                ></vaadin-text-field>

                <vaadin-text-field
                  label="Teléfono"
                  .value=${this.contratista.datos_generales.telefono}
                  @change=${(e: any) => {
                    this.contratista.datos_generales.telefono = e.target.value;
                    this.contratista = { ...this.contratista };
                  }}
                ></vaadin-text-field>

                <vaadin-email-field
                  label="Email"
                  name="email"
                  .value=${this.contratista.datos_generales.email}
                  @change=${(e: any) => {
                    this.contratista.datos_generales.email = e.target.value;
                    this.contratista = { ...this.contratista };
                  }}
                  error-message="Por favor, ingrese una dirección valida"
                  clear-button-visible
                ></vaadin-email-field>
              </vaadin-form-layout>

              <vaadin-custom-field
                label="Labores"
                helper-text="¿Que es lo que puede hacer este contratista?"
              >
                <vaadin-horizontal-layout theme="spacing">
                  <vaadin-combo-box
                    autoselect
                    id="combo-labor"
                    allow-custom-value
                    item-label-path="labor"
                    item-value-path="uuid"
                    style="flex: 1;"
                    .items="${this._labores}"
                    @selected-item-changed=${this.selected_item_changed}
                    @custom-value-set=${this.nueva_labor}
                  ></vaadin-combo-box>

                  <vaadin-button
                    @click=${this.agregar_labor}
                    theme="primary"
                    tabindex="0"
                    role="button"
                    >Agregar Labor</vaadin-button
                  >
                </vaadin-horizontal-layout>
              </vaadin-custom-field>

              <div>
                <vaadin-grid
                  .items="${this.contratista.labores.length === 0
                    ? this.labores_empty
                    : this.contratista.labores}"
                  all-rows-visible
                >
                  <vaadin-grid-column
                    header="Labores"
                    path="labor"
                    auto-width
                  ></vaadin-grid-column>
                  <vaadin-grid-column
                    header=""
                    .renderer="${this.borrarRenderer}"
                  ></vaadin-grid-column>
                </vaadin-grid>
              </div>
            </div>
            <div class="modal-footer">
              ${this._editing
                ? html`<button type="button" class="btn btn-danger">
                    Eliminar
                  </button>`
                : null}

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
                @click=${this.guardar_contratista}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }
}

customElements.define("contratista-crud", ContratistaCrud);

declare global {
  interface HTMLElementTagNameMap {
    "contratista-crud": ContratistaCrud;
  }
}
