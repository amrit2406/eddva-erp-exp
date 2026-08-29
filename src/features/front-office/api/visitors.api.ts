import axiosInstance from '../../../lib/axios';
import { cleanPayload } from '../utils/cleanPayload';
import type {
  FrontOfficeVisitor,
  FrontOfficeVisitorFormData,
  VisitorListResult,
  VisitorQueryParams,
  VisitorVisit,
  VisitorAppointment,
  VisitorAuditLog,
} from '../types/visitorRecord.types';

export async function getVisitors(params?: VisitorQueryParams): Promise<VisitorListResult> {
  const response = await axiosInstance.get('/front-office/visitors', { params });
  return {
    data: response.data.data || [],
    pagination: response.data.pagination,
  };
}

export async function getVisitor(id: string | number): Promise<FrontOfficeVisitor> {
  const response = await axiosInstance.get(`/front-office/visitors/${id}`);
  return response.data.data || response.data;
}

export async function createVisitor(data: FrontOfficeVisitorFormData): Promise<FrontOfficeVisitor> {
  const response = await axiosInstance.post('/front-office/visitors', cleanPayload(data));
  return response.data.data || response.data;
}

export async function updateVisitor(
  id: string | number,
  data: Partial<FrontOfficeVisitorFormData>
): Promise<FrontOfficeVisitor> {
  const response = await axiosInstance.patch(`/front-office/visitors/${id}`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function getVisitorVisits(id: string | number): Promise<VisitorVisit[]> {
  const response = await axiosInstance.get(`/front-office/visitors/${id}/visits`);
  return response.data.data || response.data || [];
}

export async function getVisitorAppointments(id: string | number): Promise<VisitorAppointment[]> {
  const response = await axiosInstance.get(`/front-office/visitors/${id}/appointments`);
  return response.data.data || response.data || [];
}

export async function getVisitorAudit(id: string | number): Promise<VisitorAuditLog[]> {
  const response = await axiosInstance.get(`/front-office/visitors/${id}/audit`);
  return response.data.data || response.data || [];
}
