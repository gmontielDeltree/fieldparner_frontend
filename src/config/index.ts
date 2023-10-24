import axios from 'axios';
import { getEnvVariables } from '../helpers/getEnvVariables';

const baseURL = getEnvVariables().VITE_AUTH_API;

export const fieldpartnerAPI = axios.create({
    baseURL: baseURL,
});

fieldpartnerAPI.interceptors.request.use((config) => {

    // config.headers = {
    //     ...config.headers,
    //     'x-token': localStorage.getItem('token')
    // }
    config.headers.set('channel', 'fieldpartner_front', false);
    config.headers.set("authorization", localStorage.getItem("accessToken"));

    return config;
});