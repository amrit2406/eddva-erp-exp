import axiosInstance from '../../../lib/axios';
import type { GenericRecord, ListParams, ListResult, Pagination } from '../types/profile.types';
import type { EmploymentEntry, EmploymentFormData } from '../types/engagement.types';

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
    const rows = ['items', 'rows', 'data'].map((key) => payload[key]).find(Array.isArray);
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

function normalizeEmployment(raw: GenericRecord): EmploymentEntry {
  return { ...raw, employment_id: Number(raw.employment_id ?? raw.id) } as unknown as EmploymentEntry;
}

function toEmploymentPayload(data: EmploymentFormData) {
  return {
    company: data.company.trim(),
    designation: data.designation.trim(),
    industry: data.industry.trim(),
    location: data.location.trim(),
    start_date: data.start_date,
    ...(data.end_date ? { end_date: data.end_date } : {}),
    is_current: data.is_current,
  };
}

export async function getEmploymentHistory(alumniId: string | number, params: ListParams = {}): Promise<ListResult<EmploymentEntry>> {
  const response = await axiosInstance.get(`/alumni/profiles/${alumniId}/employment`, { params });
  const result = unwrapList<GenericRecord>(response.data);
  return { data: result.data.map(normalizeEmployment), pagination: result.pagination };
}

export async function getCurrentEmployment(alumniId: string | number): Promise<EmploymentEntry | null> {
  try {
    const response = await axiosInstance.get(`/alumni/profiles/${alumniId}/employment/current`);
    const payload = unwrapItem<GenericRecord | null>(response.data);
    return payload ? normalizeEmployment(payload) : null;
  } catch (error) {
    if ((error as { response?: { status?: number } }).response?.status === 404) return null;
    throw error;
  }
}

export async function createEmployment(alumniId: string | number, data: EmploymentFormData): Promise<EmploymentEntry> {
  const response = await axiosInstance.post(`/alumni/profiles/${alumniId}/employment`, toEmploymentPayload(data));
  return normalizeEmployment(unwrapItem<GenericRecord>(response.data));
}

export async function updateEmployment(
  alumniId: string | number,
  employmentId: string | number,
  data: EmploymentFormData
): Promise<EmploymentEntry> {
  const response = await axiosInstance.patch(
    `/alumni/profiles/${alumniId}/employment/${employmentId}`,
    toEmploymentPayload(data)
  );
  return normalizeEmployment(unwrapItem<GenericRecord>(response.data));
}

export async function deleteEmployment(alumniId: string | number, employmentId: string | number): Promise<void> {
  await axiosInstance.delete(`/alumni/profiles/${alumniId}/employment/${employmentId}`);
}

export async function setCurrentEmployment(alumniId: string | number, employmentId: string | number): Promise<void> {
  await axiosInstance.post(`/alumni/profiles/${alumniId}/employment/${employmentId}/set-current`);
}
