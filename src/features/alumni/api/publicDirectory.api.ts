import axiosInstance from '../../../lib/axios';
import type { GenericRecord, ListParams, Pagination, RecordResult } from '../types/profile.types';

function isRecord(value: unknown): value is GenericRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapRecord(body: unknown): RecordResult {
  if (!isRecord(body)) return { data: [] };
  const payload = body.data ?? body;
  if (Array.isArray(payload)) {
    return { data: payload as GenericRecord[], pagination: body.pagination as Pagination | undefined };
  }
  if (isRecord(payload)) {
    const rows = ['items', 'rows', 'data'].map((key) => payload[key]).find(Array.isArray);
    return { data: (rows as GenericRecord[] | undefined) ?? [], pagination: body.pagination as Pagination | undefined };
  }
  return { data: [] };
}

// Publicly readable — no permission is required to view it, and the request
// still goes out even when nobody is signed in (see lib/axios.ts).
export async function getPublicDirectory(params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/alumni/public/directory', { params });
  return unwrapRecord(response.data);
}
