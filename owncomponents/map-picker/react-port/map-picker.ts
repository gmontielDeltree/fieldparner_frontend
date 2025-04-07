import { css, CSSResultGroup, html, LitElement, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@vaadin/text-field";
import "@vaadin/number-field";
import "@vaadin/button";
import "@vaadin/notification";
import mapPickerStyles from './map-picker.scss?inline'; 

import { translate } from "lit-translate";
import {
  touchEvent
} from "../../helpers";
import {
  Map,
  Marker,
  LngLat,
  LngLatLike
} from "mapbox-gl";
import mapboxgl from "mapbox-gl";
import mapbox_geocoder_style from "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import mapbox_style from "mapbox-gl/dist/mapbox-gl.css?inline";
import mapbox_draw_style from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css?inline";

mapboxgl.accessToken =
  "pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw";

@customElement("map-picker-react")
export class MapPicker extends LitElement {
  static styles: CSSResultGroup = [
    unsafeCSS(mapbox_geocoder_style),
    unsafeCSS(mapbox_draw_style),
    unsafeCSS(mapbox_style),
    unsafeCSS(mapPickerStyles) 
  ];


  @state()
  map: Map;

  @state()
  nota_marker: Marker;

  @property()
  posicion: LngLatLike = new LngLat(-59.2965, -35.1923);

  @state()
  notiOpened: boolean = false;

  mover_marcador = (e) => {
    this.nota_marker.setLngLat(e.lngLat as LngLat);
    this.posicion = e.lngLat;
    this.map.resize();
  };

  willUpdate(p) {
    if (p.has("posicion") && this.posicion == null) {
      console.log("posicion es null", this.posicion);
    }
  }

  firstUpdated() {
    this.map = new Map({
      container: this.shadowRoot.getElementById("map"),
      //style: "mapbox://styles/mapbox/outdoors-v11",
      //style: mapStyle,
      style: "mapbox://styles/mapbox/satellite-streets-v12?optimize=true",
      center: new LngLat(-59.2965, -35.1923),
      zoom: 14,
      attributionControl: false,
      preserveDrawingBuffer: false,
    });

    this.nota_marker = new Marker()
      .setLngLat(this.map.getCenter())
      .addTo(this.map);

    this.map.on("load", () => this.map.resize());
    this.map.on(touchEvent, this.mover_marcador);
  }

  // close() {
  //   this.shadowRoot.getElementById("myNav").style.height = "0%";
  //   this.notiOpened = false;
  // }
  // open() {
  //   this.shadowRoot.getElementById("myNav").style.height = "100%";
  //   this.map.resize();
  //   this.notiOpened = true;
  // }

  emit_input_changed() {
    this.dispatchEvent(
      new CustomEvent("input", {
        detail: this.posicion,
        bubbles: true,
        composed: true,
      })
    );

    this.dispatchEvent(
      new CustomEvent("positionPicked", {
        detail: this.posicion,
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render(): unknown {
    return html`
      <vaadin-button @click=${() => this.open()}>Pick</vaadin-button>
  
      <div id="myNav" class="overlay ${this.notiOpened ? 'active' : ''}">
        <button class="closebtn" @click=${() => this.close()}>&times;</button>
  
        <vaadin-horizontal-layout style="width:100%;justify-content:center">
          <div class="coordinates-display">
            ${this.posicion?.lat?.toFixed(6) ?? ""},${this.posicion?.lng?.toFixed(6) ?? ""}
          </div>
        </vaadin-horizontal-layout>
  
        <div id="map"></div>
  
        <vaadin-horizontal-layout style="width:100%;justify-content:center">
          <vaadin-button
            theme="primary"
            @click=${() => {
              this.close();
              this.emit_input_changed();
            }}
          >${"PICK LOCATION"}</vaadin-button>
          <vaadin-button
            theme="error"
            @click=${() => this.close()}
          >${"Close"}</vaadin-button>
        </vaadin-horizontal-layout>
      </div>
    `;
  }
  
  async open() {
    this.notiOpened = true;
    await this.updateComplete;
    this.map?.resize();
  }
  
  close() {
    this.notiOpened = false;
  }
}

// declare global {
//   interface HTMLElementTagNameMap {
//     "map-picker-react": MapPicker;
//   }
// }
