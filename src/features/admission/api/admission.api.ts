import axiosInstance from '../../../lib/axios';
import type {
  AdmissionSession,
  AdmissionProgram,
  ListParams,
  PaginatedResult,
  ProgramFormData,
  SessionFormData,
  SessionListParams,
} from '../types/admission.types';

function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined)
  ) as Partial<T>;
}

// Academic Sessions
export async function getSessions(params: SessionListParams = {}): Promise<PaginatedResult<AdmissionSession>> {
  const response = await axiosInstance.get('/admission/sessions', { params: cleanParams(params) });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function getSession(id: string | number): Promise<AdmissionSession> {
  const response = await axiosInstance.get(`/admission/sessions/${id}`);
  return response.data.data;
}

export async function createSession(data: SessionFormData): Promise<AdmissionSession> {
  const response = await axiosInstance.post('/admission/sessions', data);
  return response.data.data;
}

export async function updateSession(id: string | number, data: Partial<SessionFormData>): Promise<AdmissionSession> {
  const response = await axiosInstance.patch(`/admission/sessions/${id}`, data);
  return response.data.data;
}

export async function deleteSession(id: string | number): Promise<void> {
  await axiosInstance.delete(`/admission/sessions/${id}`);
}

// Programs
export async function getPrograms(params: ListParams = {}): Promise<PaginatedResult<AdmissionProgram>> {
  const response = await axiosInstance.get('/admission/programs', { params: cleanParams(params) });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function getProgram(id: string | number): Promise<AdmissionProgram> {
  const response = await axiosInstance.get(`/admission/programs/${id}`);
  return response.data.data;
}

export async function createProgram(data: ProgramFormData): Promise<AdmissionProgram> {
  const response = await axiosInstance.post('/admission/programs', toProgramPayload(data, 'create'));
  return response.data.data;
}

export async function updateProgram(id: string | number, data: Partial<ProgramFormData>): Promise<AdmissionProgram> {
  const response = await axiosInstance.patch(`/admission/programs/${id}`, toProgramPayload(data, 'update'));
  return response.data.data;
}

export async function deleteProgram(id: string | number): Promise<void> {
  await axiosInstance.delete(`/admission/programs/${id}`);
}

// Create omits an empty eligibility_criteria; update sends null so a cleared
// field is actually cleared instead of silently keeping the old value.
function toProgramPayload(data: Partial<ProgramFormData>, mode: 'create' | 'update') {
  const payload: Record<string, unknown> = { ...data };
  if (typeof data.name === 'string') payload.name = data.name.trim();
  if (typeof data.level === 'string') payload.level = data.level.trim();
  if (typeof data.eligibility_criteria === 'string') {
    const criteria = data.eligibility_criteria.trim();
    if (criteria) payload.eligibility_criteria = criteria;
    else if (mode === 'update') payload.eligibility_criteria = null;
    else delete payload.eligibility_criteria;
  }
  return payload;
}
