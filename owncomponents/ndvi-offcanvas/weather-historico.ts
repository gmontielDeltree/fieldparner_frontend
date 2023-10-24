import { LitElement, PropertyValueMap, html, property, state } from 'lit-element';
import { Feature } from '@turf/helpers';

type OpenMeteoHistoricalResponse = {
    latitude: number
    longitude: number
    generationtime_ms: number
    utc_offset_seconds: number
    timezone: string
    timezone_abbreviation: string
    elevation: number
    daily_units: {
        time: string
        weathercode: string
        temperature_2m_max: string
        temperature_2m_min: string
        precipitation_sum: string
    }
    daily: {
        time: Array<string>
        weathercode: Array<number>
        temperature_2m_max: Array<number>
        temperature_2m_min: Array<number>
        precipitation_sum: Array<number>
    }
}

class WeatherHistorico extends LitElement {

    @property()
    centro: Feature

    @property()
    date: string;

    @state()
    temperature: number;

    @state()
    temperature_min: number;

    @state()
    precipitation_sum: number;

    constructor() {
        super();
        this.temperature = null;
    }

    async connectedCallback() {
        super.connectedCallback();
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${this.centro.geometry.coordinates[1]}&longitude=${this.centro.geometry.coordinates[0]}&start_date=${this.date}&end_date=${this.date}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=America%2FNew_York`;
        const response = await fetch(url);
        const data: OpenMeteoHistoricalResponse = await response.json();
        this.temperature = data.daily.temperature_2m_max[0];
    }

    protected async willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        if (_changedProperties.has("date")) {
            const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${this.centro.geometry.coordinates[1]}&longitude=${this.centro.geometry.coordinates[0]}&start_date=${this.date}&end_date=${this.date}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=America%2FNew_York`;
            const response = await fetch(url);
            const data: OpenMeteoHistoricalResponse = await response.json();
            this.temperature = data.daily.temperature_2m_max[0];
            this.temperature_min = data.daily.temperature_2m_min[0];
            this.precipitation_sum = data.daily.precipitation_sum[0];

        }
    }

    render() {
        if (this.temperature !== null || this.temperature == 0) {
            return html`
            <div style="background-color:#20b2aa; color:white;font-size: 0.7rem;
    border-radius: 10px;
    padding: 3px;">
                <!-- <h2>${this.date}</h2> -->
                <p>Temp min: ${this.temperature}°C</p>
                <p>Temp max: ${this.temperature_min}°C</p>
                <p>Precipitación: ${this.precipitation_sum}mm</p>
            </div>
            `;
        }else{
            console.log("no hay datos para ese dia")
            return null
        }
    }
}

customElements.define('weather-historico', WeatherHistorico);
