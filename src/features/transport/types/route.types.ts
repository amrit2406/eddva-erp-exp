import type { TransportVehicle } from './vehicle.types';
import type { TransportDriver } from './driver.types';

export type { TransportDriver } from './driver.types';

export interface TransportRouteStop {
  stop_id: number;
  route_id: number;
  stop_name: string;
  sequence_no: number;
  latitude?: number | null;
  longitude?: number | null;
  pickup_time?: string | null;
  drop_time?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransportRouteStopFormData {
  stop_name: string;
  sequence_no: number;
  latitude?: number;
  longitude?: number;
  pickup_time?: string;
  drop_time?: string;
}

export interface TransportRoute {
  route_id: number;
  institute_id: string;
  name: string;
  start_location: string;
  end_location: string;
  created_at: string;
  updated_at: string;
  stops?: TransportRouteStop[];
}

export interface TransportRouteFormData {
  name: string;
  start_location: string;
  end_location: string;
}

export type TransportRouteUpdateData = Partial<TransportRouteFormData>;

export type TransportAssignmentStatus = 'active' | 'ended' | string;

export interface TransportRouteAssignment {
  assignment_id: number;
  route_id: number;
  vehicle_id: number;
  driver_id: number;
  effective_from: string;
  effective_to?: string | null;
  status: TransportAssignmentStatus;
  created_at: string;
  updated_at: string;
  vehicle?: TransportVehicle;
  driver?: TransportDriver;
}

export interface TransportAssignVehicleFormData {
  vehicle_id: number;
  driver_id: number;
  effective_from: string;
}
