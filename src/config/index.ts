import axios from 'axios';
import { getEnvVariables } from '../helpers/getEnvVariables';

const baseURL = getEnvVariables().VITE_AUTH_API;
export const baseUrlImg = getEnvVariables().VITE_COGS_SERVER_URL;

export const urlImg = `${baseUrlImg}/general/files/`;

export const imagesAPI = axios.create({
    baseURL: baseUrlImg
});

export const fieldpartnerAPI = axios.create({
    baseURL: baseURL,
});

//TODO: crear metodo para refrescar token
fieldpartnerAPI.interceptors.request.use((config) => {

    config.headers.set('channel', 'fieldpartner_front', false);
    config.headers.set("authorization", localStorage.getItem("accessToken"));
    config.headers.set("Content-Type", "application/json");
    // config.withCredentials = true;
    return config;
});