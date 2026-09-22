import axiosInstance from '../../../lib/axios';
import type { GenericRecord, ListParams, ListResult, Pagination, RecordResult } from '../types/profile.types';
import type { Campaign, CampaignFormData } from '../types/fundraising.types';

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
    const rows = ['items', 'rows', 'data', 'campaigns'].map((key) => payload[key]).find(Array.isArray);
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
    const rows = ['items', 'rows', 'data', 'donations'].map((key) => payload[key]).find(Array.isArray);
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

function normalizeCampaign(raw: GenericRecord): Campaign {
  return { ...raw, campaign_id: Number(raw.campaign_id ?? raw.id) } as unknown as Campaign;
}

function toCampaignPayload(data: CampaignFormData) {
  return {
    title: data.title.trim(),
    description: data.description.trim(),
    goal_amount: Number(data.goal_amount),
    start_date: data.start_date,
    end_date: data.end_date,
  };
}

export async function getCampaigns(params: ListParams = {}): Promise<ListResult<Campaign>> {
  const response = await axiosInstance.get('/alumni/campaigns', { params });
  const result = unwrapList<GenericRecord>(response.data);
  return { data: result.data.map(normalizeCampaign), pagination: result.pagination };
}

export async function getCampaign(id: string | number): Promise<Campaign> {
  const response = await axiosInstance.get(`/alumni/campaigns/${id}`);
  return normalizeCampaign(unwrapItem<GenericRecord>(response.data));
}

export async function createCampaign(data: CampaignFormData): Promise<Campaign> {
  const response = await axiosInstance.post('/alumni/campaigns', toCampaignPayload(data));
  return normalizeCampaign(unwrapItem<GenericRecord>(response.data));
}

export async function updateCampaign(id: string | number, data: CampaignFormData): Promise<Campaign> {
  const response = await axiosInstance.patch(`/alumni/campaigns/${id}`, toCampaignPayload(data));
  return normalizeCampaign(unwrapItem<GenericRecord>(response.data));
}

export async function closeCampaign(id: string | number): Promise<void> {
  await axiosInstance.post(`/alumni/campaigns/${id}/close`);
}

export async function getCampaignStatistics(id: string | number): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/campaigns/${id}/statistics`);
  return unwrapRecord(response.data);
}

export async function getCampaignDonations(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/alumni/campaigns/${id}/donations`, { params });
  return unwrapRecord(response.data);
}
