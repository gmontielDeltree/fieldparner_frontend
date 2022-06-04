import { LitElement, html, unsafeCSS } from "lit-element";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";

export class ListaSearchable extends LitElement {
  static properties = {
    es_nuevo: {},
    value: {},
    lista: {},
    lista_filtrada: {},
    item_el: {},
    principal_key: {},
  };

  static styles = unsafeCSS(bootstrap);

  constructor() {
    super();
    this.lista = [];
    this.lista_filtrada = [];
    this.value = "";
    this.es_nuevo = false;
  }

  input_change(e) {
    this.value = e.target.value;
    let event = new CustomEvent("input", { detail: e.target.value });
    this.dispatchEvent(event);

    let value = this.value.toUpperCase();

    const filtro = ([key, item]) => {
      if(typeof item[this.principal_key] !== 'string'){
        item[this.principal_key] = "" + item[this.principal_key]
      }
      return item[this.principal_key].toUpperCase().indexOf(value) > -1;
    };

    let array_filtrado = Object.entries(this.lista).filter(filtro);

    this.lista_filtrada = {};

    array_filtrado.map(([key, cul]) => {
      this.lista_filtrada[key] = cul;
    });

    let existe = Object.entries(this.lista).findIndex(
      ([k, c]) => c[this.principal_key].toUpperCase() === value
    );

    if (existe === -1) {
      // No existe
      this.es_nuevo = true;
    } else {
      this.es_nuevo = false;
    }
  }

  click_item(item) {
    this.value = item[this.principal_key];
    this.es_nuevo = false;
    let event = new CustomEvent("input", { detail: this.value });
    this.dispatchEvent(event);
  }

  render() {
    const item_lista_cultivos = ([key, item]) => {
      return html` <a
        href="#"
        @click=${() => this.click_item(item)}
        class="list-group-item list-group-item-action mx-auto col col-10"
        >${item[this.principal_key]}</a
      >`;
    };

    return html` <div class="container-fluid">
      <div class="input-group mb-3 mx-auto col col-10">
        <input
          type="text"
          class="form-control"
          id="cultivo-input"
          .value=${this.value}
          placeholder="Ingrese letras para buscar"
          @input=${this.input_change}
        />
        ${this.es_nuevo
          ? html`<span class="input-group-text btn-success">Nuevo</span>`
          : null}
      </div>
      <div
        class="list-group mx-auto "
        style="max-height:300px;overflow-y:auto; -webkit-overflow-scrolling: touch;"
      >
        ${Object.entries(this.lista_filtrada).map(item_lista_cultivos)}
      </div>
    </div>`;
  }
}

customElements.define("lista-searchable", ListaSearchable);
