import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Actividad } from "../../depositos/depositos-types";
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import { Router } from "@vaadin/router";
import gbl_state from "../../state";
import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/button";
import "@vaadin/details";
import "@vaadin/horizontal-layout"
import '@vaadin/upload';

@customElement("actividad-item")
export class ActividadItem extends LitElement {
  @property()
  item: Actividad;

  render() {
    return html` <div>
        <a>${this.item?.tipo.toUpperCase()}</a>
        <span class="text-muted">en ${this.item.detalles.hectareas} has.</span>
        <vaadin-button
          @click=${() => Router.go(url_repeticion(this.item._id))}
          theme="icon"
          aria-label="Mas"
          ><vaadin-icon icon="vaadin:ellipsis-dots-h"></vaadin-icon>
        </vaadin-button>
      </div>
      <vaadin-tabsheet>
        <vaadin-tabs slot="tabs">
          <vaadin-tab id="dashboard-tab">Planificación</vaadin-tab>
          <vaadin-tab id="payment-tab">Ejecución</vaadin-tab>
          <vaadin-tab id="shipping-tab">Adjuntos</vaadin-tab>
        </vaadin-tabs>

        <!-- Planificacion -->
        <div tab="dashboard-tab">
            <div>Fecha Estimada de Aplicación</div>
          <vaadin-details opened theme="small">
            <div slot="summary">Insumos</div>

            <ul>
              <li>Blake Martin</li>
              <li>Caroline Clark</li>
              <li>Avery Torres</li>
              <li>Khloe Scott</li>
              <li>Camila Fisher</li>
              <li>Gavin Lewis</li>
              <li>Isabella Powell</li>
              <li>Zoe Wilson</li>
            </ul>
          </vaadin-details>
          <vaadin-details theme="small">
            <div slot="summary">Contratista</div>

            <ul>
              <li>Blake Martin</li>
              <li>Caroline Clark</li>
              <li>Avery Torres</li>
              <li>Khloe Scott</li>
              <li>Camila Fisher</li>
              <li>Gavin Lewis</li>
              <li>Isabella Powell</li>
              <li>Zoe Wilson</li>
            </ul>
          </vaadin-details>
          <vaadin-details theme="small">
            <div slot="summary">Observaciones</div>

            <ul>
              <li>Blake Martin</li>
              <li>Caroline Clark</li>
              <li>Avery Torres</li>
              <li>Khloe Scott</li>
              <li>Camila Fisher</li>
              <li>Gavin Lewis</li>
              <li>Isabella Powell</li>
              <li>Zoe Wilson</li>
            </ul>
          </vaadin-details>
        </div>
        <!-- Fin planificacion -->

        <!-- Ejecucion -->
        <div tab="payment-tab">
        <vaadin-horizontal-layout theme="spacing padding" style="justify-content: center">
            <vaadin-button @click=${()=>Router.go(gbl_state.router.urlForPath('/ejecucion'))} theme="primary success">
                Ejecutar
            </vaadin-button>
        </vaadin-horizontal-layout>
        </div>
        <!-- Fin Ejecucion -->

        <!-- Adjuntos -->
        <div tab="shipping-tab">This is the Shipping tab content</div>
        <!-- FinAdjuntos-->
      </vaadin-tabsheet>`;
  }
}

const url_repeticion = (actividad_uuid) => {
  let location = gbl_state.router.location.pathname;
  let url =
    location + "/actividad/" + encodeURIComponent(actividad_uuid) + "/repetir";
  return url;
};
