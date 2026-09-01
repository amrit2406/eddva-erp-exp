import axiosInstance from '../../../lib/axios';
import { cleanPayload } from '../utils/cleanPayload';
import type {
  InventoryAsset,
  InventoryAssetUpdateData,
  InventoryAssetQueryParams,
  InventoryAssetListResult,
} from '../types/asset.types';

export async function getAssets(params?: InventoryAssetQueryParams): Promise<InventoryAssetListResult> {
  const response = await axiosInstance.get('/inventory/assets', { params });
  return {
    data: response.data.data?.data || response.data.data || [],
    pagination: response.data.data?.pagination || response.data.pagination,
  };
}

export async function getAsset(tag: string): Promise<InventoryAsset> {
  const response = await axiosInstance.get(`/inventory/assets/${encodeURIComponent(tag)}`);
  return response.data.data || response.data;
}

export async function updateAsset(tag: string, data: InventoryAssetUpdateData): Promise<InventoryAsset> {
  const response = await axiosInstance.patch(`/inventory/assets/${encodeURIComponent(tag)}`, cleanPayload(data));
  return response.data.data || response.data;
}
