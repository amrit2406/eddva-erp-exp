import axiosInstance from '../../../lib/axios';
import { cleanPayload } from '../utils/cleanPayload';
import type {
  FrontOfficeAppointment,
  AppointmentFormData,
  AppointmentUpdateFormData,
  CancelAppointmentFormData,
  CompleteAppointmentFormData,
  RescheduleAppointmentFormData,
  AppointmentListResult,
  AppointmentQueryParams,
  AppointmentAvailabilityParams,
  AppointmentAvailabilityResult,
  AppointmentConflictParams,
  AppointmentConflictResult,
} from '../types/appointmentRecord.types';

export async function getAppointments(params?: AppointmentQueryParams): Promise<AppointmentListResult> {
  const response = await axiosInstance.get('/front-office/appointments', { params });
  return {
    data: response.data.data || [],
    pagination: response.data.pagination,
  };
}

export async function getAppointment(id: string | number): Promise<FrontOfficeAppointment> {
  const response = await axiosInstance.get(`/front-office/appointments/${id}`);
  return response.data.data || response.data;
}

export async function createAppointment(data: AppointmentFormData): Promise<FrontOfficeAppointment> {
  const response = await axiosInstance.post('/front-office/appointments', cleanPayload(data));
  return response.data.data || response.data;
}

export async function updateAppointment(
  id: string | number,
  data: AppointmentUpdateFormData
): Promise<FrontOfficeAppointment> {
  const response = await axiosInstance.patch(`/front-office/appointments/${id}`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function getTodayAppointments(): Promise<FrontOfficeAppointment[]> {
  const response = await axiosInstance.get('/front-office/appointments/today');
  return response.data.data || response.data || [];
}

export async function getUpcomingAppointments(): Promise<FrontOfficeAppointment[]> {
  const response = await axiosInstance.get('/front-office/appointments/upcoming');
  return response.data.data || response.data || [];
}

export async function getAppointmentAvailability(
  params: AppointmentAvailabilityParams
): Promise<AppointmentAvailabilityResult> {
  const response = await axiosInstance.get('/front-office/appointments/availability', { params });
  return response.data.data || response.data;
}

export async function getAppointmentConflicts(
  params: AppointmentConflictParams
): Promise<AppointmentConflictResult> {
  const response = await axiosInstance.get('/front-office/appointments/conflicts', { params });
  return response.data.data || response.data;
}

export async function confirmAppointment(id: string | number): Promise<FrontOfficeAppointment> {
  const response = await axiosInstance.post(`/front-office/appointments/${id}/confirm`);
  return response.data.data || response.data;
}

export async function cancelAppointment(
  id: string | number,
  data: CancelAppointmentFormData
): Promise<FrontOfficeAppointment> {
  const response = await axiosInstance.post(`/front-office/appointments/${id}/cancel`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function completeAppointment(
  id: string | number,
  data: CompleteAppointmentFormData
): Promise<FrontOfficeAppointment> {
  const response = await axiosInstance.post(`/front-office/appointments/${id}/complete`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function markAppointmentNoShow(id: string | number): Promise<FrontOfficeAppointment> {
  const response = await axiosInstance.post(`/front-office/appointments/${id}/no-show`);
  return response.data.data || response.data;
}

export async function rescheduleAppointment(
  id: string | number,
  data: RescheduleAppointmentFormData
): Promise<FrontOfficeAppointment> {
  const response = await axiosInstance.post(`/front-office/appointments/${id}/reschedule`, cleanPayload(data));
  return response.data.data || response.data;
}
