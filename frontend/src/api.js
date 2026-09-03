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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;