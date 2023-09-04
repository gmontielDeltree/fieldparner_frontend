import { vertical_legend } from "./d3-legend";
import { css, html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { IControl, Map } from "mapbox-gl";
import * as d3 from "d3";


const transpose = (array: number[][]) =>
  array[0].map((_, colIndex) => array.map((row) => row[colIndex]));

class LeyendaElement extends LitElement {
  @property()
  colormap: string | any = "viridis";

  @property()
  domain: number[] = [-1,1]

  @property()
  width = 35;

  @property()
  height = 200;

  static override styles = css``;


  string_to_d3_interpolate = (colormap : string)=>{
    let c = {viridis:d3.interpolateViridis,winter:d3.interpolateWinter}
    return c[colormap]
  }

  render() {
    const render_svg = () => {
      let svg: SVGElement = vertical_legend({
        color:d3.scaleSequential(this.domain, this.string_to_d3_interpolate(this.colormap)),
        width:this.width-10,
        height:this.height,
        title: "",
        tickSize: 0,
      });
      return svg;
    };

    return html`<div>
      <div id="container" style="width:${this.width+ 10}px;">
        ${render_svg()}
      </div>
    </div>`;
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

  setDomain(d:number[]){
    this._btn.domain = d
  }
  
  setColormap(cm:string){
    this._btn.colormap = cm
  }

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
