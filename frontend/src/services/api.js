import axios from "axios";
import { authHeaders } from "./auth";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
    timeout: 15000,
});

api.interceptors.request.use(config => {
    const headers = { ...config.headers, ...authHeaders() };
    config.headers = headers;
    return config;
});

export default api;
