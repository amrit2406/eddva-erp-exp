export const API_AUTH_ERROR_EVENT = 'api:auth-error';

export interface ApiAuthErrorDetail {
  status: 401 | 403;
  message?: string;
}

// Login forms show their own inline error for bad credentials.
const SILENT_URLS = ['/auth/login'];

export function notifyAuthError(error: any): void {
  const status = error?.response?.status;
  const url: string | undefined = error?.config?.url;
  if (status !== 401 && status !== 403) return;
  if (url && SILENT_URLS.some((silent) => url.includes(silent))) return;

  const data = error.response?.data;
  const raw = data?.error?.message ?? data?.message;
  const message = typeof raw === 'string' ? raw : undefined;

  window.dispatchEvent(
    new CustomEvent<ApiAuthErrorDetail>(API_AUTH_ERROR_EVENT, { detail: { status, message } })
  );
}
