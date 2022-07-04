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
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "bootstrap";
import lista_de_labores from "./labores.json";
import { uuid4 } from "uuid4";
import PouchDB from "pouchdb";
import { Contratista, Labor } from "./contratista-types"
import { ContratistaCrud } from "./contratista-crud";
import { GridItemModel } from "@vaadin/grid";
import '../contratistas/contratista-crud'
import '@vaadin/icons';

export class ContratistasLista extends LitElement {

  @state()
  _contratistas: Contratista []

  @state()
  _modal: Modal;

  @property()
  db: PouchDB.Database;

  static override styles : CSSResultGroup = [unsafeCSS(bootstrap)];

  override firstUpdated() {
    this._modal = new Modal(this.shadowRoot.getElementById("modal"));
  }

  show() {
    this._modal.show();
    this.db.get('contratistas').then((e : any) => {

      this._contratistas = Object.values(e.contratistas);
      console.log('Contratistas', e)

    }).catch((e) => {
      
    })
  }


  edit_contratista(c : Contratista){
    this._modal.hide()
    this.shadowRoot.getElementById('contratista-crud').edit(c)

    
  }

  borrar_contratista(c : Contratista){
    
    this.db.get('contratistas').then((e : any) => {
      delete e.contratistas[c.uuid]
      this.db.put(e)
      this._contratistas = Object.values(e.contratistas);

      console.log('Contratistas', e)
    }).catch((e) => {
      
    })

  }

  private statusRenderer = (root: HTMLElement, _: HTMLElement, model: GridItemModel<Contratista>) => {
    const contratista = model.item;
    render(
      html`
        <span theme="badge" @click=${() => this.edit_contratista(contratista)}
          ><vaadin-icon icon="vaadin:edit"></vaadin-icon></span>

        <span theme="badge" @click=${ () => this.borrar_contratista(contratista) }
          ><vaadin-icon icon="vaadin:trash"></vaadin-icon></span>

      `,
      root
    );
  };

  private laboresRenderer = (root: HTMLElement, _: HTMLElement, model: GridItemModel<Contratista>) => {
    const contratista = model.item;
    const labores = contratista.labores;

    render(
      html`
      <vaadin-vertical-layout >
        ${
              labores.map((labor)=>{
                if(labor.labor === 'Siembra'){
                  return html`<vaadin-button theme="primary success small">${labor.labor}</vaadin-button>`
                }else if(labor.labor === 'Cosecha'){
                  return html`<vaadin-button theme="primary error small">${labor.labor}</vaadin-button>`
                }else{
                  return html`<vaadin-button theme="primary contrast small">${labor.labor}</vaadin-button>`
                }
              })
            }
      </vaadin-vertical-layout>
      `,
      root
    );
  };

  render() {
    return html`<div
      class="modal fade"
      id="modal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-fullscreen">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Contratistas</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            
            <vaadin-grid
              .items=${this._contratistas}
              all-rows-visible
            >
              <vaadin-grid-column
                header="Nombre"
                path="nombre"
                auto-width
              ></vaadin-grid-column>
              <vaadin-grid-column
                header="CUIT"
                path="cuit"
              ></vaadin-grid-column>
              <vaadin-grid-column
                header="Labores"
                .renderer=${this.laboresRenderer}
              ></vaadin-grid-column>
              <vaadin-grid-column
                header="Acción"
                .renderer=${this.statusRenderer}
              ></vaadin-grid-column>

            </vaadin-grid>

          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <contratista-crud id='contratista-crud' .db=${this.db}></contratista-crud>
    `;
  }
}

customElements.define("contratistas-lista", ContratistasLista);

declare global {
  interface HTMLElementTagNameMap {
    "contratistas-lista": ContratistasLista;
  }
}
