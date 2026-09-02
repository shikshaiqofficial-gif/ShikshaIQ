import axios from 'axios';

// Always default to your live Render backend in production if VITE_API_BASE_URL is undefined
const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'https://shikshaiq-api.onrender.com/api';

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shiksha_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;