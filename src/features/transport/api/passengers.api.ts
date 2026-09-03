import axiosInstance from '../../../lib/axios';
import type {
  TransportPassenger,
  TransportPassengerFormData,
  TransportPassengerUpdateData,
  TransportPassengerAllocation,
} from '../types/passenger.types';

export async function getPassengers(): Promise<TransportPassenger[]> {
  const response = await axiosInstance.get('/transport/passengers');
  return response.data.data || response.data || [];
}

export async function getPassenger(id: string | number): Promise<TransportPassenger> {
  const response = await axiosInstance.get(`/transport/passengers/${id}`);
  return response.data.data || response.data;
}

export async function createPassenger(data: TransportPassengerFormData): Promise<TransportPassenger> {
  const response = await axiosInstance.post('/transport/passengers', data);
  return response.data.data || response.data;
}

export async function updatePassenger(
  id: string | number,
  data: TransportPassengerUpdateData
): Promise<TransportPassenger> {
  const response = await axiosInstance.patch(`/transport/passengers/${id}`, data);
  return response.data.data || response.data;
}

export async function allocateRouteToPassenger(
  passengerId: string | number,
  routeId: string | number,
  data: { effective_from: string; pickup_stop_id?: number; drop_stop_id?: number }
): Promise<TransportPassengerAllocation> {
  const response = await axiosInstance.post(
    `/transport/passengers/${passengerId}/allocate-route/${routeId}`,
    data
  );
  return response.data.data || response.data;
}

export async function getPassengerAllocations(
  passengerId: string | number
): Promise<TransportPassengerAllocation[]> {
  const response = await axiosInstance.get(`/transport/passengers/${passengerId}/allocations`);
  return response.data.data || response.data || [];
}
