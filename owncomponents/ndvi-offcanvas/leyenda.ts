import { css, html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import {classMap} from 'lit/directives/class-map.js';

export class LeyendaNdvi extends LitElement {
  @property()
  escala: string = "fija"; // 'dinamica'

  @property()
  index_value: string = "";

  static override styles = css`
    #grad1 {
      height: 20px;
      background-color: red; /* For browsers that do not support gradients */
      margin: 5px;
    }

    .escala-fija {
        background-image: linear-gradient(to right,black, red, green);
    }

    .escala-dinamica{
        background-image: linear-gradient(to right, blue, red, green);
    }

    .escala-fija-ndmi{
        background-image: linear-gradient(to right, white, blue);
    }

    .legend-back {
      background-color: black;
      padding: 10px;
      width:150px;
      color: white;
      z-index: 99999999;
      position: fixed;
      left: 50%;
      bottom: 20px;
    }

    .eti-head {
      flex-direction: row;
      flex: fit-content;
      display: flex;
      justify-content: space-between;
    }
  `;

  render(): unknown {
    
    if(this.escala === 'dinamica'){
        return html`<div class="legend-back">
        <div class="eti-head">
          <div class="eti">Min</div>
          <div class="eti">Media</div>
          <div class="eti">Max</div>
        </div>
        <div class="escala-dinamica" id="grad1"></div>
      </div>`;
    }

    if(this.escala === 'fija'){
        return html`<div class="legend-back">
        <div class="eti-head">
          <div class="eti">-1</div>
          <div class="eti">-0.5</div>
          <div class="eti">0</div>
          <div class="eti">0.5</div>
          <div class="eti">1</div>
        </div>
        <div class=${this.index_value==='ndmi' ? classMap({"escala-fija-ndmi":true}):classMap({'escala-fija':true})} id="grad1"></div>
      </div>`;
    }
   
    return null
  }
}

customElements.define("leyenda-ndvi", LeyendaNdvi);

declare global {
  interface HTMLElementTagNameMap {
    "leyenda-ndvi": LeyendaNdvi;
  }
}
