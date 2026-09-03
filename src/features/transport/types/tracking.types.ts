export interface TransportGpsDevice {
  device_id: number;
  vehicle_id: number;
  device_serial: string;
  sim_number?: string | null;
  installed_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransportGpsDeviceFormData {
  device_serial: string;
  sim_number?: string;
  installed_date?: string;
}

export interface TransportVehicleLocation {
  log_id: string | number;
  vehicle_id: number;
  latitude: string | number;
  longitude: string | number;
  speed_kmph?: string | number | null;
  heading?: number | null;
  recorded_at: string;
}

export type TransportAlertType = 'sos' | 'speeding' | 'geofence' | 'breakdown' | 'other';

export interface TransportAlert {
  alert_id: number;
  vehicle_id: number;
  alert_type: TransportAlertType | string;
  triggered_at: string;
  resolved: boolean;
  resolved_at?: string | null;
  created_at: string;
  vehicle?: { vehicle_id: number; registration_number: string };
}

export interface TransportAlertFormData {
  alert_type: TransportAlertType | string;
}

export interface TransportMaintenanceRecord {
  maintenance_id: number;
  vehicle_id: number;
  service_date: string;
  service_type: string;
  cost?: string | number | null;
  next_service_due_km?: number | null;
  next_service_due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransportMaintenanceFormData {
  service_date: string;
  service_type: string;
  cost?: number;
  next_service_due_km?: number;
  next_service_due_date?: string;
}
