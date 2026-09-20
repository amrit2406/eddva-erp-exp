export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// API returns ISO timestamps; <input type="date"> wants YYYY-MM-DD.
export function toDateInput(iso?: string | null): string {
  return iso ? iso.slice(0, 10) : '';
}

// "walk_in" -> "walk in" (pair with the `capitalize` class).
export function formatLabel(value?: string | null): string {
  return value ? value.replace(/_/g, ' ') : '—';
}

export function todayInput(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatFileSize(bytes?: number | null): string {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Amounts are assumed to be rupees. Accepts numeric strings (Decimal columns).
export function formatCurrency(amount?: number | string | null): string {
  const value = Number(amount);
  if (amount === null || amount === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

// ISO timestamp -> <input type="datetime-local"> value, in local time.
export function toDateTimeInput(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// <input type="datetime-local"> value (local time) -> ISO timestamp.
export function fromDateTimeInput(value: string): string {
  return new Date(value).toISOString();
}
