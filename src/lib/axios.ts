import axios from 'axios';
import { config } from '../config/env';
import { getSalesPurchaseToken, clearSalesPurchaseToken } from '../features/sales-purchase/utils/ssoSession';
import { getCanteenToken, clearCanteenSession } from '../features/canteen/utils/ssoSession';
import { notifyAuthError } from './apiAuthEvents';

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

function isSalesPurchaseUrl(url: string | undefined): boolean {
  return !!url && url.includes('/sales-purchase') && !url.includes('/sales-purchase/auth/sso');
}

function isCanteenUrl(url: string | undefined): boolean {
  return (
    !!url &&
    url.includes('/canteen') &&
    !url.includes('/canteen/auth/sso') &&
    !url.includes('/canteen/auth/login')
  );
}

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  async (axiosConfig) => {
    if (isSalesPurchaseUrl(axiosConfig.url)) {
      try {
        const spToken = await getSalesPurchaseToken();
        axiosConfig.headers.Authorization = `Bearer ${spToken}`;
        return axiosConfig;
      } catch {
        // Fall through to the default token so the request still goes out
        // and surfaces a normal error response instead of silently hanging.
      }
    }

    if (isCanteenUrl(axiosConfig.url)) {
      try {
        const canteenToken = await getCanteenToken();
        axiosConfig.headers.Authorization = `Bearer ${canteenToken}`;
        return axiosConfig;
      } catch {
        // Fall through to the default token so the request still goes out
        // and surfaces a normal error response instead of silently hanging.
      }
    }

    // Prefer config.apiToken so it overrides any stale localStorage token while debugging
    const token = config.apiToken || localStorage.getItem('accessToken');
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
  async (error) => {
    const originalRequest = error.config;

    // A Sales & Purchase session token can expire mid-session; on a 401 from
    // that module, drop the cached token, re-exchange it once, and retry.
    if (
      error.response?.status === 401 &&
      isSalesPurchaseUrl(originalRequest?.url) &&
      !originalRequest._spRetried
    ) {
      originalRequest._spRetried = true;
      clearSalesPurchaseToken();
      try {
        const spToken = await getSalesPurchaseToken();
        originalRequest.headers.Authorization = `Bearer ${spToken}`;
        return axiosInstance(originalRequest);
      } catch {
        // fall through and reject with the original error
      }
    }

    // Same recovery for a Canteen session token expiring mid-session.
    if (
      error.response?.status === 401 &&
      isCanteenUrl(originalRequest?.url) &&
      !originalRequest._canteenRetried
    ) {
      originalRequest._canteenRetried = true;
      clearCanteenSession();
      try {
        const canteenToken = await getCanteenToken();
        originalRequest.headers.Authorization = `Bearer ${canteenToken}`;
        return axiosInstance(originalRequest);
      } catch {
        // fall through and reject with the original error
      }
    }

    notifyAuthError(error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
