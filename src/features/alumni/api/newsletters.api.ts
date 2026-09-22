import axiosInstance from '../../../lib/axios';
import type { GenericRecord, ListParams, ListResult, Pagination, RecordResult } from '../types/profile.types';
import type { Newsletter, NewsletterFormData, TargetSegment } from '../types/newsletters.types';

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
    const rows = ['items', 'rows', 'data', 'newsletters'].map((key) => payload[key]).find(Array.isArray);
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
    const rows = ['items', 'rows', 'data', 'recipients'].map((key) => payload[key]).find(Array.isArray);
    const pagination = (body.pagination ?? payload.pagination) as Pagination | undefined;
    if (rows) return { data: rows as GenericRecord[], pagination };
    const { pagination: _pagination, ...rest } = payload;
    void _pagination;
    return { data: rest, pagination };
  }
  return { data: [] };
}

function unwrapItem<T>(body: { data?: unknown }): T {
  return (body.data ?? body) as T;
}

function normalizeNewsletter(raw: GenericRecord): Newsletter {
  return { ...raw, newsletter_id: Number(raw.newsletter_id ?? raw.id) } as unknown as Newsletter;
}

function toNewsletterPayload(data: NewsletterFormData) {
  return { title: data.title.trim(), content: data.content.trim(), target_segment: data.target_segment };
}

export async function getNewsletters(params: ListParams = {}): Promise<ListResult<Newsletter>> {
  const response = await axiosInstance.get('/alumni/newsletters', { params });
  const result = unwrapList<GenericRecord>(response.data);
  return { data: result.data.map(normalizeNewsletter), pagination: result.pagination };
}

export async function getNewsletter(id: string | number): Promise<Newsletter> {
  const response = await axiosInstance.get(`/alumni/newsletters/${id}`);
  return normalizeNewsletter(unwrapItem<GenericRecord>(response.data));
}

export async function createNewsletter(data: NewsletterFormData): Promise<Newsletter> {
  const response = await axiosInstance.post('/alumni/newsletters', toNewsletterPayload(data));
  return normalizeNewsletter(unwrapItem<GenericRecord>(response.data));
}

export async function updateNewsletter(id: string | number, data: NewsletterFormData): Promise<Newsletter> {
  const response = await axiosInstance.patch(`/alumni/newsletters/${id}`, toNewsletterPayload(data));
  return normalizeNewsletter(unwrapItem<GenericRecord>(response.data));
}

export async function deleteNewsletter(id: string | number): Promise<void> {
  await axiosInstance.delete(`/alumni/newsletters/${id}`);
}

export async function previewSegment(targetSegment: TargetSegment): Promise<RecordResult> {
  const response = await axiosInstance.post('/alumni/newsletters/segment-preview', { target_segment: targetSegment });
  return unwrapRecord(response.data);
}

export async function getPreviewRecipients(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/newsletters/${id}/preview-recipients`, { params });
  return unwrapRecord(response.data);
}

export async function sendNewsletter(id: string | number, channels: string[]): Promise<void> {
  await axiosInstance.post(`/alumni/newsletters/${id}/send`, { channels });
}

export async function getNewsletterStats(id: string | number): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/newsletters/${id}/stats`);
  return unwrapRecord(response.data);
}
