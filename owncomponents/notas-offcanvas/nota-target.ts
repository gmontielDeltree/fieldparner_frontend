import { LitElement, html, unsafeCSS, render, CSSResultGroup, PropertyValueMap } from "lit";
import { property, state } from "lit/decorators.js";
import "@vaadin/form-layout";
import "@vaadin/email-field";
import "@vaadin/text-field";
import "@vaadin/combo-box";
import "@vaadin/button";
import "@vaadin/horizontal-layout";
import "@vaadin/vertical-layout";
import "@vaadin/custom-field";
import "@vaadin/grid";
// import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import Offcanvas from "bootstrap/js/dist/offcanvas";
import { uuid4 } from "uuid4";
import PouchDB from "pouchdb";
import { GridItemModel } from "@vaadin/grid";
import "@vaadin/icons";
import { Map, Marker } from "mapbox-gl";
import { touchEvent } from "../helpers";
import "./notas-offcanvas.js";
import {Notification} from '@vaadin/notification';
import {layer_visibility } from "../helpers";

export class NotaShareTarget extends LitElement {
  @property()
  map: Map;

  @property()
  db: PouchDB.Database;

  @state()
  _estado: string = "inicial";

  @state()
  _lote_doc: any;

  @state()
  _notification: Notification;

  @state()
  _shared_audio_blob: any
  @state()
  _map_not_loaded : boolean = false;

//   static override styles: CSSResultGroup = [unsafeCSS(bootstrap)];

  constructor() {
    super();
    /* Share audio handler */
    navigator.serviceWorker.onmessage = (event) => {
      
      if(event.data.action !== 'load-audio'){
        return
      }

      console.log("OnMessage", event);
      let imageBlob = event.data.file;
      // Update the UI with the data that has been shared to it.
      // imageShare.src = URL.createObjectURL(imageBlob);
      this._shared_audio_blob = event.data.file;
      this.test_trigger()
      //alert("AUDIO RECIBIDO");
    };

    this.addEventListener('nueva-nota-finalizada', ()=>{
        this._estado = 'inicial'
        this.hideSelectionLayer()
    })
  }

  async seleccion({nombre, campo_parent_id}){
    // Recargar el lote desde la db
    console.log("SELECCION", nombre, campo_parent_id)

    let campo_doc = await this.db.get(campo_parent_id)
    console.log("C", campo_doc)

    this._lote_doc = campo_doc.lotes.filter(
        (lote) => lote.properties.nombre === nombre
      )[0] || {};

    this._estado = '2'
    this._notification.close() 
  }

  test_trigger(){
    this._estado = '1'
    this._notification = Notification.show('Seleccione el Lote donde agregar la nota de Audio', {
        position: 'top-end',
      });
    this.showSelectionLayer()
  }

  showSelectionLayer() {
      if(this.map){
        layer_visibility(this.map, "campos", false);
        layer_visibility(this.map, "lotes", false);
        layer_visibility(this.map, "campos_border", false);
        layer_visibility(this.map, "lotes_border", true);
        this._map_not_loaded = false;
      }else{
        this._map_not_loaded = true;  
      }

  }

  protected willUpdate(_changedProperties: PropertyValueMap<any> | globalThis.Map<PropertyKey, unknown>): void {
      if(_changedProperties.has('map') && this._map_not_loaded){
        this.showSelectionLayer()
      }
  }

  hideSelectionLayer() {
    layer_visibility(this.map, "campos", true);
    layer_visibility(this.map, "lotes", false);
    layer_visibility(this.map, "campos_border", true);
    layer_visibility(this.map, "lotes_border", false);
  }

  render() {
    if(this._estado === 'inicial'){
        return null;
    }else if(this._estado === '1'){
        return null;
    }else if(this._estado === '2'){
        return html`<notas-oc .map=${this.map} .db=${this.db} .lote_doc=${this._lote_doc} .audio=${this._shared_audio_blob} mostrar ></notas-oc>`;
    }  
  }
}

customElements.define("nota-share-target", NotaShareTarget);
