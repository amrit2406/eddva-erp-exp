import axiosInstance from '../../../lib/axios';
import type { GenericRecord, ListParams, ListResult, Pagination, RecordResult } from '../types/profile.types';

export interface EventPaymentPayload {
  amount: number;
  payment_mode: string;
  transaction_ref: string;
  paid_at: string;
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
    const rows = ['items', 'rows', 'data', 'registrations'].map((key) => payload[key]).find(Array.isArray);
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
    const rows = ['items', 'rows', 'data', 'payments'].map((key) => payload[key]).find(Array.isArray);
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

export async function getEventRegistrations(params: ListParams = {}): Promise<ListResult<GenericRecord>> {
  const response = await axiosInstance.get('/alumni/event-registrations', { params });
  return unwrapList(response.data);
}

export async function getEventRegistration(id: string | number): Promise<GenericRecord> {
  const response = await axiosInstance.get(`/alumni/event-registrations/${id}`);
  return unwrapItem<GenericRecord>(response.data);
}

export async function getRegistrationPayments(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/event-registrations/${id}/payment`, { params });
  return unwrapRecord(response.data);
}

export async function recordRegistrationPayment(id: string | number, data: EventPaymentPayload): Promise<GenericRecord> {
  const response = await axiosInstance.post(`/alumni/event-registrations/${id}/payment`, {
    amount: Number(data.amount),
    payment_mode: data.payment_mode,
    transaction_ref: data.transaction_ref.trim(),
    paid_at: data.paid_at,
  });
  return unwrapItem<GenericRecord>(response.data);
}
