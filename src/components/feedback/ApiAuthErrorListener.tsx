import { useEffect, useRef } from 'react';
import { useToast } from '../../hooks/useToast';
import { API_AUTH_ERROR_EVENT, type ApiAuthErrorDetail } from '../../lib/apiAuthEvents';

const DEDUPE_WINDOW_MS = 3000;

function buildMessage({ status, message }: ApiAuthErrorDetail): string {
  if (status === 403) {
    return message
      ? `Access denied: ${message}`
      : "Access denied: you don't have permission to do this.";
  }
  return message
    ? `Unauthorized: ${message}`
    : 'Unauthorized: your session is missing or has expired. Please sign in again.';
}

export default function ApiAuthErrorListener() {
  const { toast } = useToast();
  const lastShown = useRef<{ message: string; at: number } | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const message = buildMessage((event as CustomEvent<ApiAuthErrorDetail>).detail);
      const now = Date.now();
      // A page often fires several requests at once; show the same error once.
      if (lastShown.current?.message === message && now - lastShown.current.at < DEDUPE_WINDOW_MS) {
        return;
      }
      lastShown.current = { message, at: now };
      toast.error(message);
    };

    window.addEventListener(API_AUTH_ERROR_EVENT, handler);
    return () => window.removeEventListener(API_AUTH_ERROR_EVENT, handler);
  }, [toast]);

  return null;
}
