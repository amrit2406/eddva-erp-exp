import axiosInstance from '../../../lib/axios';
import type { GenericRecord, ListParams, ListResult, Pagination, RecordResult } from '../types/profile.types';
import type { AlumniEvent, AttendeeStatusRecord, EventFormData } from '../types/engagement.types';

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
    const rows = ['items', 'rows', 'data', 'events'].map((key) => payload[key]).find(Array.isArray);
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
    const rows = ['items', 'rows', 'data', 'attendees'].map((key) => payload[key]).find(Array.isArray);
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

function normalizeEvent(raw: GenericRecord): AlumniEvent {
  return { ...raw, event_id: Number(raw.event_id ?? raw.id) } as unknown as AlumniEvent;
}

function toIso(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toEventPayload(data: EventFormData) {
  const payload: Record<string, unknown> = {
    title: data.title.trim(),
    description: data.description.trim(),
    event_type: data.event_type.trim(),
    mode: data.mode,
    event_date: toIso(data.event_date),
    is_paid: data.is_paid,
  };
  if (data.venue.trim()) payload.venue = data.venue.trim();
  if (data.online_link.trim()) payload.online_link = data.online_link.trim();
  if (data.ends_at) payload.ends_at = toIso(data.ends_at);
  if (data.registration_deadline) payload.registration_deadline = toIso(data.registration_deadline);
  if (data.max_capacity.trim()) payload.max_capacity = Number(data.max_capacity);
  if (data.is_paid && data.ticket_price.trim()) payload.ticket_price = Number(data.ticket_price);
  return payload;
}

export async function getEvents(params: ListParams = {}): Promise<ListResult<AlumniEvent>> {
  const response = await axiosInstance.get('/alumni/events', { params });
  const result = unwrapList<GenericRecord>(response.data);
  return { data: result.data.map(normalizeEvent), pagination: result.pagination };
}

export async function getEvent(id: string | number): Promise<AlumniEvent> {
  const response = await axiosInstance.get(`/alumni/events/${id}`);
  return normalizeEvent(unwrapItem<GenericRecord>(response.data));
}

export async function createEvent(data: EventFormData): Promise<AlumniEvent> {
  const response = await axiosInstance.post('/alumni/events', toEventPayload(data));
  return normalizeEvent(unwrapItem<GenericRecord>(response.data));
}

export async function updateEvent(id: string | number, data: EventFormData): Promise<AlumniEvent> {
  const response = await axiosInstance.patch(`/alumni/events/${id}`, toEventPayload(data));
  return normalizeEvent(unwrapItem<GenericRecord>(response.data));
}

export async function deleteEvent(id: string | number): Promise<void> {
  await axiosInstance.delete(`/alumni/events/${id}`);
}

export async function cancelEvent(id: string | number, reason: string): Promise<void> {
  await axiosInstance.post(`/alumni/events/${id}/cancel`, { reason: reason.trim() });
}

export async function getEventStatistics(id: string | number): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/events/${id}/statistics`);
  return unwrapRecord(response.data);
}

export async function getEventBanner(id: string | number): Promise<GenericRecord> {
  const response = await axiosInstance.get(`/alumni/events/${id}/banner`);
  return unwrapItem<GenericRecord>(response.data);
}

export async function uploadEventBanner(id: string | number, file: File): Promise<GenericRecord> {
  const body = new FormData();
  body.append('banner', file);
  const response = await axiosInstance.post(`/alumni/events/${id}/banner`, body);
  return unwrapItem<GenericRecord>(response.data);
}

export async function registerForEvent(id: string | number, alumniId: number): Promise<void> {
  await axiosInstance.post(`/alumni/events/${id}/register`, { alumni_id: alumniId });
}

// The spec gives this endpoint no leading HTTP verb, right below register's
// POST — treated as POST with the same alumni_id body shape.
export async function cancelEventRegistration(id: string | number, alumniId: number): Promise<void> {
  await axiosInstance.post(`/alumni/events/${id}/cancel-registration`, { alumni_id: alumniId });
}

export async function getEventAttendees(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/events/${id}/attendees`, { params });
  return unwrapRecord(response.data);
}

export async function recordAttendance(id: string | number, records: AttendeeStatusRecord[]): Promise<void> {
  await axiosInstance.post(`/alumni/events/${id}/attendees`, { records });
}

// Body isn't documented; this is a bare sweep with no payload, guessing the
// backend marks every still-registered attendee who never checked in.
export async function markNoShows(id: string | number): Promise<void> {
  await axiosInstance.post(`/alumni/events/${id}/mark-no-shows`);
}
