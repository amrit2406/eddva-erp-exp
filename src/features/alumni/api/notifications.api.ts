import axiosInstance from '../../../lib/axios';
import type { GenericRecord, ListParams, RecordResult, Pagination } from '../types/profile.types';

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
    const rows = ['items', 'rows', 'data', 'notifications'].map((key) => payload[key]).find(Array.isArray);
    return { data: (rows as GenericRecord[] | undefined) ?? [], pagination: body.pagination as Pagination | undefined };
  }
  return { data: [] };
}

export async function getNotifications(params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/alumni/notifications', { params });
  return unwrapRecord(response.data);
}
