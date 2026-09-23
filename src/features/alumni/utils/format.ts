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

export function formatValue(_key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string' && ISO_DATE.test(value)) return formatDateTime(value);
  return String(value);
}

const PHOTO_KEYS = [
  'photo_url',
  'photoUrl',
  'avatar_url',
  'avatarUrl',
  'image_url',
  'imageUrl',
  'picture_url',
  'pictureUrl',
  'profile_photo_url',
  'url',
];

// The backend's field for an uploaded photo isn't confirmed (it may not be
// "photo_url"), so this checks the common spellings, including one level of
// nesting (e.g. { photo: { url } }).
export function pickPhotoUrl(record: Record<string, unknown> | null | undefined): string | null {
  if (!record) return null;
  for (const key of PHOTO_KEYS) {
    const value = record[key];
    if (typeof value === 'string' && value) return value;
  }
  for (const key of ['photo', 'avatar', 'picture', 'image']) {
    const nested = record[key];
    if (typeof nested === 'string' && nested) return nested;
    if (nested && typeof nested === 'object') {
      const url = pickPhotoUrl(nested as Record<string, unknown>);
      if (url) return url;
    }
  }
  return null;
}

export function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function isPrimitive(value: unknown): value is string | number | boolean | null {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Lifts primitives out of one level of nested objects (e.g. profile.city ->
// profile_city) so generic tables and tiles can show them.
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
