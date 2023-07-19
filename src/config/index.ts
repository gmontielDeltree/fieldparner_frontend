import axios from 'axios';
import { getEnvVariables } from '../helpers/getEnvVariables';

const baseUrlAuth = getEnvVariables().VITE_AUTH_API;

export const authApi = axios.create({
    baseURL: `${baseUrlAuth}/auth`,
});