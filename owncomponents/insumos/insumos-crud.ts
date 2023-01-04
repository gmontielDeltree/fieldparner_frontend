import { LitElement, html, unsafeCSS, render } from "lit";
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
import "@vaadin/icons";
import "@vaadin/dialog";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import Modal from "bootstrap/js/dist/modal";
import lista_de_labores from "./labores.json";
import { uuid4 } from "uuid4";
import PouchDB from "pouchdb";
import {
  Insumo,
  get_empty_insumo,
  CultivoAplicacion,
  get_empty_cultivo,
} from "./insumos-types";
import { isThisSecond } from "date-fns";
import { GridItemModel } from "@vaadin/grid";

export class InsumoCrud extends LitElement {
  @property()
  db: PouchDB.Database;

  @state({
    hasChanged(newVal: Modal, oldVal: Modal) {
      return false;
    },
  })
  _modal: Modal;

  @state({
    hasChanged(newVal: Modal, oldVal: Modal) {
      return false;
    },
  })
  _modal_cultivos: Modal;

  @property()
  insumo: Insumo = get_empty_insumo();

  @state()
  _editing: boolean = false;

  @state()
  _cultivos_opened: boolean = false;

  @state()
  _seaplicacultivo: CultivoAplicacion = get_empty_cultivo();

  static override styles = unsafeCSS(bootstrap);

  override firstUpdated() {
    this._modal = new Modal(this.shadowRoot.getElementById("modal"));
    this._modal_cultivos = new Modal(
      this.shadowRoot.getElementById("modal_cultivos")
    );
  }

  show() {
    this._modal.show();
  }

  nuevo() {
    this.insumo = get_empty_insumo();
    this._editing = false;
    this._modal.show();
  }

  edit(c: Insumo) {
    this._editing = true;
    this.insumo = { ...c };
    this._modal.show();
  }

  /**
   * Cambia el _selected_labor solo si lo seleccionado es algo definido.
   * Evita que @selected-item-changed sobreescriba @custom-value-set
   * @param e
   */
  selected_item_changed(e: CustomEvent) {}
  /**
   * Configura las columnas del Form vaadin
   */
  responsiveSteps = [
    // Use one column by default
    { minWidth: 0, columns: 1 },
    // Use two columns, if layout's width exceeds 500px
    { minWidth: "500px", columns: 2 },
  ];

  private guardar_insumo = () => {
    console.log("Guardar Insumo", this.insumo);
    this.db.put(this.insumo).then(() => {
      console.log("insumo guardado")
      if(this._editing){
        this.dispatchEvent(new CustomEvent("edicion_insumo_guardado",{bubbles:true,composed:true}));
        this._modal.hide()
      }
    }).catch((e)=>{
      alert("hubo un problema a guardar el insumo")
    })
  };

  private edit_cultivo(insumo: CultivoAplicacion) {
    this._seaplicacultivo = { ...insumo };
    this._modal_cultivos.show();
    this._modal.hide();
  }

  private borrar_cultivo(insumo: CultivoAplicacion) {
    console.log("Borrar Cultivo", insumo.uuid);
    let nueva_lista = this.insumo.se_aplica_a.filter(
      (i) => i.uuid !== insumo.uuid
    );
    this.insumo = { ...this.insumo, se_aplica_a: nueva_lista };
  }

  private actionsRenderer = (
    root: HTMLElement,
    _: HTMLElement,
    model: GridItemModel<CultivoAplicacion>
  ) => {
    const contratista = model.item;
    render(
      html`
        <span theme="badge" @click=${() => this.edit_cultivo(contratista)}
          ><vaadin-icon icon="vaadin:edit"></vaadin-icon
        ></span>

        <span theme="badge" @click=${() => this.borrar_cultivo(contratista)}
          ><vaadin-icon icon="vaadin:trash"></vaadin-icon
        ></span>
      `,
      root
    );
  };

  private agregar_cultivo = () => {
    this._cultivos_opened = true;
    this._seaplicacultivo = { ...get_empty_cultivo() };
    this._modal_cultivos.show();
    this._modal.hide();
  };

  private volver = () => {
    this._modal.show();
    this._modal_cultivos.hide();
  };

  private volver_y_guardar = () => {
    this.volver();
    let saa = [...this.insumo.se_aplica_a];
    this.insumo = { ...this.insumo };
    saa.push({ ...this._seaplicacultivo });
    this.insumo.se_aplica_a = saa;
  };

  render() {
    return html`
   
   <!-- Modal Cultivo-->
   <div class="modal fade" id="modal_cultivos" tabindex="-1" role="dialog" aria-labelledby="modelTitleId" aria-hidden="true">
     <div class="modal-dialog" role="document">
       <div class="modal-content">
         <div class="modal-header">
           <h5 class="modal-title">Se aplica a...</h5>
             <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
         </div>
         <div class="modal-body">

          <vaadin-vertical-layout style="align-items: stretch;">

            <vaadin-text-field label="Cultivo"
            .value=${
                this._seaplicacultivo.cultivo
              } 
              @change=${(e: any) => {
                this._seaplicacultivo = {
                  ...this._seaplicacultivo,
                  cultivo: e.target.value,
                };
              }}
            ></vaadin-text-field>
              <vaadin-text-field label="Estadio Desde" .value=${
                this._seaplicacultivo.estadio_desde
              } 
              @change=${(e: any) => {
                this._seaplicacultivo = {
                  ...this._seaplicacultivo,
                  estadio_desde: e.target.value,
                };
              }}
              ></vaadin-text-field>
              <vaadin-text-field label="Estadio Hasta"></vaadin-text-field>
              <vaadin-text-field label="Dosis min."></vaadin-text-field>
              <vaadin-text-field label="Dosis sugerida"></vaadin-text-field>
              <vaadin-text-field label="Dosis max."></vaadin-text-field>

            </vaadin-vertical-layout>

         </div>

         
         <div class="modal-footer">
           <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${
             this.volver
           }>Cerrar</button>
           <button type="button" class="btn btn-primary" @click=${
             this.volver_y_guardar
           }>Guardar</button>
         </div>
       </div>
     </div>
   </div>
   

    
      <!-- Modal Principal -->
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
                ${this._editing ? "Editando Insumo" : "Nuevo Insumo"}
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
                  label="Marca Comercial"
                  .value=${this.insumo.marca_comercial}
                  @change=${(e: any) => {
                    //this.insumo.marca_comercial = e.target.value;
                    this.insumo = {
                      ...this.insumo,
                      marca_comercial: e.target.value,
                    };
                  }}
                ></vaadin-text-field>
                <vaadin-text-field
                  label="Principio Activo"
                  .value=${this.insumo.principio_activo}
                  @change=${(e: any) => {
                    //this.insumo.principio_activo = e;
                    this.insumo = {
                      ...this.insumo,
                      principio_activo: e.target.value,
                    };
                  }}
                ></vaadin-text-field>
                <!-- Stretch the username field over 2 columns -->
                <vaadin-text-field
                  label="Tipo"
                  .value=${this.insumo.tipo}
                  @change=${(e: any) => {
                    //this.insumo.datos_generales.direccion = e.target.value;
                    this.insumo = { ...this.insumo, tipo: e.target.value };
                  }}
                ></vaadin-text-field>

                <vaadin-text-field
                  label="Subtipo"
                  .value=${this.insumo.subtipo}
                  @change=${(e: any) => {
                    //this.insumo.datos_generales.telefono = e.target.value;
                    this.insumo = { ...this.insumo, subtipo: e.target.value };
                  }}
                ></vaadin-text-field>

                <vaadin-text-field
                  label="Unidad"
                  name="email"
                  .value=${this.insumo.unidad}
                  @change=${(e: any) => {
                    //this.insumo.datos_generales.email = e.target.value;
                    this.insumo = { ...this.insumo, unidad: e.target.value };
                  }}
                  error-message="Por favor, ingrese una dirección valida"
                  clear-button-visible
                ></vaadin-text-field>
                <vaadin-text-field
                  label="Precio de Lista"
                  name="precio"
                  .value=${this.insumo.precio}
                  @change=${(e: any) => {
                    //this.insumo.datos_generales.email = e.target.value;
                    this.insumo = { ...this.insumo, precio: e.target.value };
                  }}
                  error-message="Por favor, ingrese una dirección valida"
                  clear-button-visible
                ></vaadin-text-field>

              </vaadin-form-layout>

              <!-- Grid detalles cultivos de insumo -->
              <div>
              <vaadin-button
                    @click=${this.agregar_cultivo}
                    theme="primary"
                    tabindex="0"
                    role="button"
                    >Agregar Cultivo</vaadin-button
                  >

                <vaadin-grid
                  .items="${
                    this.insumo.se_aplica_a.length === 0
                      ? []
                      : this.insumo.se_aplica_a
                  }"
                  all-rows-visible
                >
                  <vaadin-grid-column
                    header="Cultivo"
                    path="cultivo"
                    auto-width
                  ></vaadin-grid-column>
                  <vaadin-grid-column
                    header="Estadio Desde"
                    path="estadio_desde"
                    auto-width
                  ></vaadin-grid-column>
                  <vaadin-grid-column
                    header=""
                    .renderer="${this.actionsRenderer}"
                  ></vaadin-grid-column>
                </vaadin-grid>
              </div>
             
            </div> <!-- End Modal Body -->
            
            <div class="modal-footer">
              ${
                this._editing
                  ? html`<button type="button" class="btn btn-danger">
                      Eliminar
                    </button>`
                  : null
              }

              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${
                       ()=>{ if(this._editing){
                          this.dispatchEvent(new CustomEvent("edicion_insumo_cerrado",{bubbles:true,composed:true}));
                          this._modal.hide()
                        }
                      }
                }
              >
                Cerrar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.guardar_insumo}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }
}

customElements.define("insumo-crud", InsumoCrud);

declare global {
  interface HTMLElementTagNameMap {
    "insumo-crud": InsumoCrud;
  }
}
