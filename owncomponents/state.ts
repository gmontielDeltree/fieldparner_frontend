import { LngLat } from "mapbox-gl";
import { State, property, storage } from "@lit-app/state";
import { Router } from "@vaadin/router";
import { Map } from "mapbox-gl";
import PouchDB from "pouchdb";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Lenguaje } from "./tipos/tipos-varios";
import { Campana } from "./tipos/tipos-varios";

// declate a state
class MyState extends State {
  @storage({ key: "ultima_posicion_key" })
  @property({
    value: {
      lng: -61.19468066139592,
      lat: -31.295018658148038,
    },
    type: Object,
  })
  ultima_posicion: LngLat;

  @storage({ key: "ultimo_zoom_key" })
  @property({ value: 3.4, type: Number })
  ultimo_zoom: number;

  @storage({ key: "jd_integracion" })
  @property({ value: { access_token: "", expires_in: 0 }, type: Object })
  jd_integracion: { access_token: string; expires_in: number };

  @property() map: Map;
  @property() draw: MapboxDraw;
  @property() db: PouchDB.Database;
  @property() db_sensores_raw: PouchDB.Database;
  @property() db_sensores_pro: PouchDB.Database;
  @property() campos: any;
  @property() selected: any;
  @property() router: Router;
  @property() user_db: PouchDB.Database;
  @property() user: any;
  @property({ value: false }) online: boolean;
  @property() campana_seleccionada: Campana;
  @property() lenguaje_seleccionado: Lenguaje;
  @property({value:[]}) location_history: string[];

}

const state = new MyState();

export const gbl_state = state;

export const gblStateLoaded = () => {
  //
  let loaded = true && state.map && state.db && state.draw && state.router;
  return loaded;
};

export const gblCampanaSeleccionadaLoaded = () => {
  return state.campana_seleccionada !== undefined;
};


export const nav_back = ()=> {
  // discard the current location
  state.location_history.pop();
  
  // take the previous one (and remove it from the list)
  const prev = state.location_history.pop();
  Router.go(prev ? prev : '/');
}

export default state;
