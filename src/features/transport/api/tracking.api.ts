import axiosInstance from '../../../lib/axios';
import type {
  TransportGpsDevice,
  TransportGpsDeviceFormData,
  TransportVehicleLocation,
  TransportAlert,
  TransportAlertFormData,
  TransportMaintenanceRecord,
  TransportMaintenanceFormData,
} from '../types/tracking.types';

export async function getGpsDevices(vehicleId: string | number): Promise<TransportGpsDevice[]> {
  const response = await axiosInstance.get(`/transport/tracking/vehicles/${vehicleId}/gps-devices`);
  return response.data.data || response.data || [];
}

export async function createGpsDevice(
  vehicleId: string | number,
  data: TransportGpsDeviceFormData
): Promise<TransportGpsDevice> {
  const response = await axiosInstance.post(`/transport/tracking/vehicles/${vehicleId}/gps-devices`, data);
  return response.data.data || response.data;
}

export async function getCurrentLocation(vehicleId: string | number): Promise<TransportVehicleLocation | null> {
  const response = await axiosInstance.get(`/transport/tracking/vehicles/${vehicleId}/location/current`);
  return response.data.data || response.data || null;
}

export async function getLocationHistory(
  vehicleId: string | number,
  from: string,
  to: string
): Promise<TransportVehicleLocation[]> {
  const response = await axiosInstance.get(`/transport/tracking/vehicles/${vehicleId}/location/history`, {
    params: { from, to },
  });
  return response.data.data || response.data || [];
}

export async function createAlert(
  vehicleId: string | number,
  data: TransportAlertFormData
): Promise<TransportAlert> {
  const response = await axiosInstance.post(`/transport/tracking/vehicles/${vehicleId}/alerts`, data);
  return response.data.data || response.data;
}

export async function getAlerts(): Promise<TransportAlert[]> {
  const response = await axiosInstance.get('/transport/tracking/alerts');
  return response.data.data || response.data || [];
}

export async function resolveAlert(alertId: string | number): Promise<TransportAlert> {
  const response = await axiosInstance.patch(`/transport/tracking/alerts/${alertId}/resolve`);
  return response.data.data || response.data;
}

export async function createMaintenance(
  vehicleId: string | number,
  data: TransportMaintenanceFormData
): Promise<TransportMaintenanceRecord> {
  const response = await axiosInstance.post(`/transport/tracking/vehicles/${vehicleId}/maintenance`, data);
  return response.data.data || response.data;
}

export async function getMaintenance(vehicleId: string | number): Promise<TransportMaintenanceRecord[]> {
  const response = await axiosInstance.get(`/transport/tracking/vehicles/${vehicleId}/maintenance`);
  return response.data.data || response.data || [];
}
