import axiosInstance from '../../../lib/axios';
import { extensionForMime, saveBlob } from '../utils/download';
import type { GenericRecord, ListParams, ListResult, Pagination, RecordResult } from '../types/profile.types';
import type { DonationConfirmPayload, DonationFormData } from '../types/fundraising.types';

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
    const rows = ['items', 'rows', 'data', 'donations'].map((key) => payload[key]).find(Array.isArray);
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

function toDonationPayload(data: DonationFormData) {
  const payload: Record<string, unknown> = {
    alumni_id: Number(data.alumni_id),
    campaign_id: Number(data.campaign_id),
    amount: Number(data.amount),
    payment_mode: data.payment_mode,
    transaction_ref: data.transaction_ref.trim(),
    is_anonymous: data.is_anonymous,
    mark_received: data.mark_received,
  };
  if (data.notes.trim()) payload.notes = data.notes.trim();
  if (data.mark_received && data.received_on) payload.received_on = data.received_on;
  return payload;
}

export async function getDonations(params: ListParams = {}): Promise<ListResult<GenericRecord>> {
  const response = await axiosInstance.get('/alumni/donations', { params });
  return unwrapList(response.data);
}

export async function getDonation(id: string | number): Promise<GenericRecord> {
  const response = await axiosInstance.get(`/alumni/donations/${id}`);
  return unwrapItem<GenericRecord>(response.data);
}

export async function createDonation(data: DonationFormData): Promise<GenericRecord> {
  const response = await axiosInstance.post('/alumni/donations', toDonationPayload(data));
  return unwrapItem<GenericRecord>(response.data);
}

export async function confirmDonation(id: string | number, data: DonationConfirmPayload): Promise<GenericRecord> {
  const response = await axiosInstance.post(`/alumni/donations/${id}/confirm`, {
    transaction_ref: data.transaction_ref.trim(),
    payment_mode: data.payment_mode,
    received_on: data.received_on,
  });
  return unwrapItem<GenericRecord>(response.data);
}

export async function failDonation(id: string | number, reason: string): Promise<void> {
  await axiosInstance.post(`/alumni/donations/${id}/fail`, { reason: reason.trim() });
}

export async function cancelDonation(id: string | number, reason: string): Promise<void> {
  await axiosInstance.post(`/alumni/donations/${id}/cancel`, { reason: reason.trim() });
}

export async function reverseDonation(id: string | number, reason: string): Promise<void> {
  await axiosInstance.post(`/alumni/donations/${id}/reverse`, { reason: reason.trim() });
}

// The receipt format isn't documented, so this saves whatever content type
// the server answers with (most likely a PDF).
export async function downloadDonationReceipt(id: string | number): Promise<void> {
  const response = await axiosInstance.get(`/alumni/donations/${id}/receipt`, { responseType: 'blob' });
  const contentType = String(response.headers['content-type'] || 'application/pdf');
  const extension = extensionForMime(contentType) || 'pdf';
  saveBlob(new Blob([response.data], { type: contentType }), `donation-receipt-${id}.${extension}`);
}

export async function getProfileDonationHistory(alumniId: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/profiles/${alumniId}/donation-history`, { params });
  return unwrapRecord(response.data);
}
