import { html } from "lit";
import { Actividad, Ejecucion, LineaDosisEjecucion } from "../../../depositos/depositos-types";
import { map } from "lit/directives/map.js";

const ejecucion_detalles = (ejecucion : Ejecucion, actividad: Actividad) => html`

   <vaadin-details opened theme="small">
                  <div slot="summary">Insumos</div>

                  <ul>
                    ${map(
                      ejecucion.detalles.dosis,
                      (item : LineaDosisEjecucion) =>
                        html`<li>
                          ${item.insumo.marca_comercial} -
                          ${item.dosis.toFixed(3)} ${item.insumo.unidad}/ha
                        </li>`
                    )}
                  </ul>
                </vaadin-details>
                <vaadin-details theme="small">
                  <div slot="summary">Contratista</div>
                  <ul>
                    <li>${actividad.contratista.nombre}</li>
                  </ul>
                </vaadin-details>
                <vaadin-details theme="small">
                  <div slot="summary">Condiciones de Trabajo</div>
                  <ul>
                    <li>
                      Temperatura promedio:
                      ${ejecucion.condiciones.temperatura.value}
                    </li>
                    <li>
                      Humedad promedio:
                      ${ejecucion.condiciones.humedad.value}
                    </li>
                    <li>
                      Velocidad viento promedio:
                      ${ejecucion.condiciones.velocidad.value}
                    </li>
                  </ul>
                </vaadin-details>
                <vaadin-details theme="small">
                  <div slot="summary">Observaciones</div>
                  <ul>
                    <li>${ejecucion.comentario}</li>
                  </ul>
                </vaadin-details>

`

export {ejecucion_detalles}