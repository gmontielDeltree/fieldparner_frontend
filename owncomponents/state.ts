import {State, property} from '@lit-app/state'
import { Router } from '@vaadin/router';
import { Map } from 'mapbox-gl'
import PouchDB from "pouchdb";

// declate a state
class MyState extends State {
 @property({value: 'Bob'}) name  
 @property() map : Map
 @property() db : PouchDB.Database
 @property() campos : any
 @property() selected: any
 @property() router : Router 
}

const state = new MyState()
export default state