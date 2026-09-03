import axiosInstance from '../../../lib/axios';
import type {
  TransportRoute,
  TransportRouteFormData,
  TransportRouteUpdateData,
  TransportRouteStop,
  TransportRouteStopFormData,
  TransportRouteAssignment,
} from '../types/route.types';

export async function getRoutes(): Promise<TransportRoute[]> {
  const response = await axiosInstance.get('/transport/routes');
  return response.data.data || response.data || [];
}

export async function getRoute(id: string | number): Promise<TransportRoute> {
  const response = await axiosInstance.get(`/transport/routes/${id}`);
  return response.data.data || response.data;
}

export async function createRoute(data: TransportRouteFormData): Promise<TransportRoute> {
  const response = await axiosInstance.post('/transport/routes', data);
  return response.data.data || response.data;
}

export async function updateRoute(id: string | number, data: TransportRouteUpdateData): Promise<TransportRoute> {
  const response = await axiosInstance.patch(`/transport/routes/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteRoute(id: string | number): Promise<void> {
  await axiosInstance.delete(`/transport/routes/${id}`);
}

export async function getRouteStops(routeId: string | number): Promise<TransportRouteStop[]> {
  const response = await axiosInstance.get(`/transport/routes/${routeId}/stops`);
  return response.data.data || response.data || [];
}

export async function createRouteStop(
  routeId: string | number,
  data: TransportRouteStopFormData
): Promise<TransportRouteStop> {
  const response = await axiosInstance.post(`/transport/routes/${routeId}/stops`, data);
  return response.data.data || response.data;
}

export async function assignVehicleToRoute(
  routeId: string | number,
  vehicleId: string | number,
  data: { driver_id: number; effective_from: string }
): Promise<TransportRouteAssignment> {
  const response = await axiosInstance.post(`/transport/routes/${routeId}/assign-vehicle/${vehicleId}`, data);
  return response.data.data || response.data;
}

export async function getRouteAssignments(routeId: string | number): Promise<TransportRouteAssignment[]> {
  const response = await axiosInstance.get(`/transport/routes/${routeId}/assignments`);
  return response.data.data || response.data || [];
}
