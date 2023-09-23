import { LngLat } from "mapbox-gl"
import axios from 'axios';

export interface OpenMeteoResponse {
    latitude:              number;
    longitude:             number;
    generationtime_ms:     number;
    utc_offset_seconds:    number;
    timezone:              string;
    timezone_abbreviation: string;
    elevation:             number;
    daily_units:           DailyUnits;
    daily:                 OpenMeteoDaily;
}

export interface OpenMeteoDaily {
    time:                          Date[];
    temperature_2m_max:            number[];
    temperature_2m_min:            number[];
    precipitation_sum:             number[];
    precipitation_hours:           number[];
    precipitation_probability_max: number[];
}

interface DailyUnits {
    time:                          string;
    temperature_2m_max:            string;
    temperature_2m_min:            string;
    precipitation_sum:             string;
    precipitation_hours:           string;
    precipitation_probability_max: string;
}

export const forecastWeather =  async (pos : LngLat) => {
    let res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${pos.lat}&longitude=${pos.lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_hours,precipitation_probability_max&timezone=auto`)
    return res.data as OpenMeteoResponse
}