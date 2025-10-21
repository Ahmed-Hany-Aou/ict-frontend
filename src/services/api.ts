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
      // Token expired or invalid
      console.log('401 Error Detected. Logging out.'); // For debugging
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // We still redirect, but we also reject the promise
      // so the component's 'catch' block can run.
      window.location.href = '/auth';

      // ----------------------------------------------
      // 👇 ADD THIS LINE TO FIX THE BUG
      // ----------------------------------------------
      return Promise.reject(error); 
    }
    
    // For all other errors, just reject
    return Promise.reject(error);
  }
);

export default api;