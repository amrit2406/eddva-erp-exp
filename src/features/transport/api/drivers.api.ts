import axiosInstance from '../../../lib/axios';
import type {
  TransportDriver,
  TransportDriverFormData,
  TransportDriverUpdateData,
  TransportDriverDocument,
  TransportDriverDocumentFormData,
  TransportDriverVehicleHistory,
} from '../types/driver.types';

export async function getDrivers(): Promise<TransportDriver[]> {
  const response = await axiosInstance.get('/transport/drivers');
  return response.data.data || response.data || [];
}

export async function getDriver(id: string | number): Promise<TransportDriver> {
  const response = await axiosInstance.get(`/transport/drivers/${id}`);
  return response.data.data || response.data;
}

export async function createDriver(data: TransportDriverFormData): Promise<TransportDriver> {
  const response = await axiosInstance.post('/transport/drivers', data);
  return response.data.data || response.data;
}

export async function updateDriver(
  id: string | number,
  data: TransportDriverUpdateData
): Promise<TransportDriver> {
  const response = await axiosInstance.patch(`/transport/drivers/${id}`, data);
  return response.data.data || response.data;
}

export async function getDriverDocuments(driverId: string | number): Promise<TransportDriverDocument[]> {
  const response = await axiosInstance.get(`/transport/drivers/${driverId}/documents`);
  return response.data.data || response.data || [];
}

export async function createDriverDocument(
  driverId: string | number,
  data: TransportDriverDocumentFormData
): Promise<TransportDriverDocument> {
  const response = await axiosInstance.post(`/transport/drivers/${driverId}/documents`, data);
  return response.data.data || response.data;
}

export async function getDriverVehicles(driverId: string | number): Promise<TransportDriverVehicleHistory[]> {
  const response = await axiosInstance.get(`/transport/drivers/${driverId}/vehicles`);
  return response.data.data || response.data || [];
}

export async function assignVehicleToDriver(
  driverId: string | number,
  vehicleId: string | number,
  data: { assigned_from: string }
): Promise<TransportDriverVehicleHistory> {
  const response = await axiosInstance.post(`/transport/drivers/${driverId}/vehicles/${vehicleId}`, data);
  return response.data.data || response.data;
}
