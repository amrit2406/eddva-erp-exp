export interface TransportVehicle {
  vehicle_id: number;
  institute_id: string;
  registration_number: string;
  capacity: number;
  model: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransportVehicleFormData {
  registration_number: string;
  capacity: number;
  model: string;
  is_active: boolean;
}

export type TransportVehicleUpdateData = Partial<TransportVehicleFormData>;
