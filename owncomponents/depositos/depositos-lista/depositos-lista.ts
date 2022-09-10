import Offcanvas from "bootstrap/js/dist/offcanvas";
import Modal from "bootstrap/js/dist/modal";
import { LitElement, html, unsafeCSS } from "lit";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import { normalizar_username } from "../../helpers";
import "../../lista-searchable/lista-searchable.js";
import { property } from "lit/decorators.js";
import PouchDB from "pouchdb";
import { lineas_stock } from "../../helpers/stock";
import { uuid4 } from "uuid4";
import "../../lista-searchable/lista-searchable.js";

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

  @property({
    hasChanged(newVal: Offcanvas, oldVal: Offcanvas) {
      return false;
    },
  })
  offcanvas_lista: Offcanvas;

  @property({
    hasChanged(newVal: Modal, oldVal: Modal) {
      return false;
    },
  })
  deposito_modal: Modal;

  @property()
  deposito;

  @property()
  lineas_de_stock;

  @property()
  depositos;

  @property()
  db: PouchDB.Database;

  @property()
  lineas_de_entradas: Array<any> = [];

  @property()
  linea_entrada = {
    insumo: { nombre: "", unidad: "un", uuid: "" },
    cantidad: 0,
  };

  @property({
    hasChanged(newVal: Modal, oldVal: Modal) {
      return false;
    },
  })
  nueva_entrada_modal: Modal;

  @property()
  entradas: any = [];

  @property()
  insumos_lista = {};

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
    this.nueva_entrada_modal = new Modal(
      this.shadowRoot.getElementById("nueva-entrada-modal")
    );


    // fetch("insumos.json")
    //   .then((x) => x.json())
    //   .then((insumos) => {
    //       insumos.map((i) => this.insumos_lista[i.uuid] = i)
    //     }
    //   )
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
    this.linea_entrada = {
      insumo: { nombre: "", unidad: "un", uuid: "" },
      cantidad: 0,
    };
    this.lineas_de_entradas = [];
    this.nueva_entrada_modal.show();
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
        this.entradas = e.rows;
        this.lineas_de_stock = lineas_stock(e);

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

  guardar_nueva_entrada() {
    let doc = { ts: 0 };
    doc.ts = Math.floor(Date.now() / 1000);
    doc.deposito = this.deposito._id;
    doc._id =
      "entrada:" + normalizar_username(this.deposito.nombre) + ":" + uuid4();
    doc.uuid = uuid4();
    doc.tipo = "entrada";

    let insumos_keyhash = {};
    this.lineas_de_entradas.map((e) => {
      insumos_keyhash[e.insumo.uuid] = e;
    });
    doc.insumos = insumos_keyhash;

    this.db.put(doc).then(() => {
      console.log("DOC Entrada Grabado", doc);
    });

    this.get_depo_stock(this.deposito.nombre);
    this.nueva_entrada_modal.hide();
  }

  input_changed(e) {
    let no = { ...this.linea_entrada };
    no[e.target.name] = e.target.value;
    this.linea_entrada = no;
  }

  buscar_insumos(params, callback) {
    //this.shadowRoot.getElementById('nombre-auto').loading = true;

    // const filtro = (valor) => {
    //   return item[this.principal_key].toUpperCase().indexOf(value) > -1;
    // };

  //  let array_filtrado = Object.entries(this.lista).filter(filtro);

    fetch("insumos.json")
      .then((x) => x.json())
      .then((insumos) => insumos.filter((x) => x.name.toUpperCase().indexOf(params.query) > -1))
      .then(callback);
    //.then(() => this.shadowRoot.getElementById('nombre-auto').loading = false);
  }

  render() {
    let nueva_entrada_modal = html`
      <!-- Modal -->
      <div
        class="modal fade"
        id="nueva-entrada-modal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="modelTitleId"
        aria-hidden="true"
      >
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Nueva Entrada</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="nombre-input" class="form-label">Nombre</label>
                <input
                    type="text"
                    class="form-control"
                    .value=${this.linea_entrada.insumo.nombre}
                    @input=${(e): void => {
                      this.linea_entrada.insumo.nombre = e.target.value;
                    }}
                    name="nombre"
                    id="nombre-input"
                    aria-describedby=""
                    placeholder=""
                  />
<!--                 <pfe-autocomplete
                  id="nombre-auto"
                  .autocompleteRequest=${this.buscar_insumos}
                >
                
                </pfe-autocomplete> -->

                <small class="form-text text-muted"></small>
              </div>

              <div class="mb-3">
                <label for="cantidad-input" class="form-label">Cantidad</label>
                <input
                  type="text"
                  class="form-control"
                  .value=${this.linea_entrada.cantidad}
                  @input=${(e): void => {
                    this.linea_entrada.cantidad = Number(e.target.value);
                  }}
                  name="cantidad"
                  id="cantidad-input"
                  aria-describedby=""
                  placeholder=""
                />
                <small id="" class="form-text text-muted"></small>
              </div>

              <div class="mb-3">
                <label for="unidad-input" class="form-label">Unidad</label>
                <input
                  type="text"
                  class="form-control"
                  .value=${this.linea_entrada.insumo.unidad}
                  @input=${(e): void => {
                    this.linea_entrada.insumo.unidad = e.target.value;
                  }}
                  name="unidad"
                  id="unidad-input"
                  aria-describedby="helpId"
                  placeholder=""
                />
                <small id="helpId" class="form-text text-muted"></small>
              </div>

              <button
                type="button"
                class="btn btn-primary"
                @click=${() => {
                  this.linea_entrada.insumo.uuid =
                    this.linea_entrada.insumo.nombre; // Temporal
                  this.lineas_de_entradas.push(this.linea_entrada);
                  this.linea_entrada = {
                    insumo: { nombre: "", unidad: "un", uuid: "" },
                    cantidad: 0,
                  };
                }}
              >
                Agregar
              </button>

              <div class="list-group">
                ${this.lineas_de_entradas.map((e) => {
                  return html`<a
                    href="#"
                    class="list-group-item list-group-item-action"
                  >
                    ${e.insumo.nombre}
                  </a>`;
                })}
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.guardar_nueva_entrada}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
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
                  id="stocks-tab-pane"
                  role="tabpanel"
                  aria-labelledby="stocks-tab"
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
                                <p class="mb-1">Detalles Insumo</p>
                                <small>Empresa</small>
                              </a>
                            `;
                          }
                        )
                      : null}
                  </div>
                </div>
                <div
                  class="tab-pane fade"
                  id="entradas-tab-pane"
                  role="tabpanel"
                  aria-labelledby="entradas-tab"
                  tabindex="0"
                >
                  <div class="list-group mt-1">
                    ${this.entradas.map(({ doc }) => {
                      return html` <a
                        href="#"
                        class="list-group-item list-group-item-action flex-column align-items-start"
                      >
                        <div class="d-flex w-100 justify-content-between">
                          <h5 class="mb-1">${doc.ts}</h5>
                          <strong></strong>
                        </div>
                        <p class="mb-1"></p>
                        <small></small>
                      </a>`;
                    })}
                  </div>
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
