import { format } from "date-fns";
import { LitElement, html, css } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import { OpenMeteoDaily, OpenMeteoResponse, forecastWeather } from "./weather-functions";
import { LngLat, LngLatLike } from "mapbox-gl";
import { machine } from "./weather-machine"
import { interpret, assign } from 'xstate';
import { SelectorController } from 'xstate-lit';
import { showNotification } from '../../helpers/notificaciones';
import { get, translate } from 'lit-translate';
import { weather_icons } from "./weather-icons";

@customElement("weather-forecast")
export class WeatherForecast extends LitElement {

    @property()
    fecha: string;

    @property()
    posicion: LngLatLike = [-59.0979, -35.1854];

    @state()
    forecast: OpenMeteoResponse

    static styles = css`
        
        .day-card {
            margin: 5px;
            background-color: blue;
            color: aquamarine;
        border-radius: 5px;
        padding:5px;
        }
        
        .temperaturas{
            display: flex;
            justify-content: space-evenly;
            font-size: small;
        }

    `


    private actor;
    private ctx;
    private state;

    constructor() {
        super()
        console.log(this.posicion, this.fecha)

        this.actor = interpret(
            machine
                .withContext({
                    posicion: this.posicion,
                    data: {}
                })
                .withConfig({
                    actions: {
                        notificarError: () => showNotification(get("error"), "error"),
                        assignData: assign({
                            data: (_, evt) => evt.data
                        })
                    },
                    services: {
                        fetchData: (ctx) => {
                            return forecastWeather(ctx.posicion);
                        }
                    }
                }))

        /* Estado y Contexto */
        this.ctx = new SelectorController(this, this.actor, (state) => state.context);
        this.state = new SelectorController(this, this.actor, (state) => state.value);
        this.actor.start();
        this.actor.send({ type: "START" })
    }

    disconnectedCallback(): void {
        this.actor.send({ type: "CERRAR" });
        super.disconnectedCallback();
    }

    render() {
        let ctx = this.ctx.value;
        let state = this.state.value;

        let day_card = (pd: OpenMeteoResponse, index: number) => {
            console.log(pd);
            let wmo_code = pd.daily.weathercode[index]
            return html`
        <div class="day-card">
            <div class="fecha">${pd.daily.time[index]}</div>
            <div style="background: url(${weather_icons[wmo_code]});height: 4rem;background-size: contain;background-repeat: no-repeat;"></div>
            <div class="temperaturas"><span>${pd.daily.temperature_2m_min[index].toFixed(0)}ºC</span>  <span>${pd.daily.temperature_2m_max[index].toFixed(0)}ºC</span></div>
        </div>
        
    `}

        switch (state) {
            case 'showing':
                {
                    return html`
                        <!-- <p>Posicion ${JSON.stringify(ctx.posicion)}</p>
                        <p>Data ${JSON.stringify(ctx.data)}</p> -->
                        <div style="display:flex">
                            ${ctx.data.daily.time.map((_, index) => day_card(ctx.data, index))}
                        </div>
                    `
                }
                break;
            case "empty":
                return html`
                <p>Empty</p>
            `
                break;
            case 'loading':
                return html`
                <p>Loading</p>
            `
                break;
            case "error":
                return html`
                <p>ERROR</p>
            `
                break;
            default:

        }




    }
}