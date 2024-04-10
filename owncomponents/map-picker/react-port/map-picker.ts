import { css, CSSResultGroup, html, LitElement, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@vaadin/text-field";
import "@vaadin/number-field";
import "@vaadin/button";
import "@vaadin/notification";

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
  static styles?: CSSResultGroup = [
    unsafeCSS(mapbox_geocoder_style),
    unsafeCSS(mapbox_draw_style),
    unsafeCSS(mapbox_style),
    css`
      /* The Overlay (background) */
      .overlay {
        /* Height & width depends on how you want to reveal the overlay (see JS below) */
        height: 0%;
        width: 100%;
        position: fixed; /* Stay in place */
        z-index: 1090; /* Sit on top, evita los controles de vaadin dialog */
        left: 0;
        top: 0;
        background-color: rgb(0, 0, 0); /* Black fallback color */
        background-color: rgba(0, 0, 0, 0.9); /* Black w/opacity */
        overflow-x: hidden; /* Disable horizontal scroll */
        transition: 0.5s; /* 0.5 second transition effect to slide in or slide down the overlay (height or width, depending on reveal) */
      }

      /* Position the content inside the overlay */
      .overlay-content {
        position: relative;
        top: 0%; /* 25% from the top */
        width: 100%; /* 100% width */
        text-align: center; /* Centered text/links */
        /*margin-top: 30px; */ /* 30px top margin to avoid conflict with the close button on smaller screens */
      }

      /* The navigation links inside the overlay */
      .overlay a {
        padding: 8px;
        text-decoration: none;
        font-size: 36px;
        color: #ffffff;
        display: block; /* Display block instead of inline */
        transition: 0.3s; /* Transition effects on hover (color) */
      }

      /* When you mouse over the navigation links, change their color */
      .overlay a:hover,
      .overlay a:focus {
        color: #f1f1f1;
      }

      /* Position the close button (top right corner) */
      .overlay .closebtn {
        position: absolute;
        top: 60px;
        z-index: 3;
        right: 45px;
        font-size: 60px;
      }

      /* Position the close button (top right corner) */
      .overlay .lnglat {
        position: absolute;
        top: 20px;
        z-index: 3;
        right: auto;
        color: #f1f1f1;
        font-size: 1em;
      }

      .overlay .listo-btn {
        position: absolute;
        top: 75%;
        z-index: 3;
        right: auto;
      }

      /* When the height of the screen is less than 450 pixels, change the font-size of the links and position the close button again, so they don't overlap */
      @media screen and (max-height: 450px) {
        .overlay a {
          font-size: 20px;
        }
        .overlay .closebtn {
          font-size: 40px;
          top: 15px;
          right: 35px;
        }
      }
    `,
    css`
      #map {
        position: absolute;
        top: 0px;
        bottom: 0;
        width: 100%;
        height: 100%;
      }

      @media only screen and (min-width: 800px) {
        #map {
          position: absolute;
          top: 0px;
          bottom: 0;
          width: 100%;
          height: calc(100vh) !important;
        }
      }

      .mapboxgl-ctrl-group button + button {
        border-top: none;
      }

      .mapboxgl-ctrl-top-right {
        z-index: 0 !important;
      }
    `,
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

  close() {
    this.shadowRoot.getElementById("myNav").style.height = "0%";
    this.notiOpened = false;
  }
  open() {
    this.shadowRoot.getElementById("myNav").style.height = "100%";
    this.map.resize();
    this.notiOpened = true;
  }

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
      <vaadin-horizontal-layout style="align-items: flex-end;" theme="spacing">
        <vaadin-button @click=${() => this.open()}>Pick</vaadin-button>
      </vaadin-horizontal-layout>

      <div id="myNav" class="overlay">
        <!-- Button to close the overlay navigation -->

        <a
          href="javascript:void(0)"
          class="closebtn"
          @click=${() => this.close()}
          >&times;</a
        >

        <!-- Overlay content -->
        <vaadin-horizontal-layout style="width:100%;justify-content:center">
          <div class="lnglat">
            ${this.posicion?.lat?.toFixed(6) ??
            ""},${this.posicion?.lng?.toFixed(6) ?? ""}
          </div>
        </vaadin-horizontal-layout>

        <div id="map"></div>

        <vaadin-horizontal-layout style="width:100%;justify-content:center">
          <vaadin-button
            class="listo-btn"
            theme="primary"
            @click=${() => {
              this.close();
              this.emit_input_changed();
            }}
            >${"PICK LOCATION"}</vaadin-button
          >
          <vaadin-button
            
            theme="primary error"
            @click=${() => this.close()}
            >${"Close"}</vaadin-button>
        </vaadin-horizontal-layout>
      </div>
    `;
  }
}

// declare global {
//   interface HTMLElementTagNameMap {
//     "map-picker-react": MapPicker;
//   }
// }
