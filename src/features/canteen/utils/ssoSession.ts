import { config } from '../../../config/env';
import type { CanteenPlatformUser } from '../types/canteen.types';

const CANTEEN_TOKEN_KEY = 'canteen_token';
const CANTEEN_TOKEN_SOURCE_KEY = 'canteen_token_source';
const CANTEEN_USER_KEY = 'canteen_user';
const EXPIRY_SKEW_MS = 60_000;

interface DecodedTokenPayload {
  exp?: number;
  id?: string;
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

// A Canteen Platform session token (SSO exchange, staff login, or a test token
// in VITE_API_TOKEN) carries institute_id + user_name. A raw ERP login token
// uses instituteId/email instead, so it can't be mistaken for one.
function isCanteenSessionPayload(payload: DecodedTokenPayload | null): boolean {
  return !!payload && typeof payload.institute_id === 'string' && typeof payload.user_name === 'string';
}

function getBaseToken(): string {
  return config.apiToken?.trim() || localStorage.getItem('accessToken') || '';
}

// Cached token is only valid if it was derived from the base token that's
// currently configured — otherwise swapping VITE_API_TOKEN (e.g. admin ->
// manager while testing) would keep serving the old role's stale session.
// A canteen staff direct-login token has no core "source" token, so it's
// cached under its own value as its source (see setCanteenSession).
function readCachedToken(): string | null {
  const cachedToken = localStorage.getItem(CANTEEN_TOKEN_KEY);
  const cachedSource = localStorage.getItem(CANTEEN_TOKEN_SOURCE_KEY);
  if (!cachedToken || !cachedSource) return null;

  const baseToken = getBaseToken();
  const isDirectStaffSession = cachedSource === cachedToken;
  // VITE_API_TOKEN is a deliberate override, so it must win over a leftover
  // staff login — otherwise the UI keeps acting as that (non-admin) staff user.
  if (isDirectStaffSession && config.apiToken?.trim()) return null;
  if (!isDirectStaffSession && cachedSource !== baseToken) return null;

  if (isExpired(decodeToken(cachedToken))) return null;
  return cachedToken;
}

function cacheToken(canteenToken: string, sourceToken: string): void {
  localStorage.setItem(CANTEEN_TOKEN_KEY, canteenToken);
  localStorage.setItem(CANTEEN_TOKEN_SOURCE_KEY, sourceToken);
}

let inFlight: Promise<string> | null = null;

async function resolveToken(): Promise<string> {
  const cached = readCachedToken();
  if (cached) return cached;

  const baseToken = getBaseToken();
  if (!baseToken) {
    throw new Error('No session token available to sign in to Canteen.');
  }

  const basePayload = decodeToken(baseToken);
  if (isCanteenSessionPayload(basePayload) && !isExpired(basePayload)) {
    cacheToken(baseToken, baseToken);
    return baseToken;
  }

  // Otherwise this is a raw ERP login token — exchange it for a real
  // Canteen Platform session token.
  const url = `${config.apiUrl}/canteen/auth/sso?token=${encodeURIComponent(baseToken)}`;
  const response = await fetch(url);
  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success || !body?.data?.canteen_token) {
    throw new Error(body?.error?.message || 'Failed to establish a Canteen session.');
  }

  cacheToken(body.data.canteen_token, baseToken);
  if (body.data.user) {
    localStorage.setItem(CANTEEN_USER_KEY, JSON.stringify(body.data.user));
  }
  return body.data.canteen_token;
}

export async function getCanteenToken(): Promise<string> {
  const cached = readCachedToken();
  if (cached) return cached;

  if (!inFlight) {
    inFlight = resolveToken().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

// Used by the canteen staff direct-login flow, where the login response
// already hands us a ready-to-use canteen_token — no exchange needed.
export function setCanteenSession(canteenToken: string, user: CanteenPlatformUser): void {
  cacheToken(canteenToken, canteenToken);
  localStorage.setItem(CANTEEN_USER_KEY, JSON.stringify(user));
}

export function clearCanteenSession(): void {
  localStorage.removeItem(CANTEEN_TOKEN_KEY);
  localStorage.removeItem(CANTEEN_TOKEN_SOURCE_KEY);
  localStorage.removeItem(CANTEEN_USER_KEY);
}

export function isCanteenAuthenticated(): boolean {
  return readCachedToken() !== null;
}

export function getCachedCanteenUser(): CanteenPlatformUser | null {
  if (!readCachedToken()) return null;
  const raw = localStorage.getItem(CANTEEN_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CanteenPlatformUser;
  } catch {
    return null;
  }
}

export function getCachedIsCanteenInstituteAdmin(): boolean {
  const token = readCachedToken();
  if (!token) return false;
  return decodeToken(token)?.is_institute_admin === true;
}
