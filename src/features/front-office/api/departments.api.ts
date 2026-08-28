import axiosInstance from '../../../lib/axios';
import type {
  FrontOfficeDepartment,
  FrontOfficeDepartmentFormData,
  FrontOfficeDepartmentUpdateData,
} from '../types/departmentRecord.types';

export async function getDepartments(search?: string): Promise<FrontOfficeDepartment[]> {
  const response = await axiosInstance.get('/front-office/departments', {
    params: search ? { search } : undefined,
  });
  return response.data.data || response.data || [];
}

export async function getDepartment(id: string | number): Promise<FrontOfficeDepartment> {
  const response = await axiosInstance.get(`/front-office/departments/${id}`);
  return response.data.data || response.data;
}

export async function createDepartment(data: FrontOfficeDepartmentFormData): Promise<FrontOfficeDepartment> {
  const response = await axiosInstance.post('/front-office/departments', data);
  return response.data.data || response.data;
}

export async function updateDepartment(
  id: string | number,
  data: FrontOfficeDepartmentUpdateData
): Promise<FrontOfficeDepartment> {
  const response = await axiosInstance.patch(`/front-office/departments/${id}`, data);
  return response.data.data || response.data;
}
