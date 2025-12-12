import axios from 'axios';

const STORAGE_KEY = 'openai_api_key';
let apiKey: string | null = localStorage.getItem(STORAGE_KEY);

export const setApiKey = (key: string) => {
    apiKey = key;
    localStorage.setItem(STORAGE_KEY, key);
};

export const getApiKey = () => apiKey;

export const clearApiKey = () => {
    apiKey = null;
    localStorage.removeItem(STORAGE_KEY);
};

const api = axios.create({
    baseURL: 'http://localhost:8001',
});

api.interceptors.request.use((config) => {
    if (apiKey) {
        config.headers['X-OpenAI-Key'] = apiKey;
    }
    return config;
});

export default api;
