// Employee types shared across Front Office modules

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName?: string;
  designation: string;
  isActive: boolean;
  avatar?: string;
}

export interface EmployeeSelectOption {
  value: string;
  label: string;
  department?: string;
  designation?: string;
}
