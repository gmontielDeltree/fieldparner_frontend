import { html } from "lit";
import { Actividad } from "../../../depositos/depositos-types";
import { map } from "lit/directives/map.js";

const actividad_detalles = (actividad : Actividad) => html`

<vaadin-details opened theme="small">
            <div slot="summary">Insumos</div>

            <ul>
              ${map(
                actividad.detalles.dosis,
                (item) =>
                  html`<li>
                    ${item.insumo.marca_comercial} - ${item.dosis.toFixed(3)}
                    ${item.insumo.unidad}/ha
                  </li>`
              )}
            </ul>
          </vaadin-details>
          <vaadin-details theme="small">
            <div slot="summary">Contratista</div>

            <ul>
              <li>${actividad.contratista?.nombre || "Sin Contratista"}</li>
            </ul>
          </vaadin-details>
          <vaadin-details theme="small">
            <div slot="summary">Condiciones Esperadas de Trabajo</div>
            <ul>
              <li>
                Temperatura min...max:
                ${actividad.condiciones.temperatura_min}...${actividad
                  .condiciones.temperatura_max}
              </li>
              <li>
                Humedad min...max:
                ${actividad.condiciones.humedad_min}...${actividad.condiciones
                  .humedad_max}
              </li>
              <li>
                Velocidad min...max:
                ${actividad.condiciones.velocidad_min}...${actividad.condiciones
                  .velocidad_max}
              </li>
            </ul>
          </vaadin-details>
          <vaadin-details theme="small">
            <div slot="summary">Observaciones</div>
            <ul>
              <li>${actividad.comentario}</li>
            </ul>
          </vaadin-details>

`

export {actividad_detalles}