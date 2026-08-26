import axiosInstance from '../../../lib/axios';
import type {
  BookIssue,
  BookIssueFormData,
  BookIssueReturnData,
  BookIssueRenewData,
  IssueDetail,
  IssueStatus,
  ReturnIssueResult,
} from '../types/library.types';

export async function getIssues(status?: IssueStatus): Promise<BookIssue[]> {
  const response = await axiosInstance.get('/library/issues', { params: status ? { status } : undefined });
  return response.data.data || response.data || [];
}

export async function createIssue(data: BookIssueFormData): Promise<BookIssue> {
  const response = await axiosInstance.post('/library/issues', data);
  return response.data.data || response.data;
}

export async function getOverdueIssues(): Promise<IssueDetail[]> {
  const response = await axiosInstance.get('/library/issues/overdue');
  return response.data.data || response.data || [];
}

export async function getIssue(id: string | number): Promise<IssueDetail> {
  const response = await axiosInstance.get(`/library/issues/${id}`);
  return response.data.data || response.data;
}

export async function returnIssue(id: string | number, data: BookIssueReturnData): Promise<ReturnIssueResult> {
  const response = await axiosInstance.post(`/library/issues/${id}/return`, data);
  return response.data.data || response.data;
}

export async function renewIssue(id: string | number, data: BookIssueRenewData): Promise<BookIssue> {
  const response = await axiosInstance.post(`/library/issues/${id}/renew`, data);
  return response.data.data || response.data;
}
