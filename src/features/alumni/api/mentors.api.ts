import axiosInstance from '../../../lib/axios';
import type { GenericRecord, ListParams, ListResult, Pagination } from '../types/profile.types';
import type { Mentor, MentorFormData } from '../types/mentorship.types';

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
    const rows = ['items', 'rows', 'data', 'mentors'].map((key) => payload[key]).find(Array.isArray);
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

function normalizeMentor(raw: GenericRecord): Mentor {
  return {
    ...raw,
    mentor_id: Number(raw.mentor_id ?? raw.id),
    expertise_areas: Array.isArray(raw.expertise_areas) ? raw.expertise_areas : [],
  } as unknown as Mentor;
}

function toMentorPayload(data: MentorFormData) {
  return {
    alumni_id: Number(data.alumni_id),
    expertise_areas: data.expertise_areas
      .split(',')
      .map((area) => area.trim())
      .filter(Boolean),
    max_mentees: Number(data.max_mentees),
    bio: data.bio.trim(),
    availability_note: data.availability_note.trim(),
  };
}

export async function getMentors(params: ListParams = {}): Promise<ListResult<Mentor>> {
  const response = await axiosInstance.get('/alumni/mentors', { params });
  const result = unwrapList<GenericRecord>(response.data);
  return { data: result.data.map(normalizeMentor), pagination: result.pagination };
}

export async function getMentor(id: string | number): Promise<Mentor> {
  const response = await axiosInstance.get(`/alumni/mentors/${id}`);
  return normalizeMentor(unwrapItem<GenericRecord>(response.data));
}

export async function createMentor(data: MentorFormData): Promise<Mentor> {
  const response = await axiosInstance.post('/alumni/mentors', toMentorPayload(data));
  return normalizeMentor(unwrapItem<GenericRecord>(response.data));
}

export async function updateMentor(id: string | number, data: MentorFormData): Promise<Mentor> {
  const response = await axiosInstance.patch(`/alumni/mentors/${id}`, toMentorPayload(data));
  return normalizeMentor(unwrapItem<GenericRecord>(response.data));
}
