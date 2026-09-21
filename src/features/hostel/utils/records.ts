import { isPlainObject } from './format';
import type { GenericRecord } from '../types/hostel.types';

function pick(row: GenericRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'number' || (typeof value === 'string' && value !== '')) return String(value);
  }
  return undefined;
}

// First usable id among the given keys, falling back to a plain `id`.
export function recordId(row: GenericRecord, ...keys: string[]): string | undefined {
  return pick(row, [...keys, 'id']);
}

// The id of a related record, either flat on the row (resident_id) or inside a
// nested object (resident: { resident_id | id }).
export function relatedId(row: GenericRecord, nestedKey: string, idKey: string): string | undefined {
  const direct = pick(row, [idKey]);
  if (direct) return direct;
  const nested = row[nestedKey];
  return isPlainObject(nested) ? pick(nested, [idKey, 'id']) : undefined;
}

export function recordStatus(row: GenericRecord): string | null {
  return typeof row.status === 'string' && row.status ? row.status.toLowerCase() : null;
}
