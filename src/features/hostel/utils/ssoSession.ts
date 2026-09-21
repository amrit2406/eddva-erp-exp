import { config } from '../../../config/env';

const HOSTEL_TOKEN_KEY = 'hostel_token';
const HOSTEL_TOKEN_SOURCE_KEY = 'hostel_token_source';
const HOSTEL_USER_KEY = 'hostel_user';
const EXPIRY_SKEW_MS = 60_000;

interface DecodedTokenPayload {
  exp?: number;
  id?: string;
  institute_id?: string;
  user_name?: string;
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

function isHostelSessionPayload(payload: DecodedTokenPayload | null): boolean {
  return !!payload && typeof payload.institute_id === 'string' && typeof payload.user_name === 'string';
}

function getBaseToken(): string {
  return config.apiToken?.trim() || localStorage.getItem('accessToken') || '';
}

function readCachedToken(): string | null {
  const cachedToken = localStorage.getItem(HOSTEL_TOKEN_KEY);
  const cachedSource = localStorage.getItem(HOSTEL_TOKEN_SOURCE_KEY);
  if (!cachedToken || !cachedSource) return null;

  const baseToken = getBaseToken();
  const isDirectStaffSession = cachedSource === cachedToken;
  if (isDirectStaffSession && config.apiToken?.trim()) return null;
  if (!isDirectStaffSession && cachedSource !== baseToken) return null;

  if (isExpired(decodeToken(cachedToken))) return null;
  return cachedToken;
}

function cacheToken(hostelToken: string, sourceToken: string): void {
  localStorage.setItem(HOSTEL_TOKEN_KEY, hostelToken);
  localStorage.setItem(HOSTEL_TOKEN_SOURCE_KEY, sourceToken);
}

let inFlight: Promise<string> | null = null;

async function resolveToken(): Promise<string> {
  const cached = readCachedToken();
  if (cached) return cached;

  const baseToken = getBaseToken();
  if (!baseToken) {
    throw new Error('No session token available to sign in to Hostel.');
  }

  const basePayload = decodeToken(baseToken);
  if (isHostelSessionPayload(basePayload) && !isExpired(basePayload)) {
    cacheToken(baseToken, baseToken);
    return baseToken;
  }

  const url = `${config.apiUrl}/hostel/auth/sso?token=${encodeURIComponent(baseToken)}`;
  const response = await fetch(url);
  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success || !body?.data?.hostel_token) {
    throw new Error(body?.error?.message || 'Failed to establish a Hostel session.');
  }

  cacheToken(body.data.hostel_token, baseToken);
  if (body.data.user) {
    localStorage.setItem(HOSTEL_USER_KEY, JSON.stringify(body.data.user));
  }
  return body.data.hostel_token;
}

export async function getHostelToken(): Promise<string> {
  const cached = readCachedToken();
  if (cached) return cached;

  if (!inFlight) {
    inFlight = resolveToken().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

export function setHostelSession(hostelToken: string, user: any): void {
  cacheToken(hostelToken, hostelToken);
  localStorage.setItem(HOSTEL_USER_KEY, JSON.stringify(user));
}

export function clearHostelSession(): void {
  localStorage.removeItem(HOSTEL_TOKEN_KEY);
  localStorage.removeItem(HOSTEL_TOKEN_SOURCE_KEY);
  localStorage.removeItem(HOSTEL_USER_KEY);
}

export function isHostelAuthenticated(): boolean {
  return readCachedToken() !== null;
}

export function getCachedHostelUser(): any | null {
  if (!readCachedToken()) return null;
  const raw = localStorage.getItem(HOSTEL_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getCachedIsHostelInstituteAdmin(): boolean {
  const token = readCachedToken();
  if (!token) return false;
  return decodeToken(token)?.is_institute_admin === true;
}
