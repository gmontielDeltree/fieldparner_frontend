import { LitElement, html, unsafeCSS } from "lit";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import PouchDB from "pouchdb";
import { hashMessage, layer_visibility } from "../helpers";
import Offcanvas from "bootstrap/js/dist/offcanvas";
import { property, state } from "lit/decorators.js";
import { ImageSource, Map } from "mapbox-gl";

const img_bucket_url =
  "https://testbucketgarrapollo.s3.us-south.cloud-object-storage.appdomain.cloud/";

export class NdviOffcanvas extends LitElement {
  @property()
  map: Map;

  @property()
  ndvi_db: PouchDB.Database;

  @property()
  lote_doc: any;

  @state()
  obs: any[] = [];

  @state()
  selected_obs: any;

  @state()
  escala_dinamica: boolean = false;

  @state({
    hasChanged(newVal: Offcanvas, oldVal: Offcanvas) {
      return false;
    },
  })
  offcanvas: Offcanvas;

  constructor() {
    super();
    this.ndvi_db = new PouchDB(
      "https://apikey-v2-213njg3v1nihlky5l9jvum36ihirjsgu3dpddva8lfd0:7e233eca960bdea27bdc2a6db0251d89@ab6ed2ec-b5b6-4976-995e-39b79e891d70-bluemix.cloudantnosqldb.appdomain.cloud/ndvi"
    );
  }

  static override styles = unsafeCSS(bootstrap);

  firstUpdated() {
    this.offcanvas = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas-lote-ndvi")
    );
  }

  show() {
    let geometry = this.lote_doc.geometry;
    let clean_json = JSON.stringify(geometry, Object.keys(geometry).sort());
    hashMessage(clean_json).then((lote_hash) => {
      console.log("Lote Hash", lote_hash);
      // Build y  Mostrar la Galeria
      this.ndvi_db
        .get(lote_hash)
        .then(this.generar_ndvi_gallery)
        .catch((e) => {
          console.log("Error NDVI: Aun no existe ningun registro", e);
          alert(
            "Error NDVI: Aun no existe ningun registro. Si recien creo el lote espere unos instantes hasta que se recopilen las imagenes satelitales"
          );
        });
    });
  }

  img_url = (ob) => {
    if (this.escala_dinamica) {
      return img_bucket_url + ob.png_dinamica_url;
    } else {
      return img_bucket_url + ob.png_fija_url;
    }
  };

  mostrar_en_mapa = (ob) => {
    let bbox = [
      [ob.bbox.left, ob.bbox.top],
      [ob.bbox.right, ob.bbox.top],
      [ob.bbox.right, ob.bbox.bottom],
      [ob.bbox.left, ob.bbox.bottom],
    ];
    const img_src = this.img_url(ob);

    //layer_visibility(this.map, "lotes_internos", false);
    this.create_or_update_ndvi_source(img_src, bbox);
    this.selected_obs = ob;
  };

  create_or_update_ndvi_source = (img_src, bbox) => {
    // If e
    if (this.map.getSource("ndvi")) {
      // EXISTE la source -> Update
      const mySource = this.map.getSource("ndvi") as ImageSource;
      mySource.updateImage({
        url: img_src,
        coordinates: bbox,
      });
    } else {
      // No existe la source crear
      this.map.addSource("ndvi", {
        type: "image",
        url: img_src,
        coordinates: bbox,
      });

      this.map.addLayer({
        id: "ndvi-layer",
        type: "raster",
        source: "ndvi",
        paint: {
          "raster-fade-duration": 0,
          "raster-resampling":'nearest'
        },
      });

      this.map.moveLayer("ndvi-layer");
    }
  };

  /**
   * Renderiza la galeria de NDVI en los detalles del campo
   * @param {} result
   */
  generar_ndvi_gallery = async (result) => {
    /**
     * NDVI Layer Visible
     */
    if (this.map.getLayer("ndvi-layer")) {
      this.map.setLayoutProperty("ndvi-layer", "visibility", "visible");

      this.map.moveLayer("ndvi-layer");
    }

    const create_update_ndvi_source = (img_src, bbox) => {
      // If e
      if (this.map.getSource("ndvi")) {
        // EXISTE la source -> Update
        const mySource = this.map.getSource("ndvi") as ImageSource;
        mySource.updateImage({
          url: img_src,
          coordinates: bbox,
        });
      } else {
        // No existe la source crear
        this.map.addSource("ndvi", {
          type: "image",
          url: img_src,
          coordinates: bbox,
        });

        this.map.addLayer({
          id: "ndvi-layer",
          type: "raster",
          source: "ndvi",
          paint: {
            "raster-fade-duration": 0,
          },
        });

        this.map.moveLayer("ndvi-layer");
      }
    };

    const update_overlay_info = (info) => {
      // const overlay = document.getElementById("map-overlay");
      // const title_div = document.createElement("div");
      // const title = document.createElement("strong");
      // title.textContent = "Estadisticas ";
      // title_div.appendChild(title);
      // if (info.std < 0.1 && info.media < 0.1) {
      //   const condicion = document.createElement("span");
      //   condicion.textContent = "Nubosidad Severa";
      //   condicion.classList.add("badge");
      //   condicion.classList.add("bg-danger");
      //   // condicion.classList.add("text-dark")
      //   title_div.appendChild(condicion);
      // } else if (info.min < 0) {
      //   const condicion = document.createElement("span");
      //   condicion.textContent = "Nubosidad";
      //   condicion.classList.add("badge");
      //   condicion.classList.add("bg-warning");
      //   condicion.classList.add("text-dark");
      //   title_div.appendChild(condicion);
      // }
      // const media = document.createElement("div");
      // media.textContent = "Promedio: " + info.media.toFixed(2);
      // const std = document.createElement("div");
      // std.textContent = "Desviación Estándar: " + info.std.toFixed(2);
      // const max = document.createElement("div");
      // max.textContent = "Máximo: " + info.max.toFixed(2);
      // const min = document.createElement("div");
      // min.textContent = "Mínimo: " + info.min.toFixed(2);
      // overlay.innerHTML = "";
      // overlay.style.display = "block";
      // overlay.appendChild(title_div);
      // overlay.appendChild(media);
      // overlay.appendChild(std);
      // overlay.appendChild(max);
      // overlay.appendChild(min);
    };

    /**
     * Dibuja la miniatura del NDVI
     * @param {ob} observacion
     */
    const renderNdviThumb = (ob) => {
      //bbox, fecha, png_url
      const ndvi_div = this.shadowRoot.getElementById("lote-ndvi");
      const fecha = ob.fecha;
      const img_src = img_bucket_url + ob.png_url;

      const year = +fecha.substring(0, 4);
      const month = +fecha.substring(4, 6);
      const day = +fecha.substring(6, 8);

      const obs_date = new Date(year, month - 1, day);
      const dias_diff = Math.floor(
        (new Date().getTime() - obs_date.getTime()) / (1000 * 3600 * 24)
      );

      //const fechastr = obs_date.toString()

      let bbox = [
        [ob.bbox.left, ob.bbox.top],
        [ob.bbox.right, ob.bbox.top],
        [ob.bbox.right, ob.bbox.bottom],
        [ob.bbox.left, ob.bbox.bottom],
      ];

      /**
       * Dibuja el render sobre el mapa
       */

      const ndvi_on_click = (e) => {
        //layer_visibility(this.map, "lotes_internos", false);
        create_update_ndvi_source(img_src, bbox);
        update_overlay_info(ob.estadisticas);
      };

      let card_html = `<div class="card bg-dark text-white my-1">
							<img src="${img_src}" class="card-img" alt="...">
							<div class="card-img-overlay">
								<h5 class="card-title">${fecha}</h5>
								<p class="card-text">Hace ${dias_diff} dias</p>
							</div>
							</div>`;
      let card_element = document.createElement("div");
      card_element.classList.add("col-2");
      card_element.innerHTML = card_html;
      card_element.addEventListener("click", (e) => ndvi_on_click(e));
      ndvi_div.appendChild(card_element);
    };

    // Borro Lo anterior
    //let ndvi_div = this.shadowRoot.getElementById("lote-ndvi");
    //ndvi_div.textContent = "";

    /** Aplico para cada observacion */
    let obs = result.obs;
    this.obs = result.obs;

    //obs.forEach((ob) => renderNdviThumb(ob));

    // Muestro el Offcanvas en si mismo
    this.offcanvas.show();
  };

  render() {
    return html`
      <div
        class="offcanvas offcanvas-start"
        tabindex="-1"
        id="offcanvas-lote-ndvi"
        aria-labelledby="offcanvas-campo-header"
        data-bs-backdrop="false"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title">NDVI</h5>
          <div
            class="btn btn-primary"
            @click=${() => (this.escala_dinamica = !this.escala_dinamica)}
          >
            ${this.escala_dinamica
              ? "Ver en Escala Fija"
              : "Ver en Escala Dinámica"}
          </div>

          <button
            type="button"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            @click=${() => this.offcanvas.hide()}
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body small container-fluid row">
          <div class="row">
            ${this.selected_obs ? html` <div class="">DETALLLES</div> ` : null}
          </div>

          <div class="row overflow-auto">
            <div class="row mb-1"></div>
            ${this.obs.map((ob) => {
              return html`<div
                class="card row mb-3 mx-1"
                @click=${() => this.mostrar_en_mapa(ob)}
              >
                <img src="${this.img_url(ob)}" class="card-img-top" alt="..." />
                <div class="card-body">
                  <h5 class="card-title">${ob.fecha}</h5>
                  <p class="card-text">
                    This is a wider card with supporting text below as a natural
                    lead-in to additional content. This content is a little bit
                    longer.
                  </p>
                  <p class="card-text">
                    <small class="text-muted">Last updated 3 mins ago</small>
                  </p>
                </div>
              </div>`;
            })}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("ndvi-offcanvas", NdviOffcanvas);
