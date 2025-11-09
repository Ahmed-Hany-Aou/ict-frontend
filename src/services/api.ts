// src/services/api.ts
import axios, { InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Recommended for Sanctum
});

// Add token to requests if available
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

      // Don't redirect if it's a login/register/forgot-password attempt
      // These endpoints are expected to return 401 for wrong credentials
      if (url.includes('/login') || url.includes('/register') || url.includes('/forgot-password')) {
        return Promise.reject(error);
      }

      // For other 401 errors (expired/invalid token during authenticated requests)
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      // Redirect to auth page
      window.location.href = '/auth';
      return Promise.reject(error);
    }

    // For all other errors, just reject
    return Promise.reject(error);
  }
);

export default api;