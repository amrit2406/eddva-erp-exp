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
