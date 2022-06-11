import { Modal, Offcanvas } from "bootstrap";
import { LitElement, html, unsafeCSS } from "lit-element";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import { normalizar_username } from "../../helpers";

export class DepositosLista extends LitElement {
  static properties = {
    offcanvas_lista: {},
    deposito_modal: {},
    deposito: {},
    lineas_de_stock: {},
    depositos: {},
    db: {},
  };

  static styles = unsafeCSS(bootstrap);

  constructor() {
    super();
  }

  willUpdate(props) {
    if(props.has('db')){


    }
  }

  firstUpdated() {
    this.offcanvas_lista = new Offcanvas(
      this.shadowRoot.getElementById("depositos-oc")
    );
    this.deposito_modal = new Modal(
      this.shadowRoot.getElementById("deposito-modal")
    );
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

  ver_depo(d){
    this.offcanvas_lista.hide()
    this.deposito = d
    this.get_depo_stock(d.nombre)
    this.deposito_modal.show()

  }

  eliminar_depo(d){

    // Modal would be wise
    this.db.remove(d)
    this.get_depos()
    this.deposito_modal.hide()
    this.offcanvas_lista.show()
  }

  nueva_entrada(d){
    
  }

  get_depo_stock(d){
    
    this.db.allDocs({
      include_docs:true,
      startkey: "entrada:" + normalizar_username(d),
      endkey: "entrada:" + normalizar_username(d) + "\ufff0",}).then((e)=>{
        console.log("ALL DOCS", normalizar_username(d), e)
        let lineas_de_stock = {}
        let entradas = e.rows
        entradas.map(({doc}) => { 
          let insumos = doc.insumos
          console.log("INSUMOS", insumos)
          Object.entries(insumos).map(([k,insumo_item])=>{
            console.log('item', insumo_item)
            let cantidad = insumo_item.cantidad
            let current_cantidad = lineas_de_stock[k]?.cantidad || 0;
            let updated_cantidad = current_cantidad + cantidad
            if(k in lineas_de_stock){

            }else{
              lineas_de_stock[k] = {}
            }
            lineas_de_stock[k].cantidad = updated_cantidad
            lineas_de_stock[k].insumo = insumo_item.insumo
          })
        })
        console.log("Stocks", lineas_de_stock)
    })
  }

  show() {
    this.get_depos()
    this.offcanvas_lista.show();
  }

  hide() {
    this.offcanvas_lista.hide();
    this.deposito_modal.hide();
  }

  render() {
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
                <a href="#" @click=${()=>this.ver_depo(d)} class="list-group-item list-group-item-action"
                  >${d.nombre}</a
                >
              `;
            })}
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
              <button type="button" @click=${()=>this.nueva_entrada(this.deposito)} class="btn btn-primary">Nueva Entrada</button>
              <button type="button" @click=${()=>this.eliminar_depo(this.deposito)} class="btn btn-danger btn-sm">Eliminar</button>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">${this.lineas_de_stock}</div>
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
    `;
  }
}

customElements.define("depositos-lista", DepositosLista);
