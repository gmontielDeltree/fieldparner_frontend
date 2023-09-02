import { css, html, LitElement, PropertyValueMap } from "lit";
import { property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { IControl, Map } from "mapbox-gl";
import { plot as Pplot } from "plotty";

function generateArray(range, n) {
  // range is an array of two numbers representing the lower and upper limits of the range
  // n is an integer number representing the length of the output array
  // check if the input is valid
  if (!Array.isArray(range) || range.length !== 2 || !Number.isInteger(n) || n < 1) {
    return null;
  }
  // get the min and max values from the range array
  let min = Math.min(range[0], range[1]);
  let max = Math.max(range[0], range[1]);
  // calculate the step size to get n numbers within the range
  let step = (max - min) / (n - 1);
  // use Array.from() with a map function to generate the output array
  let output = Array.from({length: n}, (value, index) => min + index * step);
  return output;
}

const transpose = (array : number[][]) => array[0].map((_, colIndex) => array.map(row => row[colIndex]));

class LeyendaElement extends LitElement {
  @property()
  colormap: string | any = "viridis";

  @property()
  width = 10;

  @property()
  height = 200;

  static override styles = css``;

  make_data(w, h, domain) {
    let line = generateArray(domain, w);
    let v = generateArray([1,h],h);
    let d0 = v?.map(()=> line)
    let d0t = transpose((d0) ? d0 : [[]] )
    return d0t.flat().reverse()
 
  }

  plot() {
    let plot = new Pplot({
      canvas: this.shadowRoot?.getElementById("canvas"),
      data: this.make_data(this.width,this.height,[-1,1]),
      width: this.width,
      height: this.height,
      domain: [-1, 1],
      colorScale: "viridis",
    });
    plot.render();
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | globalThis.Map<PropertyKey, unknown>): void {
      this.plot()
  }
  render() {
    return html`<div><div>${[1,0.5,0,-0.5,-1].map(n=>html`<p>${n}</p>`)}</div><canvas id="canvas" width="${this.width}" height="${this.height}"></canvas></div>`;
  }
}

customElements.define("leyenda-element", LeyendaElement);

declare global {
  interface HTMLElementTagNameMap {
    "leyenda-element": LeyendaElement;
  }
}

export class LeyendaControl implements IControl {
  constructor() {}

  private _btn: LeyendaElement;
  private _evt;
  private _container: HTMLElement;

  onAdd(map: Map): HTMLElement {
    this._btn = document.createElement("leyenda-element");

    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl-group mapboxgl-ctrl";
    this._container.appendChild(this._btn);

    return this._container;
  }

  onRemove(map: Map): void {
    this._container?.parentNode?.removeChild(this._container);
  }
}
