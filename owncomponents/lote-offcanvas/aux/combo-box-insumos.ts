import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@vaadin/combo-box";
import { comboBoxRenderer } from "@vaadin/combo-box/lit.js";
import type { ComboBoxLitRenderer } from "@vaadin/combo-box/lit.js";
import type { ComboBoxFilterChangedEvent } from "@vaadin/combo-box";
import { CultivoAplicacion, Insumo } from "../../insumos/insumos-types";
import { LineaDosis } from "../../depositos/depositos-types";
import { translate } from "lit-translate";
import { badge } from "@vaadin/vaadin-lumo-styles/badge";
import { map } from "lit/directives/map.js";
import "../aux/span-pill";
import "../aux/test";

@customElement("combo-box-insumos")
export class ComboBoxInsumos extends LitElement {
  @property()
  insumos: Insumo[];

  @property()
  linea_de_dosis: LineaDosis;

  @property()
  categorias_iniciales = []

  @state()
  insumos_post_filter : Insumo[] = []

  @state()
  private filteredItems: Insumo[] = [];

  private categorias: string[];

  private filtro_1_categorias : string [] = []
  private filtro_1_categorias_initial : string [] = ["Semillas"]

  async firstUpdated() {
    this.filter_1(this.categorias_iniciales)
    this.filter_2("")
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("insumos")) {
      this.categorias = this.lista_de_categorias();
      console.log("Categorias ->", this.categorias);
    }
  }

  lista_de_cultivos() {
    let categorias: string[] = [];
    if (this.insumos) {
      this.insumos.map((insumo) => {
        let cultivos: string[] = insumo.se_aplica_a.map((i) => i.cultivo);
        categorias = [...new Set([...categorias, ...cultivos] as string[])];
      });
    }
    return categorias;
  }

  lista_de_categorias() {
    let categorias: string[] = [];
    if (this.insumos) {
      this.insumos.map((insumo) => {
        let cultivos: string[] = [insumo.tipo === "" ? "Otros" : insumo.tipo]; // + (insumo.subtipo !== "" ? (" " +insumo.subtipo) : "")]
        categorias = [...new Set([...categorias, ...cultivos] as string[])];
      });
    }
    return categorias;
  }

  /**
   * Filtrado por el selector
   * @param checkedItems 
   */
  filter_1(checkedItems : string []){
    this.insumos_post_filter = this.insumos.filter((i)=>{
      // Verdadero si el tipo esta incluido en el selector checkedItems
      let c1 = checkedItems.includes(i.tipo)
      // Verdadero si el tipo es "" y  el selector incluye "Otros"
      let c2 = (i.tipo === "")&& checkedItems.includes("Otros")

      return c1 || c2;
    })
  }

  filter_2(filter_string){
    if(filter_string === ""){
      this.filteredItems = this.insumos_post_filter
    }
    if (this.insumos) {
      this.filteredItems = this.insumos_post_filter.filter((insumo) => {
        let condicion_1: boolean = insumo.marca_comercial
          .toLowerCase()
          .includes(filter_string.toLowerCase());
        return condicion_1;
      });
    }
  }

  clear(){
    this.shadowRoot.querySelector('#insumo1').clear()
  }

  render() {
    return html`
      <vaadin-combo-box
        id="insumo1"
        style="background-color: #b1ffb7; width:16em; --vaadin-combo-box-overlay-width: 25em"
        placeholder="${translate("seleccione_insumo")}"
        class="high-rating"
        .clearButtonVisible=${true}
        item-label-path="marca_comercial"
        item-value-path="uuid"
        .items=${this.insumos_post_filter}
        .selected-item=${this.linea_de_dosis.insumo}
        @selected-item-changed=${(e) => {
          let value = e.detail.value
          this.dispatchEvent(new CustomEvent("selected-item-changed",{detail:{value:value},bubbles:true,composed:true}))
        }}
        .filteredItems="${this.filteredItems}"
        @filter-changed="${this.filterChanged}"
        ${comboBoxRenderer(this.renderer, this.insumos)}
      >
        <menu-bar-checkable
          .selectedItems=${this.categorias_iniciales}
          .items=${this.categorias}
          slot="prefix"
          @selectedItemsChanged=${(e) => {
              console.log("SELECTED FILTER", e.detail)
              this.filter_1(e.detail)
              this.filtro_1_categorias = e.detail
              this.filter_2("")
            }
          }
        />
      </vaadin-combo-box>
    `;
  }

  private filterChanged(e: ComboBoxFilterChangedEvent) {
    const filter = e.detail.value;
    this.filter_2(filter)
  }

  // NOTE
  // We are using inline styles here to keep the example simple.
  // We recommend placing CSS in a separate style sheet and
  // encapsulating the styling in a new component.

  private renderer: ComboBoxLitRenderer<Insumo> = (insumo) => {
    let insumo_2_color = {semillas : "green", fertilizantes: "yellow", agroquímicos: "red", combustible:"blue", otros:"orange"}
    let var_color = "--bg-color:" + insumo_2_color[insumo.tipo.toLowerCase()] + ";"

    return html`
      <vaadin-vertical-layout style="line-height: var(--lumo-line-height-s);">
        <span>${insumo.marca_comercial}</span>
        <span
          style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);"
        >
          ${insumo.principio_activo}
        </span>
        <div>
          <span-pill style="${var_color}">${insumo.tipo}${insumo.subtipo === "" ? "" : "-" + insumo.subtipo}</span-pill>
          ${map(
            insumo.se_aplica_a,
            (cultivo) => html`<span-pill>${cultivo.cultivo}</span-pill>`
          )}
        </div>
      </vaadin-vertical-layout>
    `;
  };
}
