import axiosInstance from '../../../lib/axios';
import { cleanPayload } from '../utils/cleanPayload';
import type {
  FrontOfficeComplaint,
  ComplaintFormData,
  ComplaintUpdateFormData,
  AssignComplaintFormData,
  ChangeComplaintPriorityFormData,
  ChangeComplaintStatusFormData,
  EscalateComplaintFormData,
  FrontOfficeComplaintUpdate,
  CreateComplaintUpdateFormData,
  ComplaintListResult,
  ComplaintQueryParams,
} from '../types/complaintRecord.types';
import type { VisitorAuditLog } from '../types/visitorRecord.types';

export async function getComplaints(params?: ComplaintQueryParams): Promise<ComplaintListResult> {
  const response = await axiosInstance.get('/front-office/complaints', { params });
  return {
    data: response.data.data || [],
    pagination: response.data.pagination,
  };
}

export async function getComplaint(id: string | number): Promise<FrontOfficeComplaint> {
  const response = await axiosInstance.get(`/front-office/complaints/${id}`);
  return response.data.data || response.data;
}

export async function createComplaint(data: ComplaintFormData): Promise<FrontOfficeComplaint> {
  const response = await axiosInstance.post('/front-office/complaints', cleanPayload(data));
  return response.data.data || response.data;
}

export async function updateComplaint(
  id: string | number,
  data: ComplaintUpdateFormData
): Promise<FrontOfficeComplaint> {
  const response = await axiosInstance.patch(`/front-office/complaints/${id}`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function assignComplaint(
  id: string | number,
  data: AssignComplaintFormData
): Promise<FrontOfficeComplaint> {
  const response = await axiosInstance.patch(`/front-office/complaints/${id}/assign`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function changeComplaintPriority(
  id: string | number,
  data: ChangeComplaintPriorityFormData
): Promise<FrontOfficeComplaint> {
  const response = await axiosInstance.patch(`/front-office/complaints/${id}/priority`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function changeComplaintStatus(
  id: string | number,
  data: ChangeComplaintStatusFormData
): Promise<FrontOfficeComplaint> {
  const response = await axiosInstance.patch(`/front-office/complaints/${id}/status`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function resolveComplaint(id: string | number): Promise<FrontOfficeComplaint> {
  const response = await axiosInstance.post(`/front-office/complaints/${id}/resolve`);
  return response.data.data || response.data;
}

export async function closeComplaint(id: string | number): Promise<FrontOfficeComplaint> {
  const response = await axiosInstance.post(`/front-office/complaints/${id}/close`);
  return response.data.data || response.data;
}

export async function escalateComplaint(
  id: string | number,
  data: EscalateComplaintFormData
): Promise<FrontOfficeComplaint> {
  const response = await axiosInstance.post(`/front-office/complaints/${id}/escalate`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function createComplaintUpdate(
  id: string | number,
  data: CreateComplaintUpdateFormData
): Promise<FrontOfficeComplaintUpdate> {
  const response = await axiosInstance.post(`/front-office/complaints/${id}/updates`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function getComplaintUpdates(id: string | number): Promise<FrontOfficeComplaintUpdate[]> {
  const response = await axiosInstance.get(`/front-office/complaints/${id}/updates`);
  return response.data.data || response.data || [];
}

export async function getComplaintAudit(id: string | number): Promise<VisitorAuditLog[]> {
  const response = await axiosInstance.get(`/front-office/complaints/${id}/audit`);
  return response.data.data || response.data || [];
}
