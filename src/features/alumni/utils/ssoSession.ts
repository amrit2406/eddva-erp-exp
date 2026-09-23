import { config } from '../../../config/env';
import type { AlumniPlatformUser } from '../types/alumni.types';

const ALUMNI_TOKEN_KEY = 'alumni_token';
const ALUMNI_TOKEN_SOURCE_KEY = 'alumni_token_source';
const ALUMNI_USER_KEY = 'alumni_user';
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

// An Alumni Platform session token (SSO exchange, or a test token in
// VITE_API_TOKEN) carries institute_id + user_name. A raw ERP login token
// uses instituteId/email instead, so it can't be mistaken for one.
function isAlumniSessionPayload(payload: DecodedTokenPayload | null): boolean {
  return !!payload && typeof payload.institute_id === 'string' && typeof payload.user_name === 'string';
}

function getBaseToken(): string {
  return config.apiToken?.trim() || localStorage.getItem('accessToken') || '';
}

// Cached token is only valid if it was derived from the base token that's
// currently configured — otherwise swapping VITE_API_TOKEN (e.g. admin ->
// manager while testing) would keep serving the old role's stale session.
function readCachedToken(): string | null {
  const cachedToken = localStorage.getItem(ALUMNI_TOKEN_KEY);
  const cachedSource = localStorage.getItem(ALUMNI_TOKEN_SOURCE_KEY);
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

function cacheToken(alumniToken: string, sourceToken: string): void {
  localStorage.setItem(ALUMNI_TOKEN_KEY, alumniToken);
  localStorage.setItem(ALUMNI_TOKEN_SOURCE_KEY, sourceToken);
}

let inFlight: Promise<string> | null = null;

async function resolveToken(): Promise<string> {
  const cached = readCachedToken();
  if (cached) return cached;

  const baseToken = getBaseToken();
  if (!baseToken) {
    throw new Error('No session token available to sign in to Alumni.');
  }

  const basePayload = decodeToken(baseToken);
  if (isAlumniSessionPayload(basePayload) && !isExpired(basePayload)) {
    cacheToken(baseToken, baseToken);
    return baseToken;
  }

  // Otherwise this is a raw ERP login token — exchange it for a real
  // Alumni Platform session token.
  const url = `${config.apiUrl}/alumni/auth/sso?token=${encodeURIComponent(baseToken)}`;
  const response = await fetch(url);
  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success || !body?.data?.alumni_token) {
    throw new Error(body?.error?.message || 'Failed to establish an Alumni session.');
  }

  cacheToken(body.data.alumni_token, baseToken);
  if (body.data.user) {
    localStorage.setItem(ALUMNI_USER_KEY, JSON.stringify(body.data.user));
  }
  return body.data.alumni_token;
}

export async function getAlumniToken(): Promise<string> {
  const cached = readCachedToken();
  if (cached) return cached;

  if (!inFlight) {
    inFlight = resolveToken().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

export function setAlumniSession(alumniToken: string, user: AlumniPlatformUser): void {
  cacheToken(alumniToken, alumniToken);
  localStorage.setItem(ALUMNI_USER_KEY, JSON.stringify(user));
}

export function clearAlumniSession(): void {
  localStorage.removeItem(ALUMNI_TOKEN_KEY);
  localStorage.removeItem(ALUMNI_TOKEN_SOURCE_KEY);
  localStorage.removeItem(ALUMNI_USER_KEY);
}

export function isAlumniAuthenticated(): boolean {
  return readCachedToken() !== null;
}

export function getCachedAlumniUser(): AlumniPlatformUser | null {
  if (!readCachedToken()) return null;
  const raw = localStorage.getItem(ALUMNI_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AlumniPlatformUser;
  } catch {
    return null;
  }
}

export function getCachedIsAlumniInstituteAdmin(): boolean {
  const token = readCachedToken();
  if (!token) return false;
  return decodeToken(token)?.is_institute_admin === true;
}

function decodeInstituteId(token: string): string | null {
  const instituteId = decodeToken(token)?.institute_id;
  return typeof instituteId === 'string' ? instituteId : null;
}

// The Alumni session's own institute — needed for endpoints that are public
// (no auth required) and so can't derive it from a token server-side, like
// /alumni/public/directory. Resolves the token first (awaiting the SSO
// exchange if it hasn't happened yet) rather than trusting a cache that may
// not be warm yet.
export async function getAlumniInstituteId(): Promise<string | null> {
  try {
    return decodeInstituteId(await getAlumniToken());
  } catch {
    return null;
  }
}
