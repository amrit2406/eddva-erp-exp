import axios from 'axios';
import { config } from '../config/env';
import { getSalesPurchaseToken, clearSalesPurchaseToken } from '../features/sales-purchase/utils/ssoSession';
import { getCanteenToken, clearCanteenSession } from '../features/canteen/utils/ssoSession';
import { getAdmissionToken, clearAdmissionSession } from '../features/admission/utils/ssoSession';
import { notifyAuthError } from './apiAuthEvents';

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Modules with their own auth island: their API calls carry a module-specific
// token (exchanged from the core login, or issued by the module's own login)
// instead of the core accessToken.
interface TokenIsland {
  matches: (url: string | undefined) => boolean;
  getToken: () => Promise<string>;
  clear: () => void;
  retryFlag: string;
}

function islandUrl(prefix: string, excluded: string[]) {
  return (url: string | undefined) =>
    !!url && url.includes(prefix) && !excluded.some((path) => url.includes(path));
}

const tokenIslands: TokenIsland[] = [
  {
    matches: islandUrl('/sales-purchase', ['/sales-purchase/auth/sso']),
    getToken: getSalesPurchaseToken,
    clear: clearSalesPurchaseToken,
    retryFlag: '_spRetried',
  },
  {
    matches: islandUrl('/canteen', ['/canteen/auth/sso', '/canteen/auth/login']),
    getToken: getCanteenToken,
    clear: clearCanteenSession,
    retryFlag: '_canteenRetried',
  },
  {
    matches: islandUrl('/admission', ['/admission/auth/sso', '/admission/auth/login']),
    getToken: getAdmissionToken,
    clear: clearAdmissionSession,
    retryFlag: '_admissionRetried',
  },
];

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  async (axiosConfig) => {
    const island = tokenIslands.find((i) => i.matches(axiosConfig.url));
    if (island) {
      try {
        const token = await island.getToken();
        axiosConfig.headers.Authorization = `Bearer ${token}`;
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

    // A module session token can expire mid-session; on a 401 from that
    // module, drop the cached token, re-exchange it once, and retry.
    if (error.response?.status === 401) {
      const island = tokenIslands.find((i) => i.matches(originalRequest?.url));
      if (island && !originalRequest[island.retryFlag]) {
        originalRequest[island.retryFlag] = true;
        island.clear();
        try {
          const token = await island.getToken();
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        } catch {
          // fall through and reject with the original error
        }
      }
    }

    notifyAuthError(error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
