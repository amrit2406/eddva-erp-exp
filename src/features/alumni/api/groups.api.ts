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
    const known = ['items', 'rows', 'data', 'groups'].map((key) => payload[key]).find(Array.isArray);
    const rows = known ?? Object.values(payload).find(Array.isArray);
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
    // Try the likely key names first, then fall back to whatever array-valued
    // property is actually there — the real key (e.g. "alumni", "profiles")
    // isn't confirmed, and silently showing nothing is worse than a guess.
    const known = ['items', 'rows', 'data', 'members'].map((key) => payload[key]).find(Array.isArray);
    const rows = known ?? Object.values(payload).find(Array.isArray);
    return { data: (rows as GenericRecord[] | undefined) ?? [], pagination: body.pagination as Pagination | undefined };
  }
  return { data: [] };
}

function unwrapItem<T>(body: { data?: unknown }): T {
  return (body.data ?? body) as T;
}

const MEMBER_COUNT_KEYS = ['member_count', 'members_count', 'memberCount', 'total_members', 'members_total'];
// Prisma's relation-count shape, as already used elsewhere in this backend
// (e.g. a role's _count.user_roles) — a strong guess for how a group's own
// member count is likely exposed too.
const COUNT_RELATION_KEYS = ['members', 'alumni', 'group_members', 'alumni_members'];

function pickMemberCount(raw: GenericRecord): number | undefined {
  for (const key of MEMBER_COUNT_KEYS) {
    if (typeof raw[key] === 'number') return raw[key] as number;
  }
  const count = raw._count;
  if (isRecord(count)) {
    for (const key of COUNT_RELATION_KEYS) {
      if (typeof count[key] === 'number') return count[key] as number;
    }
  }
  // The list endpoint may just embed the members array itself.
  if (Array.isArray(raw.members)) return raw.members.length;
  return undefined;
}

function normalizeGroup(raw: GenericRecord): AlumniGroup {
  return {
    ...raw,
    group_id: Number(raw.group_id ?? raw.id),
    member_count: pickMemberCount(raw),
  } as unknown as AlumniGroup;
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
