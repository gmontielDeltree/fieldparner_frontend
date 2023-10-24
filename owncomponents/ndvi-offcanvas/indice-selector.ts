import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Feature, FeatureCollection, featureCollection } from "@turf/helpers";
import { IndiceEspectral, list_of_indexes } from "./indices-types";
import { deepcopy } from "../helpers";

@customElement("indice-selector")
export class IndiceSelector extends LitElement {
  private indices_list: IndiceEspectral[] = list_of_indexes;

  @property({ type: Object })
  selectedIndice: IndiceEspectral = this.indices_list[0];

  @property()
  featureCollection: FeatureCollection = featureCollection([]);

  @property()
  featureSelected: Feature | undefined;

  @query("#dates")
  private dates_div: HTMLElement;

  selectFeatureEvent(f: Feature) {
    this.dispatchEvent(
      new CustomEvent("selectedFeatureChange", {
        detail: { feature: f, indice: this.selectedIndice },
        bubbles: true,
        composed: true,
      })
    );
  }

  selectIndexEvent(e) {
    let index_value = e.target.value
    let index = this.indices_list.find((i)=>i.value === index_value)
    
    this.dispatchEvent(
      new CustomEvent("selectedIndexChange", {
        detail: index,
        bubbles: true,
        composed: true,
      })
    );
  }

  deduplicateDates(ofc: FeatureCollection) {
    let fc: FeatureCollection = deepcopy(ofc);

    const filtro = (f: Feature, i: number) => {
      if (i === 0) {
        return true;
      } else {
        let fv =
          f.properties.date !== fc.features[i - 1].properties.date
            ? true
            : false;
        // console.log(fv);
        return fv;
      }
    };

    let filtradas = fc.features.filter(filtro);
    fc.features = filtradas;
    return fc;
  }

  scrollToLeft() {
    this.dates_div.scrollBy({
      top: 0,
      left: -100,
      behavior: "smooth",
    });
  }

  scrollToRight() {
    this.dates_div.scrollBy({
      top: 0,
      left: 100,
      behavior: "smooth",
    });
  }

  static override styles = css`
    /* :host {
      display: block;
    } */
    .container {
      background-color: lightseagreen;
      border-radius: 1rem;
      padding: 10px;
    }

    .dates {
      white-space: nowrap;
      overflow: hidden;
      direction: rtl;
      border-color: #26cfcf;
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      border-style: groove;
    }

    .selected-feature {
      border-style: inset;
    }
  `;
  render() {
    let dedu = this.deduplicateDates(this.featureCollection);

    const conNube = (f: Feature) => f.properties.cloudCoverPercentage > 30;

    let indice_para_select = this.indices_list.map((i) => {
      return { label: i.name, value: i.value, indice:i };
    });

    const isFeatureSelected = (f: Feature) => {
      let id_feature_selected = this.featureSelected?.feature?.properties?.id;
      let id = f.properties.id;
         //   console.log("FEATURE SELECTED",this.featureSelected,id_feature_selected,id)

      let res =  id_feature_selected !== undefined
        ? id === id_feature_selected
        : false;
      
      // console.log("FEATURE SELECTED",this.featureSelected,id_feature_selected,id, res)
      
      return res
    };

    return html`
      <div class="container" style="display:flex; flex-direction:row; align-items:center;">
        <vaadin-select
          .items=${indice_para_select}
          .value=${indice_para_select[0].value}
          @change=${(e)=> this.selectIndexEvent(e)}
          .itemLabelPath=${"name"}
        ></vaadin-select>

        <vaadin-button id="prev" @click=${this.scrollToLeft} theme="secondary"
          ><</vaadin-button
        >
        <div id="dates" class="dates">
          ${dedu.features.map((f: Feature) => {
            return html`
              <vaadin-button
                style="direction:ltr;"
                class=${isFeatureSelected(f) ? "selected-feature" : ""}
                theme="primary"
                @click=${() => {
                  console.log("Feature Selected", f);
                  this.selectFeatureEvent(f);
                  // this.featureSelected = f;
                }}
                >${conNube(f)
                  ? html`
                      <vaadin-icon
                        icon="vaadin:cloud"
                        slot="prefix"
                      ></vaadin-icon>
                    `
                  : null}
                ${f.properties?.date ?? ""}</vaadin-button
              >
            `;
          })}
        </div>
        <vaadin-button id="next" @click=${this.scrollToRight} theme="secondary"
          >></vaadin-button
        >
      </div>
    `;
  }
}
