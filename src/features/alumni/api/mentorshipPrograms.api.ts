import axiosInstance from '../../../lib/axios';
import type { GenericRecord, ListParams, ListResult, Pagination, RecordResult } from '../types/profile.types';
import type { MatchCreatePayload, MentorshipProgram, MentorshipProgramFormData } from '../types/mentorship.types';

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
    const rows = ['items', 'rows', 'data', 'programs'].map((key) => payload[key]).find(Array.isArray);
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
    const rows = ['items', 'rows', 'data', 'mentors', 'matches'].map((key) => payload[key]).find(Array.isArray);
    return { data: (rows as GenericRecord[] | undefined) ?? [], pagination: body.pagination as Pagination | undefined };
  }
  return { data: [] };
}

function unwrapItem<T>(body: { data?: unknown }): T {
  return (body.data ?? body) as T;
}

function normalizeProgram(raw: GenericRecord): MentorshipProgram {
  return { ...raw, program_id: Number(raw.program_id ?? raw.id) } as unknown as MentorshipProgram;
}

function toProgramPayload(data: MentorshipProgramFormData) {
  return {
    name: data.name.trim(),
    description: data.description.trim(),
    start_date: data.start_date,
    end_date: data.end_date,
  };
}

export async function getMentorshipPrograms(params: ListParams = {}): Promise<ListResult<MentorshipProgram>> {
  const response = await axiosInstance.get('/alumni/mentorship-programs', { params });
  const result = unwrapList<GenericRecord>(response.data);
  return { data: result.data.map(normalizeProgram), pagination: result.pagination };
}

export async function getMentorshipProgram(id: string | number): Promise<MentorshipProgram> {
  const response = await axiosInstance.get(`/alumni/mentorship-programs/${id}`);
  return normalizeProgram(unwrapItem<GenericRecord>(response.data));
}

export async function createMentorshipProgram(data: MentorshipProgramFormData): Promise<MentorshipProgram> {
  const response = await axiosInstance.post('/alumni/mentorship-programs', toProgramPayload(data));
  return normalizeProgram(unwrapItem<GenericRecord>(response.data));
}

export async function updateMentorshipProgram(id: string | number, data: MentorshipProgramFormData): Promise<MentorshipProgram> {
  const response = await axiosInstance.patch(`/alumni/mentorship-programs/${id}`, toProgramPayload(data));
  return normalizeProgram(unwrapItem<GenericRecord>(response.data));
}

export async function closeMentorshipProgram(id: string | number): Promise<void> {
  await axiosInstance.post(`/alumni/mentorship-programs/${id}/close`);
}

export async function getProgramMentors(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/mentorship-programs/${id}/mentors`, { params });
  return unwrapRecord(response.data);
}

export async function getProgramMatches(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/mentorship-programs/${id}/matches`, { params });
  return unwrapRecord(response.data);
}

export async function createProgramMatch(id: string | number, data: MatchCreatePayload): Promise<GenericRecord> {
  const payload: Record<string, unknown> = { mentor_id: data.mentor_id, matched_date: data.matched_date };
  if (data.mentee_alumni_id !== undefined) payload.mentee_alumni_id = data.mentee_alumni_id;
  if (data.mentee_student_ref) payload.mentee_student_ref = data.mentee_student_ref;
  if (data.mentee_name) payload.mentee_name = data.mentee_name;
  const response = await axiosInstance.post(`/alumni/mentorship-programs/${id}/matches`, payload);
  return unwrapItem<GenericRecord>(response.data);
}
