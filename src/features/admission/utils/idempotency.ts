// One key per payment form: reused on retries so a double click or a retry after
// a timeout can't record the same payment twice. crypto.randomUUID needs a secure
// context, so fall back for plain-http dev hosts.
export function newIdempotencyKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
