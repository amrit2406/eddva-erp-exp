import axiosInstance from '../../../lib/axios';
import { cleanPayload } from '../utils/cleanPayload';
import type {
  FrontOfficeEmployee,
  FrontOfficeEmployeeFormData,
  FrontOfficeEmployeeUpdateData,
  EmployeeListResult,
  EmployeeQueryParams,
  AvailabilitySlot,
  AvailabilitySlotFormData,
  AvailabilitySlotUpdateData,
  FindAvailableParams,
  EmployeeAppointment,
  EmployeeAppointmentsQuery,
} from '../types/employeeRecord.types';

export async function getEmployees(params?: EmployeeQueryParams): Promise<EmployeeListResult> {
  const response = await axiosInstance.get('/front-office/employees', { params });
  return {
    data: response.data.data || [],
    pagination: response.data.pagination,
  };
}

export async function getEmployee(id: string | number): Promise<FrontOfficeEmployee> {
  const response = await axiosInstance.get(`/front-office/employees/${id}`);
  return response.data.data || response.data;
}

export async function createEmployee(data: FrontOfficeEmployeeFormData): Promise<FrontOfficeEmployee> {
  const response = await axiosInstance.post('/front-office/employees', cleanPayload(data));
  return response.data.data || response.data;
}

export async function updateEmployee(
  id: string | number,
  data: FrontOfficeEmployeeUpdateData
): Promise<FrontOfficeEmployee> {
  const response = await axiosInstance.patch(`/front-office/employees/${id}`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function getAvailableEmployees(params: FindAvailableParams): Promise<FrontOfficeEmployee[]> {
  const response = await axiosInstance.get('/front-office/employees/available', { params });
  return response.data.data || response.data || [];
}

export async function getEmployeeAppointments(
  id: string | number,
  query?: EmployeeAppointmentsQuery
): Promise<EmployeeAppointment[]> {
  const response = await axiosInstance.get(`/front-office/employees/${id}/appointments`, { params: query });
  return response.data.data || response.data || [];
}

export async function getEmployeeAvailability(id: string | number, date?: string): Promise<AvailabilitySlot[]> {
  const response = await axiosInstance.get(`/front-office/employees/${id}/availability`, {
    params: date ? { date } : undefined,
  });
  return response.data.data || response.data || [];
}

export async function createAvailabilitySlot(
  id: string | number,
  data: AvailabilitySlotFormData
): Promise<AvailabilitySlot> {
  const response = await axiosInstance.post(`/front-office/employees/${id}/availability`, data);
  return response.data.data || response.data;
}

export async function updateAvailabilitySlot(
  slotId: string | number,
  data: AvailabilitySlotUpdateData
): Promise<AvailabilitySlot> {
  const response = await axiosInstance.patch(`/front-office/employees/availability/${slotId}`, data);
  return response.data.data || response.data;
}

export async function deleteAvailabilitySlot(slotId: string | number): Promise<void> {
  await axiosInstance.delete(`/front-office/employees/availability/${slotId}`);
}
