import { formatDate, formatDateTime } from './format';

export type ReportKey = 'funnel' | 'seats' | 'offers' | 'documents' | 'admissions';

export const REPORTS: { key: ReportKey; label: string; description: string }[] = [
  { key: 'funnel', label: 'Funnel', description: 'How applications move through each admission stage' },
  { key: 'seats', label: 'Seats', description: 'Seat availability and fill by program' },
  { key: 'offers', label: 'Offers', description: 'Offers issued and how they were answered' },
  { key: 'documents', label: 'Documents', description: 'Document collection and verification' },
  { key: 'admissions', label: 'Admissions', description: 'Confirmed admissions' },
];

export function isReportKey(value: string | null): value is ReportKey {
  return REPORTS.some((report) => report.key === value);
}

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
// Timestamps show the time of day only when asked (logs need it, reports don't).
export function formatCell(value: unknown, withTime = false): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string') {
    if (ISO_DATE.test(value)) return withTime && value.includes('T') ? formatDateTime(value) : formatDate(value);
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

export interface FunnelStage {
  label: string;
  value: number;
}

const LABEL_KEYS = ['stage', 'name', 'label', 'status', 'step'];
const VALUE_KEYS = ['count', 'total', 'value', 'applications', 'number'];

function stagesFromRows(rows: unknown[]): FunnelStage[] | null {
  const objects = rows.filter(isPlainObject);
  if (objects.length < 2 || objects.length !== rows.length) return null;
  const first = objects[0];
  const keys = Object.keys(first);
  const labelKey = LABEL_KEYS.find((key) => typeof first[key] === 'string') ?? keys.find((key) => typeof first[key] === 'string');
  const valueKey =
    VALUE_KEYS.find((key) => typeof first[key] === 'number') ??
    keys.find((key) => typeof first[key] === 'number' && !/id$/i.test(key));
  if (!labelKey || !valueKey) return null;
  const stages = objects.map((row) => ({ label: sentenceCase(String(row[labelKey])), value: Number(row[valueKey]) }));
  return stages.every((stage) => Number.isFinite(stage.value) && stage.value >= 0) ? stages : null;
}

// A funnel is an ordered list of (stage, count). The payload may be an array of
// rows, an object holding one, or an object of stage -> count. Returns null when
// it doesn't look like that, so the page falls back to the generic view.
export function toFunnelStages(data: unknown): FunnelStage[] | null {
  if (Array.isArray(data)) return stagesFromRows(data);
  if (!isPlainObject(data)) return null;

  const rows = Object.values(data).find(
    (value) => Array.isArray(value) && value.length > 0 && value.every(isPlainObject)
  );
  if (Array.isArray(rows)) return stagesFromRows(rows);

  const entries = Object.entries(data);
  if (entries.length >= 2 && entries.every(([, value]) => typeof value === 'number' && value >= 0)) {
    return entries.map(([key, value]) => ({ label: sentenceCase(key), value: value as number }));
  }
  return null;
}
