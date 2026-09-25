export type Scalar = string | number | boolean | null;

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isScalar(value: unknown): value is Scalar {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

// "walk_in" / "seatsFilled" -> "Walk in" / "Seats filled".
export function sentenceCase(value: string): string {
  const spaced = value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/;
const SNAKE_CASE = /^[a-z]+(_[a-z]+)+$/;

// Any value -> display text. Nested values are summarised, never dumped in full.
export function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string') {
    if (ISO_DATE.test(value)) return value.includes('T') ? new Date(value).toLocaleString() : new Date(value).toLocaleDateString();
    return SNAKE_CASE.test(value) ? sentenceCase(value) : value;
  }
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? '' : 's'}`;
  if (isPlainObject(value)) {
    const label = value.name ?? value.label ?? value.title;
    if (typeof label === 'string') return label;
    const text = JSON.stringify(value);
    return text.length > 60 ? `${text.slice(0, 57)}...` : text;
  }
  return String(value);
}
