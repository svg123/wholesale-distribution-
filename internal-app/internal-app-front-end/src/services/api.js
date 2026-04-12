import axios from 'axios';
import config from '../config/env';

const api = axios.create({
  baseURL: `${config.apiUrl}/api`,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem(config.tokenKey);
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Unauthorized - clear auth and redirect to login
      if (status === 401) {
        localStorage.removeItem(config.tokenKey);
        localStorage.removeItem(config.userKey);
        window.location.href = '/login';
      }

      // Return structured error
      const message = error.response.data?.message || 'An error occurred';
      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    return Promise.reject(new Error('An unexpected error occurred.'));
  }
);

export default api;
