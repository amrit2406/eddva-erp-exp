import axiosInstance from '../../../lib/axios';
import type {
  InventoryIssue,
  InventoryIssueFormData,
  InventoryIssueQueryParams,
  InventoryIssueListResult,
  InventoryReturnFormData,
  InventoryRejectFormData,
  InventoryApprovalRule,
  InventoryApprovalRuleFormData,
} from '../types/issue.types';

export async function getIssues(params?: InventoryIssueQueryParams): Promise<InventoryIssueListResult> {
  const response = await axiosInstance.get('/inventory/issues', { params });
  return {
    data: response.data.data?.data || response.data.data || [],
    pagination: response.data.data?.pagination || response.data.pagination,
  };
}

export async function getIssue(id: string | number): Promise<InventoryIssue> {
  const response = await axiosInstance.get(`/inventory/issues/${id}`);
  return response.data.data || response.data;
}

export async function createIssue(data: InventoryIssueFormData): Promise<InventoryIssue> {
  const response = await axiosInstance.post('/inventory/issues', data);
  return response.data.data || response.data;
}

export async function approveIssue(id: string | number): Promise<InventoryIssue> {
  const response = await axiosInstance.post(`/inventory/issues/${id}/approve`);
  return response.data.data || response.data;
}

export async function rejectIssue(id: string | number, data: InventoryRejectFormData): Promise<InventoryIssue> {
  const response = await axiosInstance.post(`/inventory/issues/${id}/reject`, data);
  return response.data.data || response.data;
}

export async function returnIssue(id: string | number, data: InventoryReturnFormData): Promise<InventoryIssue> {
  const response = await axiosInstance.post(`/inventory/issues/${id}/return`, data);
  return response.data.data || response.data;
}

export async function getApprovalRules(): Promise<InventoryApprovalRule[]> {
  const response = await axiosInstance.get('/inventory/issues/approval-rules');
  return response.data.data || response.data || [];
}

export async function createApprovalRule(data: InventoryApprovalRuleFormData): Promise<InventoryApprovalRule> {
  const response = await axiosInstance.post('/inventory/issues/approval-rules', data);
  return response.data.data || response.data;
}
