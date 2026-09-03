import type { TransportRoute, TransportRouteStop } from './route.types';

export type TransportPassengerType = 'student' | 'staff' | 'other';
export type TransportPassengerStatus = 'active' | 'inactive';

export interface TransportPassenger {
  passenger_id: number;
  institute_id: string;
  external_ref_id?: string | null;
  name: string;
  phone?: string | null;
  type: TransportPassengerType;
  status: TransportPassengerStatus;
  created_at: string;
  updated_at: string;
}

export interface TransportPassengerFormData {
  external_ref_id?: string;
  name: string;
  phone?: string;
  type: TransportPassengerType;
}

export interface TransportPassengerUpdateData {
  external_ref_id?: string;
  name?: string;
  phone?: string;
  status?: TransportPassengerStatus;
}

export type TransportAllocationStatus = 'active' | 'ended' | string;

export interface TransportPassengerAllocation {
  allocation_id: number;
  passenger_id: number;
  route_id: number;
  pickup_stop_id?: number | null;
  drop_stop_id?: number | null;
  effective_from: string;
  effective_to?: string | null;
  status: TransportAllocationStatus;
  created_at: string;
  updated_at: string;
  route?: TransportRoute;
  pickup_stop?: TransportRouteStop | null;
  drop_stop?: TransportRouteStop | null;
}

export interface TransportAllocateRouteFormData {
  route_id: number;
  effective_from: string;
  pickup_stop_id?: number;
  drop_stop_id?: number;
}
