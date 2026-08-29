import axiosInstance from '../../../lib/axios';
import { cleanPayload } from '../utils/cleanPayload';
import type {
  FrontOfficeEnquiry,
  FrontOfficeEnquiryFormData,
  EnquiryUpdateFormData,
  AssignEnquiryFormData,
  ChangeEnquiryStatusFormData,
  FrontOfficeEnquiryFollowup,
  CreateFollowupFormData,
  FollowupWithEnquiry,
  EnquiryListResult,
  EnquiryQueryParams,
} from '../types/enquiryRecord.types';
import type { VisitorAuditLog } from '../types/visitorRecord.types';

export async function getEnquiries(params?: EnquiryQueryParams): Promise<EnquiryListResult> {
  const response = await axiosInstance.get('/front-office/enquiries', { params });
  return {
    data: response.data.data || [],
    pagination: response.data.pagination,
  };
}

export async function getEnquiry(id: string | number): Promise<FrontOfficeEnquiry> {
  const response = await axiosInstance.get(`/front-office/enquiries/${id}`);
  return response.data.data || response.data;
}

export async function createEnquiry(data: FrontOfficeEnquiryFormData): Promise<FrontOfficeEnquiry> {
  const response = await axiosInstance.post('/front-office/enquiries', cleanPayload(data));
  return response.data.data || response.data;
}

export async function updateEnquiry(id: string | number, data: EnquiryUpdateFormData): Promise<FrontOfficeEnquiry> {
  const response = await axiosInstance.patch(`/front-office/enquiries/${id}`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function assignEnquiry(id: string | number, data: AssignEnquiryFormData): Promise<FrontOfficeEnquiry> {
  const response = await axiosInstance.patch(`/front-office/enquiries/${id}/assign`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function changeEnquiryStatus(
  id: string | number,
  data: ChangeEnquiryStatusFormData
): Promise<FrontOfficeEnquiry> {
  const response = await axiosInstance.patch(`/front-office/enquiries/${id}/status`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function createEnquiryFollowup(
  id: string | number,
  data: CreateFollowupFormData
): Promise<FrontOfficeEnquiryFollowup> {
  const response = await axiosInstance.post(`/front-office/enquiries/${id}/followups`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function getEnquiryFollowups(id: string | number): Promise<FrontOfficeEnquiryFollowup[]> {
  const response = await axiosInstance.get(`/front-office/enquiries/${id}/followups`);
  return response.data.data || response.data || [];
}

export async function getEnquiryHistory(id: string | number): Promise<VisitorAuditLog[]> {
  const response = await axiosInstance.get(`/front-office/enquiries/${id}/history`);
  return response.data.data || response.data || [];
}

export async function getUpcomingFollowups(days?: number): Promise<FollowupWithEnquiry[]> {
  const response = await axiosInstance.get('/front-office/enquiries/followups/upcoming', {
    params: days ? { days } : undefined,
  });
  return response.data.data || response.data || [];
}

export async function getOverdueFollowups(): Promise<FollowupWithEnquiry[]> {
  const response = await axiosInstance.get('/front-office/enquiries/followups/overdue');
  return response.data.data || response.data || [];
}
