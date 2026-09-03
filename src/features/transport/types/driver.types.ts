import type { TransportVehicle } from './vehicle.types';

export type TransportDriverStatus = 'active' | 'inactive';

export interface TransportDriver {
  driver_id: number;
  institute_id: string;
  name: string;
  phone?: string | null;
  license_number?: string | null;
  license_expiry?: string | null;
  address?: string | null;
  photo_url?: string | null;
  joining_date?: string | null;
  status: TransportDriverStatus;
  created_at: string;
  updated_at: string;
}

export interface TransportDriverFormData {
  name: string;
  phone?: string;
  license_number?: string;
  license_expiry?: string;
  address?: string;
  photo_url?: string;
  joining_date?: string;
}

export interface TransportDriverUpdateData extends TransportDriverFormData {
  status?: TransportDriverStatus;
}

export interface TransportDriverDocument {
  document_id: number;
  driver_id: number;
  doc_type: string;
  doc_url: string;
  expiry_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransportDriverDocumentFormData {
  doc_type: string;
  doc_url: string;
  expiry_date?: string;
}

export interface TransportDriverVehicleHistory {
  history_id: number;
  driver_id: number;
  vehicle_id: number;
  assigned_from: string;
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;
  vehicle?: TransportVehicle;
}

export interface TransportAssignVehicleToDriverFormData {
  vehicle_id: number;
  assigned_from: string;
}
