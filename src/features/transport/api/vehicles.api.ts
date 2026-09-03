import axiosInstance from '../../../lib/axios';
import type { TransportVehicle, TransportVehicleFormData, TransportVehicleUpdateData } from '../types/vehicle.types';

export async function getVehicles(): Promise<TransportVehicle[]> {
  const response = await axiosInstance.get('/transport/vehicles');
  return response.data.data || response.data || [];
}

export async function getVehicle(id: string | number): Promise<TransportVehicle> {
  const response = await axiosInstance.get(`/transport/vehicles/${id}`);
  return response.data.data || response.data;
}

export async function createVehicle(data: TransportVehicleFormData): Promise<TransportVehicle> {
  const response = await axiosInstance.post('/transport/vehicles', data);
  return response.data.data || response.data;
}

export async function updateVehicle(
  id: string | number,
  data: TransportVehicleUpdateData
): Promise<TransportVehicle> {
  const response = await axiosInstance.patch(`/transport/vehicles/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteVehicle(id: string | number): Promise<void> {
  await axiosInstance.delete(`/transport/vehicles/${id}`);
}
