/* eslint-disable no-debugger */
import axios from 'axios';
import authService from '@/services/authService';

const instance = axios.create();

instance.interceptors.request.use((config) => {
    config.url = `${config.url}`

    return config;
});

const baseUrl = process.env.NODE_ENV == 'development' ? 'https://localhost:44351' : 'https://health-care-api.azurewebsites.net/'
instance.defaults.baseURL = baseUrl;
// instance.defaults.withCredentials = true;

instance.interceptors.request.use(function (config) {
    const token = authService.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default instance;