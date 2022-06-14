import { LitElement, html, css } from 'lit'
import { map } from 'lit/directives/map.js';
import moment from 'moment';
import 'moment/dist/locale/es';
import {stock_suficiente} from '../../helpers/stock.ts'


const p_from_insumo = (i) => {
    const motivos_2_str = motivos => {
        let motivos_array = Object.keys(motivos)
        let solo_verdaderos = motivos_array.filter(m => motivos[m])    
        return solo_verdaderos.join(", ") 
    }

    return html`<p class="small"><strong>${i.name.toUpperCase()}</strong> - Dosis: ${i.dosis} ${i.unidad} - Motivo: ${motivos_2_str(i.motivos)} </p>`

}

const timeline_css = css`.cbp_tmtimeline {
    margin: 0;
    padding: 0;
    list-style: none;
    position: relative
}

.cbp_tmtimeline:before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #eee;
    left: 20%;
    margin-left: -6px
}

.cbp_tmtimeline>li {
    position: relative
}

.cbp_tmtimeline>li:first-child .cbp_tmtime span.large {
    color: #444;
    font-size: 17px !important;
    font-weight: 700
}

.cbp_tmtimeline>li:first-child .cbp_tmicon {
    background: #fff;
    color: #666
}

.cbp_tmtimeline>li:nth-child(odd) .cbp_tmtime span:last-child {
    color: #444;
    font-size: 13px
}

.cbp_tmtimeline>li:nth-child(odd) .cbp_tmlabel {
    background: #f0f1f3
}

.cbp_tmtimeline>li:nth-child(odd) .cbp_tmlabel:after {
    border-right-color: #f0f1f3
}

.cbp_tmtimeline>li .empty span {
    color: #777
}

.cbp_tmtimeline>li .cbp_tmtime {
    display: block;
    width: 23%;
    padding-right: 70px;
    position: absolute
}

.cbp_tmtimeline>li .cbp_tmtime span {
    display: block;
    text-align: right
}

.cbp_tmtimeline>li .cbp_tmtime span:first-child {
    font-size: 15px;
    color: #3d4c5a;
    font-weight: 700
}

.cbp_tmtimeline>li .cbp_tmtime span:last-child {
    font-size: 14px;
    color: #444
}

.cbp_tmtimeline>li .cbp_tmlabel {
    margin: 0 0 15px 25%;
    background: #f0f1f3;
    padding: 1.2em;
    position: relative;
    border-radius: 5px
}

.cbp_tmtimeline>li .cbp_tmlabel:after {
    right: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-right-color: #f0f1f3;
    border-width: 10px;
    top: 10px
}

.cbp_tmtimeline>li .cbp_tmlabel blockquote {
    font-size: 16px
}

.cbp_tmtimeline>li .cbp_tmlabel .map-checkin {
    border: 5px solid rgba(235, 235, 235, 0.2);
    -moz-box-shadow: 0px 0px 0px 1px #ebebeb;
    -webkit-box-shadow: 0px 0px 0px 1px #ebebeb;
    box-shadow: 0px 0px 0px 1px #ebebeb;
    background: #fff !important
}

.cbp_tmtimeline>li .cbp_tmlabel h2 {
    margin: 0px;
    padding: 0 0 10px 0;
    line-height: 26px;
    font-size: 16px;
    font-weight: normal
}

.cbp_tmtimeline>li .cbp_tmlabel h2 a {
    font-size: 15px
}

.cbp_tmtimeline>li .cbp_tmlabel h2 a:hover {
    text-decoration: none
}

.cbp_tmtimeline>li .cbp_tmlabel h2 span {
    font-size: 15px
}

.cbp_tmtimeline>li .cbp_tmlabel p {
    color: #444
}

.cbp_tmtimeline>li .cbp_tmicon {
    width: 40px;
    height: 40px;
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    font-size: 1.4em;
    line-height: 40px;
    -webkit-font-smoothing: antialiased;
    position: absolute;
    color: #fff;
    background: #46a4da;
    border-radius: 50%;
    box-shadow: 0 0 0 5px #f5f5f6;
    text-align: center;
    left: 20%;
    top: 0;
    margin: 0 0 0 -25px
}

@media screen and (max-width: 992px) and (min-width: 768px) {
    .cbp_tmtimeline>li .cbp_tmtime {
        padding-right: 60px
    }
}

@media screen and (max-width: 65.375em) {
    .cbp_tmtimeline>li .cbp_tmtime span:last-child {
        font-size: 12px
    }
}

@media screen and (max-width: 47.2em) {
    .cbp_tmtimeline:before {
        display: none
    }
    .cbp_tmtimeline>li .cbp_tmtime {
        width: 100%;
        position: relative;
        padding: 0 0 20px 0
    }
    .cbp_tmtimeline>li .cbp_tmtime span {
        text-align: left
    }
    .cbp_tmtimeline>li .cbp_tmlabel {
        margin: 0 0 30px 0;
        padding: 1em;
        font-weight: 400;
        font-size: 95%
    }
    .cbp_tmtimeline>li .cbp_tmlabel:after {
        right: auto;
        left: 20px;
        border-right-color: transparent;
        border-bottom-color: #f5f5f6;
        top: -20px
    }
    .cbp_tmtimeline>li .cbp_tmicon {
        position: relative;
        float: right;
        left: auto;
        margin: -64px 5px 0 0px
    }
    .cbp_tmtimeline>li:nth-child(odd) .cbp_tmlabel:after {
        border-right-color: transparent;
        border-bottom-color: #f5f5f6
    }
}

.bg-green {
    background-color: #50d38a !important;
    color: #fff;
}

.bg-blush {
    background-color: #ff758e !important;
    color: #fff;
}

.bg-orange {
    background-color: #ffc323 !important;
    color: #fff;
}

.bg-info {
    background-color: #2CA8FF !important;
}`;

export class TimelineElement extends LitElement {
    static properties = {
        actividades:{},
        db: {},
        fsm: { state: true },
        stock_tag_table:{}
    }

    static styles = [timeline_css];


    evento_pdf(uuid){
        const event = new CustomEvent('generar-ot', {detail:{uuid:uuid}, bubbles: true, composed: true});
        this.dispatchEvent(event);
    }

    evento_eliminar(uuid){
        const event = new CustomEvent('eliminar-actividad', {detail:{uuid:uuid}, bubbles: true, composed: true});
        this.dispatchEvent(event);
    }

    constructor() {
        super();
        this.stock_tag_table = {}
    }

    willUpdate(props){
        if(props.has("db")){
             // Calcular tags
             console.log("CALC STOKS")
             this.actividades.map((act) => {
             console.log("CALC STOKS I")
                 stock_suficiente(this.db, act).then((status)=>{this.stock_tag_table[act.uuid] = status})
             })
        }

        if(props.has('actividades') && this.db){
            // Calcular tags
            console.log("CALC STOKS")
            this.actividades.map((act) => {
            console.log("CALC STOKS I")
                stock_suficiente(this.db, act).then((status)=>{this.stock_tag_table[act.uuid] = status})
            })
        }
    }

    createRenderRoot() {
        return this;
    }

    render() {

        let stock_tag = (stock_suficiente) => html`
            <p class="small">
            ${stock_suficiente}
        </p>`

        const time_item = (item) => {

            let stock_suficiente_tag = this.stock_tag_table[item.uuid];

            if(item.tipo === 'aplicacion'){
                let fecha = item.detalles.fecha
                let hectareas = item.detalles.hectareas
                let insumos = item.detalles.insumos
                let comentarios = item.detalles.comentarios
        
                let list_of_ps = insumos.map(p_from_insumo)
                let tipo_mayuscula = item.tipo.toUpperCase()
        
                console.log(moment.locale()); // en
                moment.locale('es')
                console.log(moment.locale()); // en
                let elapsed = moment(fecha,"DD-MM-YYYY").fromNow()
        
                return html`
                <li>
                    <time class="cbp_tmtime" datetime="2032-11-04T03:45"><span>${fecha}</span> <span>${elapsed}</span></time>
                    <div class="cbp_tmicon bg-blush"><i class="zmdi zmdi-label"></i></div>
                    <div class="cbp_tmlabel">
                        <h2><a>APLICACIÓN</a> <span class="text-muted">en ${hectareas} has.</span></h2>
                           ${list_of_ps}
                        <p class="small">
                            ${comentarios}
                        </p>
                        ${stock_tag(stock_suficiente_tag)}

                        ${navigator.share ? html`<button type="button" class="btn btn-success" @click=${()=>this.evento_pdf(item.uuid)}>Compartir Orden</button>` : html`<button class='btn btn-secondary' @click=${()=>{console.log(item.uuid); this.evento_pdf(item.uuid)}}>Orden de Trabajo</button>`}
                        
                        <button class='btn btn-danger' @click=${()=>{console.log(item.uuid); this.evento_eliminar(item.uuid)}}>Eliminar</button>

                    </div>          
                </li>`
            }else if(item.tipo === 'cosecha'){
                let fecha = item.detalles.fecha
                let hectareas = item.detalles.hectareas
                let rinde = item.detalles.rinde
                let comentarios = item.detalles.comentarios
                let humedad = item.detalles.humedad
        
                console.log(moment.locale()); // en
                moment.locale('es')
                console.log(moment.locale()); // en
                let elapsed = moment(fecha,"DD/MM/YYYY").fromNow()
        
        
                return html`
                    <li>
                    <time class="cbp_tmtime" datetime="2032-11-04T03:45"><span>${fecha}</span> <span>${elapsed}</span></time>
                    <div class="cbp_tmicon bg-green"><i class="zmdi zmdi-label"></i></div>
                    <div class="cbp_tmlabel">
                        <h2><a href="#">COSECHA</a> <span class="text-muted">de ${hectareas} has.</span></h2>
                        <p>Rinde: ${rinde} tn/ha - Humedad: ${humedad} %</p>
                        <p class="small">
                            ${comentarios}
                        </p>
        
                        <button class='btn btn-danger' @click=${()=>{console.log(item.uuid); this.evento_eliminar(item.uuid)}}>Eliminar</button>
                    </div>          
                </li>
                `
            }else if(item.tipo === 'siembra'){
                let fecha = item.detalles.fecha
                let hectareas = item.detalles.hectareas
                let comentarios = item.detalles.comentarios
                let cultivo = item.detalles.cultivo
                let varidad = item.detalles.variedad
                let peso_1000 = item.detalles.peso_1000
                let densidad_objetivo = item.detalles.densidad_objetivo
                let distancia = item.detalles.distancia

        
                console.log(moment.locale()); // en
                moment.locale('es')
                console.log(moment.locale()); // en
                let elapsed = moment(fecha,"DD/MM/YYYY").fromNow()
        
        
                return html`
                <li>
                <time class="cbp_tmtime" datetime="2032-11-04T03:45"><span>${fecha}</span> <span>${elapsed}</span></time>
                <div class="cbp_tmicon bg-orange"><i class="zmdi zmdi-label"></i></div>
                <div class="cbp_tmlabel">
                    <h2><a href="#">SIEMBRA</a> <span class="text-muted">en ${hectareas} has.</span></h2>
                    <p><strong>${cultivo} - ${varidad}</strong></p>
                    <p>${densidad_objetivo} pl/ha - ${distancia} cm entre surcos</p>
                    <p class="small">
                        ${comentarios}
                    </p>
        
                    <button class='btn btn-danger' @click=${()=>{console.log(item.uuid); this.evento_eliminar(item.uuid)}}>Eliminar</button>
                </div>          
            </li>
            `
        
            }else if(item.tipo === 'otro'){
        
            }
           
        }

        return html`<div class="container-fluid">
                <div class="row">
                    <div class="col-md-10">
                        <ul class="cbp_tmtimeline">

                            ${map(this.actividades, time_item)}

                        </ul>
                    </div>
                </div>
            </div>`

       // return timeline(this.actividades || [], this.evento_pdf);
    }
}



customElements.define('lit-timeline', TimelineElement);
