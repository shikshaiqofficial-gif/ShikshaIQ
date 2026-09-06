import axios from 'axios';

const API = axios.create({
  baseURL: 'https://shikshaiq-api.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT Bearer token on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('[API Interceptor] Token being sent:', token ? token.substring(0, 15) + '...' : '❌ NO TOKEN FOUND');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;