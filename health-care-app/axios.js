/* eslint-disable no-debugger */
import axios from 'axios';

const instance = axios.create();

instance.interceptors.request.use((config) => {
    config.url = `${config.url}`

    return config;
});
instance.defaults.baseURL = 'https://localhost:44336';
// instance.defaults.withCredentials = true;

export default instance;