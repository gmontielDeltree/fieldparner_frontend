import { LitElement, html } from "lit-element";
import PouchDB from 'pouchdb';
import variedades from './variedades.json'
import {base_url} from '../helpers.js'
import {debounce} from 'lodash-es'

export class VariedadesLoader extends LitElement{
	static properties = {
	
	}

	constructor(){
		super();
	}

	load(){
		const doc = (v) =>  {
			let especie = v['Especie']?.replaceAll(' ', '_') || "No definido"

			let cultivar = ''
			if(typeof v.Cultivar === 'string'){
				cultivar = v.Cultivar?.replaceAll(' ', '_') || "No definido"
			}else{
				cultivar = "" + v.Cultivar 
			}

			return ({
					"_id": especie + ":" + cultivar,
					especie : v['Especie'],
					cultivar: v['Cultivar'] || 'No definido',
					solicitante: v['Solicitante'],
					uuid: v['Nro Registro']
				})
			};

	        let db = new PouchDB(base_url + 'variedades');

		let docs = variedades.map(doc)

	        db.bulkDocs(docs).then(()=>{
			console.log("Completado")
		})

	}

	render(){
		return html
		`
		`
	}
}

customElements.define('variedades-loader', VariedadesLoader);