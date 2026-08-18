import axios from 'axios';
import { config } from '../config/env';

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (axiosConfig) => {
    // Prefer config.apiToken so it overrides any stale localStorage token while debugging
    const token = config.apiToken || localStorage.getItem('accessToken');

    // Log for debugging to see if Vite actually loaded the .env token
    // console.log("Axios Request - VITE_API_TOKEN loaded:", !!config.apiToken);

    if (token) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    return axiosConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // Handle unauthorized access
      // localStorage.removeItem('accessToken');
      // localStorage.removeItem('refreshToken');
      // Clear auth store
      // useAuthStore.getState().logout();
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
