import axiosInstance from '../../../lib/axios';
import type { GenericRecord, ListParams, ListResult, Pagination } from '../types/profile.types';

export interface CommunicationLogUpdateData {
  status: string;
  failure_reason?: string;
}

function isRecord(value: unknown): value is GenericRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapList<T = GenericRecord>(body: unknown): ListResult<T> {
  if (!isRecord(body)) return { data: [] };
  const payload = body.data ?? body;
  if (Array.isArray(payload)) {
    return { data: payload as T[], pagination: body.pagination as Pagination | undefined };
  }
  if (isRecord(payload)) {
    const rows = ['items', 'rows', 'data', 'logs'].map((key) => payload[key]).find(Array.isArray);
    return {
      data: (rows as T[] | undefined) ?? [],
      pagination: (body.pagination ?? payload.pagination) as Pagination | undefined,
    };
  }
  return { data: [] };
}

function unwrapItem<T>(body: { data?: unknown }): T {
  return (body.data ?? body) as T;
}

export async function getCommunicationLogs(params: ListParams = {}): Promise<ListResult<GenericRecord>> {
  const response = await axiosInstance.get('/alumni/communication-logs', { params });
  return unwrapList(response.data);
}

export async function updateCommunicationLog(id: string | number, data: CommunicationLogUpdateData): Promise<GenericRecord> {
  const trimmedReason = data.failure_reason?.trim();
  const response = await axiosInstance.patch(`/alumni/communication-logs/${id}`, {
    status: data.status,
    ...(trimmedReason ? { failure_reason: trimmedReason } : {}),
  });
  return unwrapItem<GenericRecord>(response.data);
}
