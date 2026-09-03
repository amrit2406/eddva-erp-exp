import axiosInstance from '../../../lib/axios';
import type { TransportDriver } from '../types/route.types';

export async function getDrivers(): Promise<TransportDriver[]> {
  const response = await axiosInstance.get('/transport/drivers');
  return response.data.data || response.data || [];
}
