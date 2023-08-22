import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators";
import { Feature, FeatureCollection, featureCollection } from "@turf/helpers";

@customElement("indice-selector")
export class IndiceSelector extends LitElement {
  private indices_list = [{ name: "NDVI", value: "ndvi" }];

  @property({ attribute: false })
  public indice: any = this.indices_list[0];

  @property
  featureCollection: FeatureCollection = featureCollection([]);

  @state
  featureSelected: Feature;

  selectEvent(f: Feature) {
    this.dispatchEvent(
      new CustomEvent("selectedChange", {
        detail: f,
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    html`
      <vaadin-combo-box
        label="Indice"
        .items=${this.indices_list}
        .selectedItem=${this.indice}
      ></vaadin-combo-box>
      <vaadin-button id="prev"><</vaadin-button>
      <div style="display:flex; flex-direction:row;">
        ${this.featureCollection.features.map((f) => {
          return html`
            <vaadin-button
              @click=${() => {
                console.log("Feature Selected", f);
                this.selectEvent(f);
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
