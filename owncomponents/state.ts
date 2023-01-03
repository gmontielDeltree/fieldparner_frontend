import {State, property} from '@lit-app/state'
import { Router } from '@vaadin/router';
import { Map } from 'mapbox-gl'
import PouchDB from "pouchdb";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

// declate a state
class MyState extends State {
 @property({value: 'Bob'}) name  
 @property() map : Map
 @property() draw : MapboxDraw
 @property() db : PouchDB.Database
 @property() campos : any
 @property() selected: any
 @property() router : Router
 @property() user_db: PouchDB.Database
 @property() user : any
 @property() online: boolean
 @property() campana_seleccionada : Campana
}

const state = new MyState()

export const gbl_state = state;

export const gblStateLoaded = ()=>{
	//
	let loaded = true && state.map && state.db && state.draw && state.router
	return loaded;
}

export default state;