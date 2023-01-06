import { html } from "lit";
import { Actividad } from "../../depositos/depositos-types";
import { translate } from "lit-translate";
import "@vaadin/form-layout";
import { tipos_siembra } from "../../jsons/tipos_siembra";

export const otros_datos_siembra_template = (actividad: Actividad) => {
  return html`
    <vaadin-horizontal-layout>
      <vaadin-form-layout>

      <vaadin-combo-box
          .items=${tipos_siembra}
          label=${translate("tipo_de_siembra")}
          .value=${actividad.detalles.tipo_siembra}
          @selected-item-changed=${(e) => {
            actividad.detalles.tipo_siembra = e.detail.value;
          }}
        >
        </vaadin-combo-box>
	
        <vaadin-number-field
          label=${translate("distancia_entre_surcos")}
          .value=${actividad.detalles.distancia}
          @input=${(e: CustomEvent) => {
            actividad.detalles.distancia = +e.target.value;
          }}
        >
          <div slot="suffix">cm</div>
        </vaadin-number-field>

        <vaadin-number-field
          label=${translate("densidad_objetivo")}
          .value=${actividad.detalles.densidad_objetivo}
          @input=${(e: CustomEvent) => {
            actividad.detalles.densidad_objetivo = +e.target.value;
          }}
        >
          <div slot="suffix">plantas/ha</div>
        </vaadin-number-field>



        <vaadin-number-field
          label=${translate("peso_mil_semillas")}
          .value=${actividad.detalles.peso_1000}
          @input=${(e: CustomEvent) => {
            actividad.detalles.peso_1000 = +e.target.value;
          }}
        >
          <div slot="suffix">grs</div>
        </vaadin-number-field>
      </vaadin-form-layout>
    </vaadin-horizontal-layout>
  `;
};
