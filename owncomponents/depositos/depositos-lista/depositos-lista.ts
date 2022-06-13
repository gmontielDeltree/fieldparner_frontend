import { Modal, Offcanvas } from "bootstrap";
import { LitElement, html, unsafeCSS } from "lit-element";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import { normalizar_username } from "../../helpers";
import '../../lista-searchable/lista-searchable.js';
import {property} from 'lit/decorators.js'
import * as PouchDB from 'pouchdb';

export class DepositosLista extends LitElement {
  // static override properties = {
  //   offcanvas_lista: {},
  //   deposito_modal: {},
  //   deposito: {},
  //   lineas_de_stock: {},
  //   depositos: {},
  //   db: {},
  //   nueva_entrada_modal:{},
  // };

  @property()
  offcanvas_lista: Offcanvas;

  @property()
  deposito_modal: Modal;

  @property()
  deposito;

  @property()
  lineas_de_stock 

  @property()
  depositos;

  @property()
  db: PouchDB

  @property()
  nueva_entrada_modal: Modal;

  static override styles = unsafeCSS(bootstrap);

  constructor() {
    super();
  }

  
  override willUpdate(props) {
    if (props.has("db")) {
    }
  }

  override firstUpdated() {
    this.offcanvas_lista = new Offcanvas(
      this.shadowRoot.getElementById("depositos-oc")
    );
    this.deposito_modal = new Modal(
      this.shadowRoot.getElementById("deposito-modal")
    );
    this.nueva_entrada_modal = new Modal(this.shadowRoot.getElementById('nueva-entrada-modal'))
  }

  get_depos() {
    this.db
      ?.allDocs({
        include_docs: true,
        startkey: "deposito:",
        endkey: "deposito:\ufff0",
      })
      .then((docs) => {
        this.depositos = docs.rows.map((d) => d.doc);
        console.log("DEPSITOS", this.depositos);
      });
  }

  ver_depo(d) {
    this.offcanvas_lista.hide();
    this.deposito = d;
    this.get_depo_stock(d.nombre);
    this.deposito_modal.show();
  }

  eliminar_depo(d) {
    // Modal would be wise
    this.db.remove(d);
    this.get_depos();
    this.deposito_modal.hide();
    this.offcanvas_lista.show();
  }

  nueva_entrada(d) {
    this.nueva_entrada_modal.show()
  }

  get_depo_stock(d) {
    this.db
      .allDocs({
        include_docs: true,
        startkey: "entrada:" + normalizar_username(d),
        endkey: "entrada:" + normalizar_username(d) + "\ufff0",
      })
      .then((e) => {
        console.log("ALL DOCS", normalizar_username(d), e);
        let lineas_de_stock = {};
        let entradas = e.rows;
        entradas.map(({ doc }) => {
          let insumos = doc.insumos;
          Object.entries(insumos).map(([k, insumo_item]) => {
            console.log("item", insumo_item);
            let cantidad = insumo_item.cantidad;
            let current_cantidad = lineas_de_stock[k]?.cantidad || 0;
            let updated_cantidad = current_cantidad + cantidad;
            if (!(k in lineas_de_stock)) {
              lineas_de_stock[k] = {};
            }
            lineas_de_stock[k].cantidad = updated_cantidad;
            lineas_de_stock[k].insumo = insumo_item.insumo;
          });
        });

        this.lineas_de_stock = lineas_de_stock;
        console.log("Stocks", this.lineas_de_stock);
      });
  }

  show() {
    this.get_depos();
    this.offcanvas_lista.show();
  }

  hide() {
    this.offcanvas_lista.hide();
    this.deposito_modal.hide();
  }

  guardar_nueva_entrada(){
     
  }

  render() {

    let nueva_entrada_modal = html`
      <!-- Modal -->
      <div class="modal fade" id="nueva-entrada-modal" tabindex="-1" role="dialog" aria-labelledby="modelTitleId" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Nueva Entrada</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="nombre-input" class="form-label">Nombre</label>
                <input type="text" class="form-control" name="nombre-input" id="nombre-input" aria-describedby="" placeholder="">
                <small  class="form-text text-muted"></small>
              </div>

              <div class="mb-3">
                <label for="cantidad-input" class="form-label">Cantidad</label>
                <input type="text" class="form-control" name="cantidad-input" id="cantidad-input" aria-describedby="" placeholder="">
                <small id="" class="form-text text-muted"></small>
              </div>

            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" @click=${this.guardar_nueva_entrada}>Save</button>
            </div>
          </div>
        </div>
      </div>
      
    `
    return html`
      <div
        class="offcanvas offcanvas-start"
        data-bs-scroll="true"
        data-bs-backdrop="false"
        tabindex="-1"
        id="depositos-oc"
        aria-labelledby="offcanvasScrollingLabel"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasScrollingLabel">
            Depositos
          </h5>
          <button
            type="button"
            class="btn-close"
            @click=${this.hide}
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body">
          <div class="list-group">
            ${this.depositos?.map((d) => {
              return html`
                <a
                  href="#"
                  @click=${() => this.ver_depo(d)}
                  class="list-group-item list-group-item-action"
                  >${d.nombre}</a
                >
              `;
            })}

            ${this.depositos?.length === 0 ? "No existe ningún deposito" : null}
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div
        class="modal fade"
        id="deposito-modal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="modelTitleId"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-fullscreen" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${this.deposito?.nombre}</h5>
              <button
                type="button"
                @click=${() => this.nueva_entrada(this.deposito)}
                class="btn btn-primary btn-sm my-1"
              >
                Nueva Entrada
              </button>
              <button
                type="button"
                @click=${() => this.eliminar_depo(this.deposito)}
                class="btn btn-danger btn-sm"
              >
                Eliminar
              </button>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <ul class="nav nav-tabs" id="myTab" role="tablist">
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link active"
                    id="home-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#home-tab-pane"
                    type="button"
                    role="tab"
                    aria-controls="home-tab-pane"
                    aria-selected="true"
                  >
                    Stocks
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link"
                    id="profile-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#profile-tab-pane"
                    type="button"
                    role="tab"
                    aria-controls="profile-tab-pane"
                    aria-selected="false"
                  >
                    Entradas
                  </button>
                </li>
              </ul>
              <div class="tab-content" id="myTabContent">
                <div
                  class="tab-pane fade show active"
                  id="home-tab-pane"
                  role="tabpanel"
                  aria-labelledby="home-tab"
                  tabindex="0"
                >
                  <div class="list-group mt-1">
                    ${this.lineas_de_stock
                      ? Object.entries(this.lineas_de_stock).map(
                          ([k, item]) => {
                            return html`
                              <a
                                href="#"
                                class="list-group-item list-group-item-action flex-column align-items-start"
                              >
                                <div
                                  class="d-flex w-100 justify-content-between"
                                >
                                  <h5 class="mb-1">${item.insumo.nombre}</h5>
                                  <strong>${item.cantidad}</strong>
                                </div>
                                <p class="mb-1">Paragraph</p>
                                <small>paragraph footer</small>
                              </a>
                            `;
                          }
                        )
                      : null}
                  </div>
                </div>
                <div
                  class="tab-pane fade"
                  id="profile-tab-pane"
                  role="tabpanel"
                  aria-labelledby="profile-tab"
                  tabindex="0"
                >
                  ..s.
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
              <button type="button" class="btn btn-primary">Guardar</button>
            </div>
          </div>
        </div>
      </div>
      ${nueva_entrada_modal}
    `;
  }
}

customElements.define("depositos-lista", DepositosLista);
