export function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T|$)/;
const MIDNIGHT_UTC = /T00:00(:00(\.0+)?)?(Z|\+00:00)?$/;

// Date-only values (and midnight timestamps, which are really dates) show as a
// date; anything with a time of day shows date and time.
export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const dateOnly = !value.includes('T') || MIDNIGHT_UTC.test(value);
  return dateOnly ? date.toLocaleDateString() : date.toLocaleString();
}

export function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    return /percent|pct/i.test(key) ? `${value}%` : String(value);
  }
  if (typeof value === 'string' && ISO_DATE.test(value)) return formatDateTime(value);
  return String(value);
}

export function isPrimitive(value: unknown): value is string | number | boolean | null {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Lifts primitives out of one level of nested objects (e.g. student.name ->
// student_name) so generic tables and tiles can show them.
export function flattenRecord(record: Record<string, unknown>): Record<string, unknown> {
  const flat: Record<string, unknown> = {};
  Object.entries(record).forEach(([key, value]) => {
    if (isPlainObject(value)) {
      Object.entries(value).forEach(([childKey, childValue]) => {
        if (isPrimitive(childValue)) flat[`${key}_${childKey}`] = childValue;
      });
    } else {
      flat[key] = value;
    }
  });
  return flat;
}
