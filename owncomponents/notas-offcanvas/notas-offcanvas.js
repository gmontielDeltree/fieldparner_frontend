import { LitElement, html } from "lit-element";

export class NotasOffcanvas extends LitElement {
  static properties = {};

  constructor() {
    super();
  }

  render() {
    return html`
      <!--Add Nota Form-->
      <div
        class="offcanvas offcanvas-bottom h-50"
        data-bs-scroll="true"
        data-bs-backdrop="false"
        tabindex="-1"
        id="offcanvas-nueva-nota"
        aria-labelledby="offcanvasBottomLabel"
      >
        <div class="offcanvas-header py-1">
          <button
            type="button"
            id="cerrar-nueva-nota-btn"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
          <h6 class="offcanvas-title">Nueva Nota</h6>

          <button
            type="button"
            id="guardar-nueva-nota-btn"
            class="btn btn-success"
            aria-label=""
          >
            Guardar
          </button>
        </div>
        <hr class="my-0" />
        <div class="offcanvas-body">
          <div class="col">
            <div class="row">
              <label for="nota-color-input" class="col-2">Color</label>
              <div
                class="btn-group col-10"
                role="group"
                id="nota-color-input"
                aria-label="Basic mixed styles example"
              >
                <input
                  type="radio"
                  class="btn-check nota-status"
                  name="btnradio"
                  id="btnradio-danger"
                  autocomplete="off"
                  checked
                />
                <label
                  class="btn btn-outline-danger btn-danger"
                  for="btnradio-danger"
                  >Urgente</label
                >

                <input
                  type="radio"
                  class="btn-check nota-status"
                  name="btnradio"
                  id="btnradio-warning"
                  autocomplete="off"
                />
                <label
                  class="btn btn-outline-warning btn-warning"
                  for="btnradio-warning"
                  >Atención</label
                >

                <input
                  type="radio"
                  class="btn-check nota-status"
                  name="btnradio"
                  id="btnradio-success"
                  autocomplete="off"
                />
                <label
                  class="btn btn-outline-success btn-success"
                  for="btnradio-success"
                  >Todo Bien</label
                >
              </div>
              <!-- <input type="color" class="form-control form-control-color col-4" id="nota-color-input" value="#563d7c" title="Choose your color"> -->
            </div>

            <hr />

            <textarea
              class="form-control"
              id="nota-comentario-input"
              placeholder="Tus comentarios..."
              rows="3"
            ></textarea>
            <hr />

            <div class="row mb-2" id="img-preview"></div>

            <input
              id="foto-upload-input"
              class="d-none"
              type="file"
              accept="image/*"
            />
            <button type="button" id="anadir-foto-btn" class="btn btn-success">
              Añadir Foto
            </button>

            <hr />

            <div class="row" id="audio-div">
              <audio-recorder></audio-recorder>
            </div>
          </div>

          <hr />

          <div>
            <div class="row">
              <label for="fecha-btn" class="form-label col-8">Fecha</label>
              <button
                type="button"
                id="nota-fecha-btn"
                class="btn btn-secondary col-4"
              >
                Hoy
              </button>
            </div>
            <div class="row">
              <label for="hora-btn" class="form-label col-8">Hora</label>
              <button
                type="button"
                id="nota-hora-btn"
                class="btn btn-secondary col-4"
              >
                11:22
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        class="offcanvas offcanvas-end"
        tabindex="-1"
        id="offcanvas-problemas"
        aria-labelledby="offcanvasRightLabel"
      >
        <div class="offcanvas-header">
          <h5>Problemas</h5>
          <button
            id="cerrar-problemas-btn"
            type="button"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
          <button
            id="seleccionar-problemas-btn"
            type="button"
            class="btn"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body">...</div>
      </div>

      <div
        class="modal fade"
        id="detalle-imagen-modal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel"></h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <img id="imagen-modal-preview" class="img-fluid" src="" />
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                id="borrar-img-btn"
                data-bs-index="0"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        class="offcanvas offcanvas-bottom"
        tabindex="-1"
        id="offcanvas-nota"
        aria-labelledby="offcanvas-nota-header"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvas-nota-header">Nota</h5>
          <button
            type="button"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body small col">
          <div class="row" id="nota-texto"></div>
          <div class="row mb-2" id="nota-img-preview"></div>
          <div class="row" id="nota-audio-players"></div>
          <div class="row" id="nota-problemas"></div>
          <div class="row" id="nota-campo"></div>
        </div>
      </div>
    `;
  }
}

customElements.define("notas-oc", NotasOffcanvas);
