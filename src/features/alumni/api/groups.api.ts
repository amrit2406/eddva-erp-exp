import axiosInstance from '../../../lib/axios';
import type { GenericRecord, ListParams, ListResult, Pagination, RecordResult } from '../types/profile.types';
import type { AlumniGroup, GroupFormData } from '../types/engagement.types';

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
    const rows = ['items', 'rows', 'data', 'groups'].map((key) => payload[key]).find(Array.isArray);
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
    const rows = ['items', 'rows', 'data', 'members'].map((key) => payload[key]).find(Array.isArray);
    return { data: (rows as GenericRecord[] | undefined) ?? [], pagination: body.pagination as Pagination | undefined };
  }
  return { data: [] };
}

function unwrapItem<T>(body: { data?: unknown }): T {
  return (body.data ?? body) as T;
}

function normalizeGroup(raw: GenericRecord): AlumniGroup {
  return { ...raw, group_id: Number(raw.group_id ?? raw.id) } as unknown as AlumniGroup;
}

function toGroupPayload(data: GroupFormData) {
  return { name: data.name.trim(), group_type: data.group_type.trim(), description: data.description.trim() };
}

export async function getGroups(params: ListParams = {}): Promise<ListResult<AlumniGroup>> {
  const response = await axiosInstance.get('/alumni/groups', { params });
  const result = unwrapList<GenericRecord>(response.data);
  return { data: result.data.map(normalizeGroup), pagination: result.pagination };
}

export async function getGroup(id: string | number): Promise<AlumniGroup> {
  const response = await axiosInstance.get(`/alumni/groups/${id}`);
  return normalizeGroup(unwrapItem<GenericRecord>(response.data));
}

export async function createGroup(data: GroupFormData): Promise<AlumniGroup> {
  const response = await axiosInstance.post('/alumni/groups', toGroupPayload(data));
  return normalizeGroup(unwrapItem<GenericRecord>(response.data));
}

export async function updateGroup(id: string | number, data: GroupFormData): Promise<AlumniGroup> {
  const response = await axiosInstance.patch(`/alumni/groups/${id}`, toGroupPayload(data));
  return normalizeGroup(unwrapItem<GenericRecord>(response.data));
}

export async function deleteGroup(id: string | number): Promise<void> {
  await axiosInstance.delete(`/alumni/groups/${id}`);
}

export async function getGroupMembers(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/groups/${id}/members`, { params });
  return unwrapRecord(response.data);
}

export async function addGroupMembers(id: string | number, alumniIds: number[]): Promise<void> {
  await axiosInstance.post(`/alumni/groups/${id}/members`, { alumni_ids: alumniIds });
}

export async function removeGroupMember(id: string | number, alumniId: string | number): Promise<void> {
  await axiosInstance.delete(`/alumni/groups/${id}/members/${alumniId}`);
}
