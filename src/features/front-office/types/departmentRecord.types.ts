export type FrontOfficeDepartmentStatus = 'ACTIVE' | 'INACTIVE';

export interface FrontOfficeDepartment {
  department_id: number;
  name: string;
  status: FrontOfficeDepartmentStatus;
  created_at: string;
  updated_at?: string;
  _count?: {
    employees: number;
    appointments: number;
  };
}

export interface FrontOfficeDepartmentFormData {
  name: string;
}

export interface FrontOfficeDepartmentUpdateData {
  name?: string;
  status?: FrontOfficeDepartmentStatus;
}
