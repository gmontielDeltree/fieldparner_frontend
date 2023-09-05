import { IControl, Map } from "mapbox-gl";

export class DualMap implements IControl {
  constructor({ onClick }) {
    this._evt = onClick;
  }

  private _btn: HTMLButtonElement;
  private _evt;
  private _container : HTMLElement;

  onAdd(map: Map): HTMLElement {
    this._btn = document.createElement("button");
    this._btn.className = "mapboxgl-ctrl-icon icon-dual";
    this._btn.type="button"
    this._btn.textContent=""
    this._btn.title = "Dual Map"
    this._btn.onclick = this._evt;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl-group mapboxgl-ctrl";
    this._container.appendChild(this._btn);
    return this._container;
  }

  onRemove(map: Map): void {
    this._container.parentNode.removeChild(this._container);
  }
}
