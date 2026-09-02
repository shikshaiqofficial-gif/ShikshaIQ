import axios from 'axios';

let rawBase = import.meta.env.VITE_API_BASE_URL || 'https://shikshaiq-api.onrender.com/api';

// Strip any trailing slashes
rawBase = rawBase.replace(/\/+$/, '');

// Guarantee '/api' is appended if missing
if (!rawBase.endsWith('/api')) {
  rawBase = `${rawBase}/api`;
}

const API = axios.create({
  baseURL: rawBase,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('shiksha_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;