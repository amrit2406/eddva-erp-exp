import { getBlockResidents, getResidents } from '../api/hostel.api';
import { flattenRecord } from './format';
import { relatedId } from './records';
import type { GenericRecord } from '../types/hostel.types';

export interface RollCallRow {
  id: number;
  name: string;
  admissionNo: string;
}

export interface RowsResult {
  rows: RollCallRow[];
  truncated: boolean;
}

// Residents are fetched as one generous page.
export const PAGE_LIMIT = 200;

// A block's residents come back in a shape that isn't fixed yet, so pull out
// whatever identifies the resident from each row.
function toRows(data: GenericRecord | GenericRecord[]): RollCallRow[] {
  const records = Array.isArray(data) ? data : ((Object.values(data).find(Array.isArray) as GenericRecord[]) ?? []);
  return records.flatMap((record) => {
    const id = Number(relatedId(record, 'resident', 'resident_id'));
    if (!id) return [];
    const flat = flattenRecord(record);
    return [
      {
        id,
        name: String(flat.student_name ?? flat.resident_student_name ?? flat.name ?? `Resident #${id}`),
        admissionNo: String(flat.admission_no ?? flat.resident_admission_no ?? ''),
      },
    ];
  });
}

// The residents to take a roll call for: one block's, or everyone when no block is given.
export async function fetchRows(blockId: string): Promise<RowsResult> {
  if (!blockId) {
    const result = await getResidents({ limit: PAGE_LIMIT });
    return {
      rows: result.data.map((resident) => ({
        id: resident.resident_id,
        name: resident.student_name,
        admissionNo: resident.admission_no,
      })),
      truncated: (result.pagination?.total ?? 0) > result.data.length,
    };
  }
  const result = await getBlockResidents(blockId, { limit: PAGE_LIMIT });
  return { rows: toRows(result.data), truncated: (result.pagination?.total ?? 0) > PAGE_LIMIT };
}
