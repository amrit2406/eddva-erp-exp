/**
 * The front-office appointments API returns appointment_date/start_time/end_time as full
 * ISO datetime strings (e.g. "2026-09-01T09:00:00.000Z") even though it accepts plain
 * "YYYY-MM-DD" / "HH:mm" on write. These helpers extract the date/time parts directly from
 * the string instead of going through `new Date(...)` + local-timezone getters, which would
 * shift the value by a day/hour whenever the browser isn't running in UTC.
 */

export function toDateInputValue(value?: string | null): string {
  if (!value) return '';
  const datePart = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : '';
}

export function toTimeInputValue(value?: string | null): string {
  if (!value) return '';
  const match = value.match(/T(\d{2}):(\d{2})/);
  if (match) return `${match[1]}:${match[2]}`;
  return /^\d{2}:\d{2}/.test(value) ? value.slice(0, 5) : '';
}

export function formatDateDisplay(value?: string | null): string {
  const datePart = toDateInputValue(value);
  if (!datePart) return '—';
  const [year, month, day] = datePart.split('-');
  return `${month}/${day}/${year}`;
}
