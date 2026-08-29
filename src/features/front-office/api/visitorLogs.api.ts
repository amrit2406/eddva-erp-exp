import axiosInstance from '../../../lib/axios';
import { cleanPayload } from '../utils/cleanPayload';
import type {
  VisitorLogSummary,
  VisitorLogDetail,
  VisitorLogListResult,
  VisitorLogQueryParams,
  CheckInFormData,
  CheckOutFormData,
} from '../types/visitorLog.types';

export async function checkInVisitor(data: CheckInFormData): Promise<VisitorLogDetail> {
  const response = await axiosInstance.post('/front-office/visitor-logs/check-in', cleanPayload(data));
  return response.data.data || response.data;
}

export async function getActiveVisitorLogs(): Promise<VisitorLogSummary[]> {
  const response = await axiosInstance.get('/front-office/visitor-logs/active');
  return response.data.data || response.data || [];
}

export async function getVisitorLogs(params?: VisitorLogQueryParams): Promise<VisitorLogListResult> {
  const response = await axiosInstance.get('/front-office/visitor-logs', { params });
  return {
    data: response.data.data || [],
    pagination: response.data.pagination,
  };
}

export async function getVisitorLog(id: string | number): Promise<VisitorLogDetail> {
  const response = await axiosInstance.get(`/front-office/visitor-logs/${id}`);
  return response.data.data || response.data;
}

export async function checkOutVisitor(id: string | number, data: CheckOutFormData): Promise<VisitorLogSummary> {
  const response = await axiosInstance.patch(`/front-office/visitor-logs/${id}/check-out`, data);
  return response.data.data || response.data;
}
