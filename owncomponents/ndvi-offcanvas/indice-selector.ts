import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Feature, FeatureCollection, featureCollection } from "@turf/helpers";
import { IndiceEspectral, list_of_indexes } from "./indices-types";

@customElement("indice-selector")
export class IndiceSelector extends LitElement {
  private indices_list: IndiceEspectral[] = list_of_indexes;

  @property()
  public selectedIndice: IndiceEspectral = this.indices_list[0];

  @property()
  featureCollection: FeatureCollection = featureCollection([]);

  @property()
  featureSelected: Feature | undefined;

  selectFeatureEvent(f: Feature) {
    this.dispatchEvent(
      new CustomEvent("selectedFeatureChange", {
        detail: {feature:f,indice:this.selectedIndice},
        bubbles: true,
        composed: true,
      })
    );
  }

  selectIndexEvent(f: Feature) {
    this.dispatchEvent(
      new CustomEvent("selectedIndexChange", {
        detail: f,
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
   return html`
      <vaadin-combo-box
        label="Indice"
        .items=${this.indices_list}
        .selectedItem=${this.selectedIndice}
      ></vaadin-combo-box>
      <vaadin-button id="prev"><</vaadin-button>
      <div style="display:flex; flex-direction:row;">
        ${this.featureCollection.features.map((f:Feature) => {
          return html`
            <vaadin-button
              @click=${() => {
                console.log("Feature Selected", f);
                this.selectFeatureEvent(f);
                this.featureSelected = f;
              }}
              >${f.properties?.date ?? ""}</vaadin-button
            >
          `;
        })}
      </div>
      <vaadin-button id="next">></vaadin-button>
    `;
  }
}
