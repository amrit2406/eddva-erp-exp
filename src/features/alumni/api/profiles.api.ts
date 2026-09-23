import axiosInstance from '../../../lib/axios';
import { extensionForMime, saveBlob } from '../utils/download';
import { pickPhotoUrl } from '../utils/format';
import type {
  AlumniProfile,
  AlumniProfileFormData,
  AlumniProfileListParams,
  AlumniProfileUpdateData,
  GenericRecord,
  ListParams,
  ListResult,
  Pagination,
  RecordResult,
} from '../types/profile.types';

function isRecord(value: unknown): value is GenericRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cleanParams<T extends object>(params: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

// List endpoints may answer with a bare array or wrap the rows in an object
// (items/rows/data/...), with pagination beside or inside the payload.
function unwrapList<T = GenericRecord>(body: unknown): ListResult<T> {
  if (!isRecord(body)) return { data: [] };
  const payload = body.data ?? body;
  if (Array.isArray(payload)) {
    return { data: payload as T[], pagination: body.pagination as Pagination | undefined };
  }
  if (isRecord(payload)) {
    const rows = ['items', 'rows', 'data', 'profiles'].map((key) => payload[key]).find(Array.isArray);
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

function normalizeProfile(raw: GenericRecord): AlumniProfile {
  // The backend's own column is alumni_id (matching resident_id, application_id,
  // etc. in every other module); profile_id/id are only kept as a fallback.
  return {
    ...raw,
    profile_id: Number(raw.alumni_id ?? raw.profile_id ?? raw.id),
    photo_url: pickPhotoUrl(raw),
  } as unknown as AlumniProfile;
}

function toProfileCorePayload(data: AlumniProfileUpdateData) {
  return {
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
    verification_status: data.verification_status,
  };
}

export async function getProfiles(params: AlumniProfileListParams = {}): Promise<ListResult<AlumniProfile>> {
  const response = await axiosInstance.get('/alumni/profiles', { params: cleanParams(params) });
  const result = unwrapList<GenericRecord>(response.data);
  return { data: result.data.map(normalizeProfile), pagination: result.pagination };
}

export async function getProfile(id: string | number): Promise<AlumniProfile> {
  const response = await axiosInstance.get(`/alumni/profiles/${id}`);
  return normalizeProfile(unwrapItem<GenericRecord>(response.data));
}

export async function createProfile(data: AlumniProfileFormData): Promise<AlumniProfile> {
  const response = await axiosInstance.post('/alumni/profiles', {
    ...toProfileCorePayload(data),
    password: data.password,
  });
  return normalizeProfile(unwrapItem<GenericRecord>(response.data));
}

export async function updateProfile(id: string | number, data: AlumniProfileUpdateData): Promise<AlumniProfile> {
  const response = await axiosInstance.patch(`/alumni/profiles/${id}`, toProfileCorePayload(data));
  return normalizeProfile(unwrapItem<GenericRecord>(response.data));
}

export async function deleteProfile(id: string | number): Promise<void> {
  await axiosInstance.delete(`/alumni/profiles/${id}`);
}

// The export format isn't documented, so this saves whatever content type the
// server answers with (csv/xlsx/pdf/...).
export async function exportProfiles(params: AlumniProfileListParams = {}): Promise<void> {
  const response = await axiosInstance.get('/alumni/profiles/export', {
    params: cleanParams(params),
    responseType: 'blob',
  });
  const contentType = String(response.headers['content-type'] || 'application/octet-stream');
  const extension = extensionForMime(contentType) || 'csv';
  saveBlob(new Blob([response.data], { type: contentType }), `alumni-profiles.${extension}`);
}

export async function reactivateProfile(id: string | number): Promise<void> {
  await axiosInstance.post(`/alumni/profiles/${id}/reactivate`);
}

// The verify endpoint's body isn't fully specified: a reason is shown only for
// a rejection, so this sends {} to approve and {reason} to reject.
export async function verifyProfile(id: string | number, reason?: string): Promise<void> {
  const trimmed = reason?.trim();
  await axiosInstance.post(`/alumni/profiles/${id}/verify`, trimmed ? { reason: trimmed } : {});
}

export async function getVerificationHistory(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/profiles/${id}/verification-history`, { params });
  return unwrapRecord(response.data);
}

export async function getPossibleDuplicates(id: string | number): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/profiles/${id}/possible-duplicates`);
  return unwrapRecord(response.data);
}

export async function issueProfileAccount(id: string | number, password: string): Promise<void> {
  await axiosInstance.post(`/alumni/profiles/${id}/account`, { password });
}

export async function getProfileGroups(id: string | number): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/profiles/${id}/groups`);
  return unwrapRecord(response.data);
}

// The GET side of this endpoint isn't documented as JSON — it most likely
// serves the image itself, so this fetches it as a blob and turns it into a
// displayable object URL. Callers must revoke the URL once done with it
// (see ProfileDetailPage). Falls back to reading a url field out of a JSON
// body, in case the backend answers that way instead. Resolves to null when
// the profile has no photo (a 404) rather than throwing.
export async function getProfilePhotoUrl(id: string | number): Promise<string | null> {
  try {
    const response = await axiosInstance.get(`/alumni/profiles/${id}/photo`, { responseType: 'blob' });
    const blob = response.data as Blob;
    const contentType = String(response.headers['content-type'] || blob.type || '');
    if (contentType.startsWith('image/')) {
      return URL.createObjectURL(blob);
    }
    const text = await blob.text();
    const parsed: unknown = JSON.parse(text);
    const record = isRecord(parsed) ? ((parsed.data as unknown) ?? parsed) : null;
    return isRecord(record) ? pickPhotoUrl(record) : null;
  } catch (error) {
    if ((error as { response?: { status?: number } }).response?.status === 404) return null;
    throw error;
  }
}

export async function uploadProfilePhoto(id: string | number, file: File): Promise<GenericRecord> {
  const body = new FormData();
  // Confirmed against the backend: FileInterceptor('file', ...) only reads
  // this exact multipart field name.
  body.append('file', file);
  const response = await axiosInstance.post(`/alumni/profiles/${id}/photo`, body);
  return unwrapItem<GenericRecord>(response.data);
}
