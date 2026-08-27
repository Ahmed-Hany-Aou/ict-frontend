// src/services/api.ts
import axios, { InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const currentPath = window.location.pathname;

      // Don't redirect if it's a login/register/forgot-password attempt
      if (url.includes('/login') || url.includes('/register') || url.includes('/forgot-password')) {
        return Promise.reject(error);
      }

      // Don't redirect if we're already on auth page or during logout
      if (currentPath === '/auth' || url.includes('/logout')) {
        return Promise.reject(error);
      }

      // For other 401 errors (expired/invalid token during authenticated requests)
      const hasToken = localStorage.getItem('auth_token');
      if (hasToken) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');

        setTimeout(() => {
          window.location.href = '/auth';
        }, 100);
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
