import axiosInstance from '../../../lib/axios';
import type { GenericRecord, ListParams, ListResult, Pagination, RecordResult } from '../types/profile.types';
import type { MatchUpdateData } from '../types/mentorship.types';

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
    const rows = ['items', 'rows', 'data', 'matches'].map((key) => payload[key]).find(Array.isArray);
    return {
      data: (rows as T[] | undefined) ?? [],
      pagination: (body.pagination ?? payload.pagination) as Pagination | undefined,
    };
  }
  return { data: [] };
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

function unwrapItem<T>(body: { data?: unknown }): T {
  return (body.data ?? body) as T;
}

export async function getMentorshipMatches(params: ListParams = {}): Promise<ListResult<GenericRecord>> {
  const response = await axiosInstance.get('/alumni/mentorship-matches', { params });
  return unwrapList(response.data);
}

export async function getMentorshipMatch(id: string | number): Promise<GenericRecord> {
  const response = await axiosInstance.get(`/alumni/mentorship-matches/${id}`);
  return unwrapItem<GenericRecord>(response.data);
}

export async function updateMentorshipMatch(id: string | number, data: MatchUpdateData): Promise<GenericRecord> {
  const trimmedReason = data.reason.trim();
  const response = await axiosInstance.patch(`/alumni/mentorship-matches/${id}`, {
    status: data.status,
    ...(trimmedReason ? { reason: trimmedReason } : {}),
  });
  return unwrapItem<GenericRecord>(response.data);
}

export async function getMentorshipMatchHistory(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/mentorship-matches/${id}/history`, { params });
  return unwrapRecord(response.data);
}
