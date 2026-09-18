import { config } from '../../../config/env';

const SP_TOKEN_KEY = 'sp_session_token';
const SP_TOKEN_SOURCE_KEY = 'sp_session_source_token';
const EXPIRY_SKEW_MS = 60_000;

interface DecodedTokenPayload {
  exp?: number;
  eddva_user_id?: string;
  institute_id?: string;
  is_institute_admin?: boolean;
  [key: string]: unknown;
}

function decodeToken(token: string): DecodedTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

function isExpired(payload: DecodedTokenPayload | null): boolean {
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000 - EXPIRY_SKEW_MS;
}

// A Sales & Purchase session token (whether minted by the SSO exchange or
// handed to us directly, e.g. a test token dropped into VITE_API_TOKEN)
// carries eddva_user_id/institute_id. A raw ERP login token doesn't.
function isSalesPurchaseSessionPayload(payload: DecodedTokenPayload | null): boolean {
  return !!payload && typeof payload.eddva_user_id === 'string' && typeof payload.institute_id === 'string';
}

function getBaseToken(): string {
  return config.apiToken?.trim() || localStorage.getItem('accessToken') || '';
}

// Cached token is only valid if it was derived from the base token that's
// currently configured — otherwise swapping VITE_API_TOKEN (e.g. admin ->
// manager while testing) would keep serving the old role's stale session.
function readCachedToken(): string | null {
  const baseToken = getBaseToken();
  const cachedToken = localStorage.getItem(SP_TOKEN_KEY);
  const cachedSource = localStorage.getItem(SP_TOKEN_SOURCE_KEY);
  if (!cachedToken || !baseToken || cachedSource !== baseToken) return null;

  if (isExpired(decodeToken(cachedToken))) return null;
  return cachedToken;
}

function cacheToken(spToken: string, sourceToken: string): void {
  localStorage.setItem(SP_TOKEN_KEY, spToken);
  localStorage.setItem(SP_TOKEN_SOURCE_KEY, sourceToken);
}

let inFlight: Promise<string> | null = null;

async function resolveToken(): Promise<string> {
  const baseToken = getBaseToken();
  if (!baseToken) {
    throw new Error('No session token available to sign in to Sales & Purchase.');
  }

  const basePayload = decodeToken(baseToken);
  if (isSalesPurchaseSessionPayload(basePayload) && !isExpired(basePayload)) {
    cacheToken(baseToken, baseToken);
    return baseToken;
  }

  // Otherwise this is a raw ERP login token — exchange it for a real
  // Sales & Purchase Platform session token.
  const url = `${config.apiUrl}/sales-purchase/auth/sso?token=${encodeURIComponent(baseToken)}`;
  const response = await fetch(url);
  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success || !body?.data?.sales_purchase_token) {
    throw new Error(body?.error?.message || 'Failed to establish a Sales & Purchase session.');
  }

  cacheToken(body.data.sales_purchase_token, baseToken);
  return body.data.sales_purchase_token;
}

export async function getSalesPurchaseToken(): Promise<string> {
  const cached = readCachedToken();
  if (cached) return cached;

  if (!inFlight) {
    inFlight = resolveToken().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

export function clearSalesPurchaseToken(): void {
  localStorage.removeItem(SP_TOKEN_KEY);
  localStorage.removeItem(SP_TOKEN_SOURCE_KEY);
}

export function getCachedIsInstituteAdmin(): boolean {
  const token = readCachedToken();
  if (!token) return false;
  return decodeToken(token)?.is_institute_admin === true;
}
