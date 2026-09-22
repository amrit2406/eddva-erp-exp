import axiosInstance from '../../../lib/axios';
import type { GenericRecord, ListParams, ListResult, Pagination, RecordResult } from '../types/profile.types';
import type { JobApplicationPayload, JobFormData, JobPosting } from '../types/jobs.types';

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
    const rows = ['items', 'rows', 'data', 'jobs'].map((key) => payload[key]).find(Array.isArray);
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
    const rows = ['items', 'rows', 'data', 'applications'].map((key) => payload[key]).find(Array.isArray);
    return { data: (rows as GenericRecord[] | undefined) ?? [], pagination: body.pagination as Pagination | undefined };
  }
  return { data: [] };
}

function unwrapItem<T>(body: { data?: unknown }): T {
  return (body.data ?? body) as T;
}

function normalizeJob(raw: GenericRecord): JobPosting {
  return { ...raw, job_id: Number(raw.job_id ?? raw.id) } as unknown as JobPosting;
}

function toJobPayload(data: JobFormData) {
  const payload: Record<string, unknown> = {
    title: data.title.trim(),
    company: data.company.trim(),
    description: data.description.trim(),
    location: data.location.trim(),
    job_type: data.job_type.trim(),
    industry: data.industry.trim(),
  };
  if (data.expiry_date) {
    const date = new Date(data.expiry_date);
    payload.expiry_date = Number.isNaN(date.getTime()) ? data.expiry_date : date.toISOString();
  }
  if (data.posted_by_alumni_id.trim()) payload.posted_by_alumni_id = Number(data.posted_by_alumni_id);
  return payload;
}

export async function getJobs(params: ListParams = {}): Promise<ListResult<JobPosting>> {
  const response = await axiosInstance.get('/alumni/jobs', { params });
  const result = unwrapList<GenericRecord>(response.data);
  return { data: result.data.map(normalizeJob), pagination: result.pagination };
}

export async function getJob(id: string | number): Promise<JobPosting> {
  const response = await axiosInstance.get(`/alumni/jobs/${id}`);
  return normalizeJob(unwrapItem<GenericRecord>(response.data));
}

export async function createJob(data: JobFormData): Promise<JobPosting> {
  const response = await axiosInstance.post('/alumni/jobs', toJobPayload(data));
  return normalizeJob(unwrapItem<GenericRecord>(response.data));
}

export async function updateJob(id: string | number, data: JobFormData): Promise<JobPosting> {
  const response = await axiosInstance.patch(`/alumni/jobs/${id}`, toJobPayload(data));
  return normalizeJob(unwrapItem<GenericRecord>(response.data));
}

export async function deleteJob(id: string | number): Promise<void> {
  await axiosInstance.delete(`/alumni/jobs/${id}`);
}

export async function closeJob(id: string | number): Promise<void> {
  await axiosInstance.post(`/alumni/jobs/${id}/close`);
}

export async function applyToJob(id: string | number, data: JobApplicationPayload): Promise<GenericRecord> {
  const response = await axiosInstance.post(`/alumni/jobs/${id}/apply`, {
    resume_url: data.resume_url.trim(),
    cover_note: data.cover_note.trim(),
    alumni_id: data.alumni_id,
  });
  return unwrapItem<GenericRecord>(response.data);
}

export async function getJobApplicationsForJob(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/jobs/${id}/applications`, { params });
  return unwrapRecord(response.data);
}
