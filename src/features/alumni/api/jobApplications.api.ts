import axiosInstance from '../../../lib/axios';
import type { GenericRecord, ListParams, ListResult, Pagination, RecordResult } from '../types/profile.types';
import type { JobApplicationUpdateData } from '../types/jobs.types';

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
    const rows = ['items', 'rows', 'data', 'applications'].map((key) => payload[key]).find(Array.isArray);
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

export async function getJobApplications(params: ListParams = {}): Promise<ListResult<GenericRecord>> {
  const response = await axiosInstance.get('/alumni/job-applications', { params });
  return unwrapList(response.data);
}

export async function getJobApplication(id: string | number): Promise<GenericRecord> {
  const response = await axiosInstance.get(`/alumni/job-applications/${id}`);
  return unwrapItem<GenericRecord>(response.data);
}

// The PATCH body isn't documented; this sends status plus an optional note.
export async function updateJobApplication(id: string | number, data: JobApplicationUpdateData): Promise<GenericRecord> {
  const trimmedNotes = data.notes?.trim();
  const response = await axiosInstance.patch(`/alumni/job-applications/${id}`, {
    status: data.status,
    ...(trimmedNotes ? { notes: trimmedNotes } : {}),
  });
  return unwrapItem<GenericRecord>(response.data);
}

export async function withdrawJobApplication(id: string | number): Promise<void> {
  await axiosInstance.post(`/alumni/job-applications/${id}/withdraw`);
}

export async function getJobApplicationHistory(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/job-applications/${id}/history`, { params });
  return unwrapRecord(response.data);
}

export async function getJobApplicationResume(id: string | number): Promise<GenericRecord> {
  const response = await axiosInstance.get(`/alumni/job-applications/${id}/resume`);
  return unwrapItem<GenericRecord>(response.data);
}

export async function uploadJobApplicationResume(id: string | number, file: File): Promise<GenericRecord> {
  const body = new FormData();
  body.append('resume', file);
  const response = await axiosInstance.post(`/alumni/job-applications/${id}/resume`, body);
  return unwrapItem<GenericRecord>(response.data);
}
