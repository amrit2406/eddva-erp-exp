// Department types shared across Front Office modules

export interface Department {
  id: string;
  name: string;
  code: string;
  headOfDepartment?: string;
  isActive: boolean;
}

export interface DepartmentSelectOption {
  value: string;
  label: string;
  code?: string;
}
