import { flattenRecord, formatValue } from './format';
import { recordId } from './records';
import type { GenericRecord } from '../types/hostel.types';

// RBAC resource the discipline endpoints are checked against.
export const DISCIPLINE_RESOURCE = 'discipline_records';

// Free-text fields in the API, so these are suggestions rather than fixed lists.
export const CATEGORY_SUGGESTIONS = [
  'curfew_violation',
  'damage_to_property',
  'noise',
  'unauthorized_visitor',
  'ragging',
  'other',
];
export const ACTION_SUGGESTIONS = ['warning', 'fine', 'parent_informed', 'suspension', 'none'];

export function suggestionLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

export interface GatePassOption {
  id: string;
  label: string;
}

// A resident's gate passes come back in a shape that isn't fixed yet, so pull an
// id and a readable label out of whatever rows are there.
export function toGatePassOptions(data: GenericRecord | GenericRecord[]): GatePassOption[] {
  const rows = Array.isArray(data) ? data : ((Object.values(data).find(Array.isArray) as GenericRecord[]) ?? []);
  return rows.flatMap((row) => {
    const id = recordId(row, 'gate_pass_id', 'pass_id');
    if (!id) return [];
    const flat = flattenRecord(row);
    const parts = [
      typeof flat.pass_no === 'string' && flat.pass_no ? flat.pass_no : `Pass #${id}`,
      typeof flat.pass_type === 'string' ? flat.pass_type.replace(/_/g, ' ') : '',
      flat.requested_out_at ? formatValue('requested_out_at', flat.requested_out_at) : '',
    ].filter(Boolean);
    return [{ id, label: parts.join(' · ') }];
  });
}
