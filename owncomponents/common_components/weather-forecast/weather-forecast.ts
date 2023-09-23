import { format } from "date-fns";
import { LitElement, html } from "lit";
import { state } from 'lit/decorators.js';
import { OpenMeteoDaily, OpenMeteoResponse } from "./weather-functions";

export class WeatherForecast extends LitElement{

    @state()
    forecast : OpenMeteoResponse


    render(){
        let days = this.forecast.daily
        
        let day_card = (pd : OpenMeteoDaily, index : number) => html`
            <div>
                <div>${format(new Date(pd.time[index]),"")}</div>
                <div>${pd.weather.description}</div>
                <div><span>${pd.temperature_2m_max[index]}</span><span>${pd.temperature_2m_min[index]}</span></div>
            </div>
        `
        
        return html`

        `
    }
}