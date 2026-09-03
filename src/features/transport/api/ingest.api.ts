import axios from 'axios';
import { config } from '../../../config/env';
import type { TransportVehicleLocation } from '../types/tracking.types';

// Deliberately a bare axios client, not the shared authenticated `axiosInstance` — this
// endpoint takes no Bearer token by design (a GPS tracker unit is not a logged-in staff
// member), and this public ingestion page should never carry the app's private token at all.
const ingestAxios = axios.create({ baseURL: config.apiUrl });

export interface TransportIngestLocationFormData {
  latitude: number;
  longitude: number;
  speed_kmph?: number;
  heading?: number;
}

export async function ingestVehicleLocation(
  vehicleId: string | number,
  data: TransportIngestLocationFormData
): Promise<TransportVehicleLocation> {
  const response = await ingestAxios.post(`/transport/tracking/ingest/${vehicleId}`, data);
  return response.data.data || response.data;
}
