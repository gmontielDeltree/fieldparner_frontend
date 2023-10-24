import { gbl_state } from './state';
import { LitElement, html, PropertyValueMap } from "lit";
import { customElement } from "lit/decorators.js";
import { layer_visibility } from './helpers';

@customElement('null-component')
export class NullComponent extends LitElement{

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
         // Reestablecer Mapa
         layer_visibility(gbl_state.map, "campos", true);
         layer_visibility(gbl_state.map, "campos_border", true);
         layer_visibility(gbl_state.map, "lotes", false);
         layer_visibility(gbl_state.map, "lotes_border", false);
         layer_visibility(gbl_state.map, "nombres_campos", true);
         //layer_visibility(gbl_state.map, "seleccion_lotes", false);
         layer_visibility(gbl_state.map, "seleccion_lotes_fill", false);
 
         /* Hide NDVI */
         //layer_visibility(gbl_state.map, "ndvi-layer", false);
         layer_visibility(gbl_state.map, "borde_de_este_lote", false);
         layer_visibility(gbl_state.map, "radar-layer", false);
         layer_visibility(gbl_state.map, "frontera_de_este_lote", false);
         gbl_state.map.getSource("canvas-source").pause();    
    }

    render(): unknown {
        return html``
    }
}