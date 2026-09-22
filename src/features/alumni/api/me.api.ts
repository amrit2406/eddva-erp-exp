import axiosInstance from '../../../lib/axios';
import type { AlumniProfile, AlumniProfileUpdateData, GenericRecord, ListParams, RecordResult, Pagination } from '../types/profile.types';

function isRecord(value: unknown): value is GenericRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapItem<T>(body: { data?: unknown }): T {
  return (body.data ?? body) as T;
}

function unwrapRecord(body: unknown): RecordResult {
  if (!isRecord(body)) return { data: [] };
  const payload = body.data ?? body;
  if (Array.isArray(payload)) {
    return { data: payload as GenericRecord[], pagination: body.pagination as Pagination | undefined };
  }
  if (isRecord(payload)) {
    const rows = ['items', 'rows', 'data'].map((key) => payload[key]).find(Array.isArray);
    const pagination = (body.pagination ?? payload.pagination) as Pagination | undefined;
    if (rows) return { data: rows as GenericRecord[], pagination };
    const { pagination: _pagination, ...rest } = payload;
    void _pagination;
    return { data: rest, pagination };
  }
  return { data: [] };
}

// Self-service for whoever the current Alumni session belongs to. In this
// staff admin app that's normally an officer's account, not an alumnus, so
// these calls will usually 404/403 unless the signed-in session is itself an
// alumni portal login — see this feature's summary.
export async function getMyProfile(): Promise<AlumniProfile> {
  const response = await axiosInstance.get('/alumni/me');
  return unwrapItem<AlumniProfile>(response.data);
}

export async function updateMyProfile(data: AlumniProfileUpdateData): Promise<AlumniProfile> {
  const response = await axiosInstance.patch('/alumni/me', {
    full_name: data.full_name.trim(),
    email: data.email.trim(),
    student_ref: data.student_ref.trim(),
    admission_no: data.admission_no.trim(),
    batch_year: Number(data.batch_year),
    graduation_year: Number(data.graduation_year),
    program: data.program.trim(),
    phone: data.phone.trim(),
    current_company: data.current_company.trim(),
    current_designation: data.current_designation.trim(),
    industry: data.industry.trim(),
    city: data.city.trim(),
    country: data.country.trim(),
    linkedin_url: data.linkedin_url.trim(),
    visibility: data.visibility,
    contact_visible: data.contact_visible,
    email_opt_in: data.email_opt_in,
    sms_opt_in: data.sms_opt_in,
  });
  return unwrapItem<AlumniProfile>(response.data);
}

export async function getMyVerification(): Promise<GenericRecord> {
  const response = await axiosInstance.get('/alumni/me/verification');
  return unwrapItem<GenericRecord>(response.data);
}

export async function requestMyVerification(note: string): Promise<void> {
  await axiosInstance.post('/alumni/me/verification-request', { note: note.trim() });
}

export async function uploadMyPhoto(file: File): Promise<GenericRecord> {
  const body = new FormData();
  body.append('photo', file);
  const response = await axiosInstance.post('/alumni/me/photo', body);
  return unwrapItem<GenericRecord>(response.data);
}

export async function getMyNotifications(params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/alumni/me/notifications', { params });
  return unwrapRecord(response.data);
}
