import { html } from "lit";
import { Actividad } from "../../../depositos/depositos-types";
import { map } from "lit/directives/map.js";
import "@vaadin/details"

const actividad_detalles = (actividad : Actividad) => html`

<vaadin-details summary="Insumos" opened theme="small">
            <!-- <div slot="summary">Insumos</div> -->

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
          <vaadin-details summary="Contratista" theme="small">

            <ul>
              <li>${actividad.contratista?.nombre || "Sin Contratista"}</li>
            </ul>
          </vaadin-details>
          <vaadin-details summary="Condiciones Esperadas de Trabajo" theme="small">
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
          <vaadin-details summary="Observaciones" theme="small">
          
            <ul>
              <li>${actividad.comentario}</li>
            </ul>
          </vaadin-details>

`

export {actividad_detalles}